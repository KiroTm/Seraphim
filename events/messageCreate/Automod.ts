import { Message, Collection, GuildMember } from "discord.js";
import { AutomodClass, AutomodSetupInterface } from "../../classes/moderation/automod";
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
          Violation.add(guildId!, author.id);

          const violations = (violationsCollection.get(guildId!)?.get(author.id) ?? 0) + 1;
          const advanced = violations === rules.advancedSettings?.Threshold ?? false

          handleBannedWords(message, rules, advanced);
        }
        break;
      }
      case "massmention": {

        break;
      }
    }
  }
};

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

function handleBannedWords(message: Message, rules: AutomodSetupInterface, limit: boolean) {
  const { guildId, author } = message;
  if (limit) {
    message.channel.send("Limit has been reached");
    Violation.reset(guildId!, author.id);
  }
  try {
    message.delete();
    new ResponseClass().sendTemporaryMessage(message, {
      content: rules.customResponse ?? `${message.author} your message contains banned words and has been removed.`,
      allowedMentions: { users: [message.author.id] }
    }, '3s', 'Create');
  } catch (_) { }
}
