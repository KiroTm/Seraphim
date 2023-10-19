import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";
import { DropClass, dropTypes } from "../../classes/EventSpecial/drops";
import { InventoryClass } from "../../classes/EventSpecial/inventory";
import AllItems from "../../classes/EventSpecial/types";
const memberClass = new MemberClass()
const Inventory  = InventoryClass.getInstance()
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
        const inventory = Inventory.getInventory(member)
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${member.user.username}`,
                    iconURL: `${member.user.displayAvatarURL()}`
                })
                .setColor('Blue')
                .setTitle(`${member.user.username}'s Inventory`)
                .setDescription(inventory.map((value) => {
                    const item = AllItems[value.name] || dropTypes[value.name] || undefined;
                    if (!item) return;
                    return `${item.emoji} **${item.name || value.name} – ${value.amount}**\n<:branch_90_curved:1161486023814025266>${item.description}\n<:branch_tail_curved:1161479147839828018>${item.info?.type || "Crate"}`
                }).join("\n") || "Absolutely nothing, as rich as a begger")
            ]
        })
    }
} as Command