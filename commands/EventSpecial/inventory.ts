import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";
import { DropClass, dropTypes } from "../../classes/EventSpecial/drops";
const dropsClass = DropClass.getInstance()
const memberClass = new MemberClass()
export default {
    name: "inventory",
    description: 'Get your inventory',
    type: CommandType.legacy,
    cooldowns: {
        Duration: '5s'
    },
    aliases: ['inv'],
    callback: async ({ message, args, guild }: Callback) => {
        const member = memberClass.fetch(guild, args[0] ?? message.author.id, message) as GuildMember
        if (!dropsClass.DropsSetupData.get(`${message.guildId}`)) return;
        const Inventory = dropsClass.DropsData.get(member.id)
        if (!Inventory) return message.channel.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription('Absolutely nothing, not even an atom.')]})
        const map = Inventory.map((value, key) => `${dropTypes[key]?.emoji} **${key}** - ${value}`)
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${member.user.username}`,
                    iconURL: `${member.user.displayAvatarURL({forceStatic: false})}`
                })
                .setColor('Blue')
                .setDescription(map.join("\n"))
            ]
        })
    }
} as Command