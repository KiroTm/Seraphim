import { Message, Collection } from "discord.js";
import { AutomodClass, AutomodSetupInterface, automodtype } from "../../classes/moderation/automod";
import { ResponseClass } from "../../classes/Utility/Response";

const automodClass = AutomodClass.getInstance();
const violationsCollection: Collection<string, Collection<string, number>> = new Collection();

export default async (_: any, message: Message) => {
  const { guild, author, content, guildId, channelId, member } = message;
  const automodData = automodClass.AutomodCollection.get(guild?.id!);
  if (!automodData || author.bot) return;
  for (const rules of automodData.values()) {
    if (!rules.config || !rules.advancedSettings) continue;
    const { Channel, Role } = rules.advancedSettings;
    if (Channel.includes(channelId) || (member && Role.some(role => member.roles.cache.has(role)))) return;

    switch (rules.type) {
      case "bannedwords": {
        const slursFound = rules.config.some(rule => rule.words?.some(word => content.toLowerCase().includes(word.toLowerCase())));
        if (slursFound) {
          handleViolation(message, rules);
        }
        break;
      }
      case "massmention": {
        // Implement mass mention handling
        const mentionCount = content.match(/<@!?\d+>/g)?.length ?? 0;
        if (mentionCount >= rules.config[0].Limit! ?? 3) {
          handleViolation(message, rules);
        }
        break;
      }
    }
  }
};

function handleViolation(message: Message, rules: AutomodSetupInterface) {
  const { guildId, author } = message;
  const violations = (violationsCollection.get(guildId!)?.get(author.id) ?? 0) + 1;
  const advanced = violations === rules.advancedSettings?.Threshold ?? false;
  Violation.add(guildId!, author.id);
  if (advanced) {
    Violation.reset(guildId!, author.id);
  }

  try {
    message.delete();
    new ResponseClass().sendTemporaryMessage(message, {
      content: rules.customResponse ?? getResponse(rules.type, message),
      allowedMentions: { users: [message.author.id] }
    }, '3s', 'Create');
  } catch (_) { }
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
    bannedwords: `${message.author} Your message has been removed for containing banned words.`,
    massmention: `${message.author} Your message has been removed for containing more mentions than allowed per message.`,
    phishinglinks: `${message.author} Your message has been removed for containing phishing links.`,
    serverinvites: `${message.author} Your message has been removed for containing server invites.`
  };

  return responses[ruleType] || `${message.author} Your message has been removed for violating server rules.`;
}
