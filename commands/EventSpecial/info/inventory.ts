import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../typings";
import { MemberClass } from "../../../classes/misc/member";
import { CrateType, dropTypes } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { AllItems } from "../../../classes/EventSpecial/types";
import { Messagepagination } from "../../../functions/utility/pagination";
const memberClass = new MemberClass()
const Inventory = InventoryClass.getInstance()
export default {
    name: "inventory",
    description: 'Get your inventory',
    type: CommandType.legacy,
    cooldowns: {
        Duration: '15s'
    },
    aliases: ['inv'],
    callback: async ({ message, args, guild }: Callback) => {
        const member = memberClass.fetch(guild, args[0] ?? message.author.id, message) as GuildMember
        const inventory = Inventory.getInventory(member)
        if (!inventory.length) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription("Honestly, I would leave the server if I had nothing in my inventory.")] })
        const GenerateEmbeds = (items: { name: string; amount: number }[]) => {
            const itemPerPage = 10;
            const embeds = [];
            let currentEmbed = new EmbedBuilder().setColor('Blurple').setAuthor({name: `${member.user.username}'s Inventory`, iconURL: `${member.user.displayAvatarURL({forceStatic: false})}`}).setFields({name: '⚠️ Caution', value: `This data might not be up to date, and any changes in your inventory made after executing this command will be considered during the next command run.\nCommand was ran: <t:${Math.floor(Date.now()/1000)}:R>`})

            for (const item of items) {
                const Item = (Object.entries(AllItems).find((v) => v![1]?.name.toLowerCase() === item.name.toLowerCase()))?.[1]! || dropTypes[item.name as CrateType];
                const Amount = item.amount;
                const itemString = `${Item?.emoji ?? ''} **${item?.name} – ${Amount ?? 0}**\n${`> *${Item?.description}*` || ''}`

                currentEmbed.setDescription((`${currentEmbed?.data?.description ?? ''}`) + itemString + '\n\n');

                if (currentEmbed.data.description!.split('\n').length > itemPerPage) {
                    embeds.push(currentEmbed);
                    currentEmbed = new EmbedBuilder().setColor('Blurple')
                }
            }

            if (currentEmbed.data.description) {
                embeds.push(currentEmbed);
            }

            return embeds;
        };

        const InventoryMap = GenerateEmbeds(inventory);

        Messagepagination(message, InventoryMap, 90 * 1000);

    }
} as Command