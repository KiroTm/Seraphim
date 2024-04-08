import { AdvancedSettingFields, AutomodClass, AutomodSetupInterface, automodtype } from "../../Classes/moderation/Automod/automod";
import { ModlogType, Modlogs } from "../../Classes/moderation/modlogs";
import { Message, Collection, Role, EmbedBuilder } from "discord.js";
import { ResponseClass } from "../../Classes/Utility/Response";
import { WarnClass } from "../../Classes/moderation/warn";
import { MuteClass } from "../../Classes/moderation/mute";
import ms from "ms";
const muteClass = MuteClass.getInstance();
const modlogClass = Modlogs.getInstance()
const warnClass = WarnClass.getInstance();
const automodClass = AutomodClass.getInstance();
const violationsCollection: Collection<string, Collection<string, number>> = new Collection();
const linkCooldownCollection: Collection<string, Collection<string, number>> = new Collection();
const messageTimestamps: Collection<string, Collection<string, any>> = new Collection();
export default async (_: any, oldMessage: Message, newMessage: Message | undefined) => {
  const message = newMessage ?? oldMessage;
  const { author, guildId, channelId, member } = message;
  const automodData = automodClass.AutomodCollection.get(guildId!);
  if (!automodData || author.bot) return;

  for (const rules of automodData.rules.values()) {
    if (!rules.enabled) return;
    let advancedSettings = rules.advancedSettings ?? automodData.defaultAdvancedSettings  ?? undefined
    if (advancedSettings && advancedSettings.Channel.includes(channelId) || (member && advancedSettings?.Role.some(role => member.roles.cache.has(role)))) return;
    const content = message.content as string
    switch (rules.type) {
      case automodtype.BannedWords: {
        if (!rules.config) return;
        const slursFound = checkForSlurs(content, rules);
        if (slursFound) handleViolation(message, rules)
        break;
      }

      case automodtype.MassMention: {
        if (!rules.config) return;
        const mentionCount = content.match(/<@!?\d+>/g)?.length ?? 0;
        if (mentionCount >= rules.config[0]?.Query! ?? 3) handleViolation(message, rules, advancedSettings)
        break;
      }

      case automodtype.ServerInvites: {
        const inviteRegex = /\b(?:discord\.com\/invite|discord\.gg)\/[a-zA-Z0-9]+/g;
        if (inviteRegex.test(content)) handleViolation(message, rules, advancedSettings)
        break;
      }

      case automodtype.PhishingLinks: {

        break;
      }

      case automodtype.MassEmoji: {
        if (!rules.config) return;
        const emojiCount = message.content.split(/<:.*?:\d+>|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g).length - 1;
        if (emojiCount >= (rules.config[0]?.Query ?? 3)) handleViolation(message, rules, advancedSettings)
        break;
      }

      case automodtype.LinkCooldown: {
        if (!rules.config) return;
        const cooldownLimit = rules.config[0]?.Query || 30000;
        const currentTime = Date.now();
        const linkRegex = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
        const containsLink = linkRegex.test(content);

        if (!containsLink) return;
        const guildCooldowns = linkCooldownCollection.get(guildId!) ?? new Collection<string, number>();
        const userLastLinkTimestamp = guildCooldowns.get(author.id) ?? 0;
        if (currentTime - userLastLinkTimestamp < cooldownLimit) {
          handleViolation(message, rules, advancedSettings);
        } else {
          guildCooldowns.set(author.id, currentTime);
          linkCooldownCollection.set(guildId!, guildCooldowns);
        }
        break;
      }


      case automodtype.NewLines: {
        if (/\n\s*\n\s*/.test(content)) handleViolation(message, rules, advancedSettings)
        break;
      }

      case automodtype.ChatFlood: {
        if (/(\w+)\1{50,}/.test(content)) handleViolation(message, rules, advancedSettings)
        break;
      }

      case automodtype.FastMessage: {
        const { config } = rules;
        if (!config) return;

        const numMessagesAllowed = config[0]?.Query ?? 7;
        const timeWindow = 5000;

        if (!messageTimestamps.has(guildId!)) messageTimestamps.set(guildId!, new Collection());
        const userTimestamps = messageTimestamps.get(guildId!)!;

        const currentTime = Date.now();
        const timestamps = userTimestamps.get(author.id) || [];

        const recentTimestamps = timestamps.filter((timestamp: any) => currentTime - timestamp < timeWindow);

        recentTimestamps.length >= numMessagesAllowed ? handleViolation(message, rules, advancedSettings) : userTimestamps.set(author.id, [...recentTimestamps, currentTime]);

        break;
      }

      case automodtype.AllCaps: {
        const contentWithoutSpaces = content.replace(/\s+/g, '');
        const totalChars = contentWithoutSpaces.length;
        if (totalChars <= 10) break;
        const uppercaseChars = contentWithoutSpaces.replace(/[^A-Z]/g, '').length;
        const uppercasePercentage = uppercaseChars / totalChars;
        if (uppercasePercentage >= 0.75) handleViolation(message, rules, advancedSettings);
        break;
      }
    }
  };
}
function handleViolation(message: Message, rules: AutomodSetupInterface, advancedSetting?: AdvancedSettingFields) {
  const { guildId, author } = message;
  const violations = (violationsCollection.get(guildId!)?.get(author.id) ?? 0) + 1;
  const advanced = (violations === advancedSetting?.Threshold)
  Violation.add(guildId!, author.id);
  if (advanced) {
    Violation.reset(guildId!, author.id)
    if (advancedSetting?.Action) performCustomAction(rules, message, advancedSetting ?? undefined)
  }
  message.delete().catch(() => { });
  new ResponseClass().sendTemporaryMessage(message, {
    content: rules.customResponse ?? getResponse(rules.type, message),
    allowedMentions: { users: [message.author.id] }
  }, '3s', 'Create');
}

const Violation = {
  add: (guildId: string, authorId: string) => {
    const guildViolations = violationsCollection.get(guildId) ?? new Collection<string, number>();
    const userViolations = guildViolations.get(authorId) ?? 0;
    violationsCollection.set(guildId, guildViolations.set(authorId, userViolations + 1));
  },
  reset: (guildId: string, authorId: string) => {
    const guildViolations = violationsCollection.get(guildId);
    const userViolations = guildViolations?.get(authorId);
    if (!guildViolations || !userViolations) return;
    violationsCollection.set(guildId, guildViolations.set(authorId, 0))
  }
}

function getResponse(ruleType: automodtype, message: Message) {
  const responses: Record<automodtype, string> = {
    [automodtype.BannedWords]: `${message.author} Your message has been flagged for containing banned words.`,
    [automodtype.ServerInvites]: `${message.author} Your message has been flagged for containing server invites.`,
    [automodtype.PhishingLinks]: `${message.author} Your message has been flagged for containing phishing links.`,
    [automodtype.MassMention]: `${message.author} Your message has been flagged for containing more mentions than allowed per message.`,
    [automodtype.MassEmoji]: `${message.author} Your message has been flagged for containing excessive emojis.`,
    [automodtype.LinkCooldown]: `${message.author} Please refrain from posting links too frequently.`,
    [automodtype.NewLines]: `${message.author} Your message has been flagged for excessive use of new lines.`,
    [automodtype.ChatFlood]: `${message.author} Your message has been flagged for flooding the chat.`,
    [automodtype.FastMessage]: `${message.author} Your message has been flagged for being sent too quickly.`,
    [automodtype.AllCaps]: `${message.author} Your message has been flagged for excessive use of capital letters.`,
  };

  return responses[ruleType] || `${message.author} Your message has been flagged for violating server rules.`;
}


function checkForSlurs(content: string, slursConfig: AutomodSetupInterface) {
  const args = content.split(/\s+/);
  return slursConfig.config?.some(rule => {
    switch (rule.filterType) {
      case "match":
        return rule.words?.some(word => args.some((arg) => arg.toLowerCase() === word.toLowerCase()));
      case "exact":
        return rule.words?.some(word => args.some((arg) => arg === word));
      case "include":
        return rule.words?.some(word => content.toLowerCase().includes(word.toLowerCase()));

      default:
        return false;
    }
  });
}

function performCustomAction(rule: AutomodSetupInterface, message: Message, advancedSettings?: AdvancedSettingFields) {
  const { type } = rule
  if (!advancedSettings) return;
  const Action = advancedSettings.Action
  if (!Action) return;
  let duration;
  if (advancedSettings.Duration) duration = advancedSettings.Duration
  switch (Action) {
    case "Mute": {
      const timeString = duration ? `for ${ms(duration, { long: true })}` : '';
      const reason = `Automod : ${type}`
      message.author.send({ embeds: [new EmbedBuilder().setColor("Blue").setDescription(`**You were muted in ${message.guild?.name} ${timeString} | ${reason}**\nModerator: ${message.guild?.members.me?.user.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp / 1000))}:R>`)] }).catch((r) => { })
      const mutedRole = message.guild?.roles.cache.find((r) => r.name.toLowerCase() === "muted") as Role
      const expirationTime = duration ? Date.now() + duration : null
      muteClass.mute(message.member!, mutedRole, reason, expirationTime)
    }
      break;

    case "Warn": {
      const reason = `Automod: ${type}`
      warnClass.warn(message.member!, message.guild?.members.me!, reason)
      message.member?.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription(`**You were warned in ${message.guild!.name} | ${reason}**\nModerator: ${message.guild?.members.me?.user.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp / 1000))}:R>`)] }).catch((r) => { })
    }
      break;

    case "Kick": {
      const reason = `Automod: ${type}`
      if (!message.member?.kickable) return;
      message.member?.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription(`**You were kicked from ${message.guild!.name} | ${reason}**\nModerator: ${message.guild?.members.me?.user.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp / 1000))}:R>`)] }).catch((r) => { }).then(() => {
        message.member?.kick(reason).catch(() => {})
      })
      modlogClass.create(message.member!, message.guild?.members.me!, ModlogType.Kick, reason)
    }
      break;

    case "Ban": {

    }
      break;
  }
}

export const config = {
  prerequisiteEvents: ['messageCreate', 'messageUpdate']
}
