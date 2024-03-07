import { Message, Collection } from "discord.js";
import { AutomodClass, AutomodSetupInterface, automodtype } from "../../classes/moderation/automod";
import { ResponseClass } from "../../classes/Utility/Response";

const automodClass = AutomodClass.getInstance();
const violationsCollection: Collection<string, Collection<string, number>> = new Collection();

export default async (_: any, message: Message) => {
  const { guild, author, guildId, channelId, member } = message;
  const automodData = automodClass.AutomodCollection.get(guild?.id!);
  if (!automodData || author.bot) return;
  for (const rules of automodData.values()) {
    if (!rules.config || !rules.advancedSettings || !rules.enabled) continue;
    const { Channel, Role } = rules.advancedSettings;
    if (Channel.includes(channelId) || (member && Role.some(role => member.roles.cache.has(role)))) return;
    const content = filterContent(message.content) as string
    const time = Date.now()
    console.log(content)
    console.log(time - Date.now())
    switch (rules.type) {
      case "bannedwords": {
        const slursFound = checkForSlurs(content, rules);
        if (slursFound) {
          handleViolation(message, rules);
        }
        break;
      }

      case "massmention": {
        const mentionCount = content.match(/<@!?\d+>/g)?.length ?? 0;
        if (mentionCount >= rules.config[0].Limit! ?? 3) {
          handleViolation(message, rules);
        }
        break;
      }

      case "serverinvites": {

      }
        break;
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
    bannedwords: `${message.author} Your message has been removed for containing banned words.`,
    massmention: `${message.author} Your message has been removed for containing more mentions than allowed per message.`,
    phishinglinks: `${message.author} Your message has been removed for containing phishing links.`,
    serverinvites: `${message.author} Your message has been removed for containing server invites.`
  };

  return responses[ruleType] || `${message.author} Your message has been removed for violating server rules.`;
}

function checkForSlurs(content: string, slursConfig: AutomodSetupInterface) {
  return slursConfig.config?.some(rule => {
    switch (rule.filterType) {
      case "match":
        return rule.words?.some(word => content.toLowerCase() === word.toLowerCase());
      case "exact":
        return rule.words?.some(word => content === word);
      case "include":
        return rule.words?.some(word => content.toLowerCase().includes(word.toLowerCase()));
      case "wildcard":
        return rule.words?.some(word => {
          const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const wildcardPattern = escapedWord.replace(/\*/g, '[a-zA-Z0-9]*');
          const regex = new RegExp(`(${wildcardPattern})`, 'i');
          return regex.test(content);
        });

      default:
        return false;
    }
  });
}

function filterContent(content: string) {
  const reverseAlphabets = {};
  for (const alphabet in alphabets) {
    const alternatives = alphabets[alphabet as keyof typeof alphabets];
    for (const alternative of alternatives) {
      reverseAlphabets[alternative as keyof typeof reverseAlphabets] = alphabet as never;
    }
  }

  let converted = '';
  for (const char of content) {
    const alphabet = reverseAlphabets[char as keyof typeof reverseAlphabets];
    if (alphabet) {
      converted += alphabet;
    } else {
      converted += char; // If no matching alphabet, keep the original character
    }
  }
  return converted;
}

const alphabets = {
  a: ['a', 'ā', 'á', 'ǎ', 'à', '@', 'æ', 'å', 'ą', 'α', 'Δ', 'A', 'Ā', 'Á', 'Ǎ', 'À', 'Æ', 'Å', 'Ą', 'Α', '4', '^', 'ª', 'Ꭺ', '𝔄', '₳', '🄰', '𝐚', '𝒂', '𝓪', '𝔞', '𝕒', '𝖆', '𝖺', '𝗮', '𝘢', '𝙖', '𝚊'],
  b: ['b', 'β', '8', 'ß', 'B', 'β', '8', 'ß', '₿', '🅱', '𝐛', '𝒃', '𝓫', '𝔟', '𝕓', '𝖇', '𝖻', '𝗯', '𝘣', '𝙗', '𝚋'],
  c: ['c', 'ç', 'ć', 'č', '¢', '©', 'C', 'Ç', 'Ć', 'Č', 'Ĉ', 'Ċ', 'Ƈ', 'Ȼ', '¢', '©', '𝐂', '𝒄', '𝓬', '𝔠', '𝕔', '𝖈', '𝖼', '𝗰', '𝘤', '𝙘', '𝚌'],
  d: ['d', 'ð', 'ď', 'đ', 'D', 'Ð', 'Ď', 'Đ', '𝐝', '𝒅', '𝓭', '𝔡', '𝕕', '𝖉', '𝖽', '𝖣', '𝗱', '𝘥', '𝙙', '𝚍'],
  e: ['e', 'ē', 'é', 'ě', 'è', '€', 'ê', 'ë', 'ę', '∑', '3', 'E', 'Ē', 'É', 'Ě', 'È', 'Ê', 'Ë', 'Ę', 'Σ', '€', '𝐞', '𝒆', '𝓮', '𝔢', '𝕖', '𝖊', '𝖾', '𝗲', '𝘦', '𝙚', '𝚎'],
  f: ['f', 'ƒ', 'F', 'Ƒ', '𝐟', '𝒇', '𝓯', '𝔣', '𝕗', '𝖋', '𝖿', '𝗳', '𝘧', '𝙛', '𝚏'],
  g: ['g', 'ğ', 'ģ', 'ĝ', 'ġ', 'G', 'Ğ', 'Ģ', 'Ĝ', 'Ġ', 'Ǵ', 'Ǧ', 'Ǥ', 'Ɠ', '𝐠', '𝒈', '𝓰', '𝔤', '𝕘', '𝖌', '𝗀', '𝗴', '𝘨', '𝙜', '𝚐'],
  h: ['h', 'ħ', 'ĥ', 'H', 'Ħ', 'Ĥ', '𝐡', '𝒉', '𝓱', '𝔥', '𝕙', '𝖍', '𝗁', '𝗵', '𝘩', '𝙝', '𝚑'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì', 'ï', 'î', 'į', '¡', 'ι', 'ǀ', 'I', 'Ī', 'Í', 'Ǐ', 'Ì', 'Ï', 'Î', 'Į', 'Ι', '𝐢', '𝒊', '𝓲', '𝔦', '𝕚', '𝖎', '𝗂', '𝗶', '𝘪', '𝙞', '𝚒', '!', '𝚨', '𝙸', '𝛪', '𝜤', '𝝞', '𝞘'],
  j: ['j', 'ĵ', 'J', 'Ĵ', '𝐣', '𝒋', '𝓳', '𝔧', '𝕛', '𝖏', '𝗃', '𝗷', '𝘫', '𝙟', '𝚓'],
  k: ['k', 'κ', 'ķ', 'K', 'Κ', 'Ķ', '𝐤', '𝒌', '𝓴', '𝔨', '𝕜', '𝖐', '𝗄', '𝗸', '𝘬', '𝙠', '𝚔'],
  l: ['l', 'ł', 'ľ', 'ĺ', 'ļ', '1', '|', '£', 'L', 'Ł', 'Ľ', 'Ĺ', 'Ļ', '£', 'Ł', 'Ļ', '𝐥', '𝒍', '𝓵', '𝔩', '𝕝', '𝖑', '𝗅', '𝗹', '𝘭', '𝙡', '𝚕', '1', '|', '£', 'Ł', 'Ļ'],
  m: ['m', 'm', 'μ', 'м', 'M', 'M', 'Μ', 'М', '𝐦', '𝒎', '𝓶', '𝔪', '𝕞', '𝖒', '𝗆', '𝗺', '𝘮', '𝙢', '𝚖'],
  n: ['n', 'ñ', 'ń', 'ň', 'ņ', 'η', 'ή', 'η', 'N', 'Ñ', 'Ń', 'Ň', 'Ņ', 'Ɲ', 'ɴ', 'И', 'П', '𝐧', '𝒏', '𝓷', '𝔫', '𝕟', '𝖓', '𝗇', '𝗻', '𝘯', '𝙣', '𝚗'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò', 'ö', 'ô', 'õ', 'ø', 'θ', 'º', 'ø', 'ө', 'O', 'Ō', 'Ó', 'Ǒ', 'Ò', 'Ö', 'Ô', 'Õ', 'Ø', 'Θ', 'Ο', 'О', '𝐨', '𝒐', '𝓸', '𝔬', '𝕠', '𝖔', '𝗈', '𝗼', '𝘰', '𝙤', '𝚘'],
  p: ['p', 'ρ', 'φ', 'þ', 'ρ', 'P', 'Ρ', 'Φ', 'Þ', 'Ρ', '𝐩', '𝒑', '𝓹', '𝔭', '𝕡', '𝖕', '𝗉', '𝗽', '𝘱', '𝙥', '𝚙'],
  q: ['q', 'Q', '𝐪', '𝒒', '𝓺', '𝔮', '𝕢', '𝖖', '𝗊', '𝗾', '𝘲', '𝙦', '𝚚'],
  r: ['r', 'ř', 'ŕ', '®', 'Я', 'R', 'Ř', 'Ŕ', '®', 'Я', '𝐫', '𝒓', '𝓻', '𝔯', '𝕣', '𝖗', '𝗋', '𝗿', '𝘳', '𝙧', '𝚛'],
  s: ['s', 'š', 'ś', 'ş', 'ß', '$', 'S', 'Š', 'Ś', 'Ş', '$', '§', '𝐬', '𝒔', '𝓼', '𝔰', '𝕤', '𝖘', '𝗌', '𝘀', '𝘴', '𝙢', '𝚜'],
  t: ['t', 'ť', 'ţ', 'т', '†', 'T', 'Ť', 'Ţ', 'Ŧ', '†', '𝐭', '𝒕', '𝓽', '𝔱', '𝕥', '𝖙', '𝗍', '𝘁', '𝘵', '𝙩', '𝚝'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù', 'ü', 'û', 'μ', 'υ', 'ű', 'U', 'Ū', 'Ú', 'Ǔ', 'Ù', 'Ü', 'Û', 'Ũ', 'Ū', 'Μ', 'Υ', 'Ű', '𝐮', '𝒖', '𝓾', '𝔲', '𝕦', '𝖚', '𝗎', '𝘂', '𝘶', '𝙪', '𝚞'],
  v: ['v', 'ν', 'V', 'V', 'Ν', '𝐯', '𝒗', '𝓿', '𝔳', '𝕧', '𝖛', '𝗏', '𝘃', '𝘷', '𝙫', '𝚟'],
  w: ['w', 'ω', 'ψ', 'ω', 'ш', 'W', 'Ω', 'Ψ', 'Ω', 'Ш', '𝐰', '𝒘', '𝓌', '𝔴', '𝕨', '𝖜', '𝗐', '𝘄', '𝘸', '𝙬', '𝚠'],
  x: ['x', 'χ', 'X', 'Χ', '𝐱', '𝒙', '𝓍', '𝔁', '𝔳', '𝕩', '𝖝', '𝗑', '𝘅', '𝘹', '𝙭', '𝚡'],
  y: ['y', 'y', 'ý', 'ŷ', 'ÿ', '¥', 'Y', 'Ý', 'Ŷ', 'Ÿ', '¥', '𝐲', '𝒚', '𝓎', '𝔂', '𝕪', '𝖞', '𝗒', '𝘆', '𝘺', '𝙮', '𝚢'],
  z: ['z', 'ž', 'ź', 'ż', 'ζ', 'Z', 'Ž', 'Ź', 'Ż', 'Ζ', '𝐳', '𝒛', '𝓏', '𝔃', '𝕫', '𝖟', '𝗓', '𝘇', '𝘻', '𝙯'],
};
