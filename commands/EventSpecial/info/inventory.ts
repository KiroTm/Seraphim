import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../typings";
import { MemberClass } from "../../../classes/misc/member";
import { CrateType, dropTypes } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { AllItems } from "../../../classes/EventSpecial/types";
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
                    const item = AllItems[Object.entries(AllItems).find((v) => v[1].name == value.name)?.[0]!] || dropTypes[value.name as CrateType] || undefined
                    if (!item) return;
                    return `${item?.emoji} **${item?.name || value?.name} (${item.info?.type || "Crate"}) – ${value?.amount}**\n<:branch_tail_curved:1161479147839828018>${item?.description}`
                }).join("\n\n") || "Absolutely nothing, as rich as a begger")
            ]
        })
    }
} as Command