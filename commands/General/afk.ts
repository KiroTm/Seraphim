import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { AfkClass } from "../../classes/misc/afk";
const afkClass = AfkClass.getInstance()
export default {
    name: "afk",
    description: "AFK",
    type: CommandType.legacy,
    cooldown: {
        Duration: '10s',
        Type: 'perGuildCooldown'
    },
    callback: async ({message, args}: Callback) => {
        const userId = message.author.id
        const guildId = message.guildId
        const key = `${userId}-${guildId}`
        const Collection = afkClass.findOne(key)
        if (Collection) {
            afkClass.deleteOne(key)
            return message.channel.send(`Welcome back${message.author}! I removed your AFK`)
        }
        const Reason = args.join(' ').replace(/-/g, "").replace(/.gg\//g, '') || 'AFK'
        const object = { Reason: Reason || 'AFK', Timestamp: (message.createdTimestamp) }
        afkClass.create(key, object)
        message.channel.send({content: `${message.author} I've set your AFK: ${Reason}`, allowedMentions: {roles: [], users: []}})
    },
    extraInfo: {
        command_usage: "{PREFIX}{COMMAND} reason",
        command_example: "{PREFIX}{COMMAND}\n{PREFIX}{COMMAND} sleeping"
    }
} as Command