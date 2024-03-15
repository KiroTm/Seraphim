import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, GuildMember, Interaction, Message } from "discord.js";
import { ItemClass } from "../../Classes/item";
import { ResponseClass } from "../../../../../classes/Utility/Response";
import { Callback, Command } from "../../../../../Main-Handler/typings"
import { InventoryClass } from "../../Classes/inventory";
const itemClass = new ItemClass()
const responseClass = new ResponseClass()
const inventoryClass = InventoryClass.getInstance()
export default {
    name: 'sell',
    description: 'sell items!',
    args: {
        maxArgs: 2,
        minArgs: 2,
        CustomErrorMessage: "{PREFIX}{COMMAND} <item name> <amount>"
    },
    cooldown: {
        Duration: '15s',
        CustomCooldownMessage: "Woah woah, tryna sell the whole inventory? Calm down"
    },
    callback: async ({ message, args, instance}: Callback) => {
        const member = message.member as GuildMember
        const item = itemClass.getItem(args[0] ?? undefined)
        const amount = (parseInt(args[1])) as number
        const inventory = inventoryClass.getInventory(member)
        if (!item) return responseClass.error(instance, message, { embeds: [new EmbedBuilder().setColor('Red').setDescription('Invalid item! Please make sure the item name is valid!')]}, { commandName: 'buy', cooldownType: 'perGuildCooldown' }, 'MessageReply')
        if (!amount || !Number.isInteger(amount) || amount < 1) return responseClass.error(instance, message, { embeds: [new EmbedBuilder().setColor('Red').setDescription('Amount should be greater than 1.')]}, { commandName: 'buy', cooldownType: 'perGuildCooldown' }, 'MessageReply')
        if (!item.price?.sellPrice) return responseClass.error(instance, message, { embeds: [new EmbedBuilder().setColor('Red').setDescription(`${item.name} cannot be sold!`)]}, { commandName: 'buy', cooldownType: 'perGuildCooldown' }, 'MessageReply')
        const itemInInventory = inventory.find((value) => value.name.toLowerCase().includes(item.name.toLowerCase()))
        if (!itemInInventory || itemInInventory.amount < amount) return responseClass.error(instance, message, { embeds: [new EmbedBuilder().setColor('Red').setDescription(`You don't have that many ${item.name}!`)]}, { commandName: 'buy', cooldownType: 'perGuildCooldown' }, 'MessageReply')
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${message.id}1`).setStyle(ButtonStyle.Primary).setLabel("Buy"), new ButtonBuilder().setCustomId(`${message.id}2`).setStyle(ButtonStyle.Danger).setLabel("Cancel"))
        const itemEmbed = await itemClass.generate(message, item.name, true) as Message | EmbedBuilder
        if ('content' in itemEmbed) return;
        const response = await message.channel.send({content: `${message.author} Are you sure you want to sell ${amount} ${item.name} ${amount == 1 ? '' : 's'}`, embeds: [itemEmbed.setFooter({text: "This message will expire in 15 seconds.", iconURL: `${message.client.user.displayAvatarURL()}`})], components: [row]})
        const collector = response.createMessageComponentCollector({filter: (Int: Interaction) => Int.user.id == message.author.id, max: 1, maxUsers: 1, time: 15 * 1000})
        collector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                await response.edit({content: `${response.content} You didn't respond in time`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red')], components: []})
                return;
            };
            const interaction = collected.values().next().value as ButtonInteraction
            await interaction.reply({embeds: [new EmbedBuilder().setColor('Blue').setDescription("Initiating your request... <a:loading:1166992405199859733>")], ephemeral: true})
            const { customId } = interaction
            if (customId == `${message.id}2`) {
                response.edit({content: `${message.author} Alright! I've cancelled your request!` , embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: []}).catch(() => {})
                await interaction.editReply({embeds: [new EmbedBuilder().setColor('Red').setAuthor({iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}`}).setDescription(`<:fail:1146683470114996274> You cancelled the request!`)]})
                return;
            } else if (customId == `${message.id}1`) {
                const reply = inventoryClass.sellItem(member, inventory, item, amount)
                if (reply == 'InsufficientItem') {
                    response.edit({content: `${message.author} Request failed!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: []}).catch(() => {})
                    interaction.editReply({embeds: [new EmbedBuilder().setColor('Red').setAuthor({iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}`}).setDescription(`<:fail:1146683470114996274> You don't have  ${item.emoji ?? null} ${item.name} \`x${amount}\``)]})
                    return;
                };
                response.edit({content: `${message.author} Request Complete!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Green').setFields({name: 'You have', value: `**${inventory.find((value) => value.name.toLowerCase() == item.name.toLowerCase())?.amount ?? 0}**`}).setFooter(null)], components: []}).catch(() => {})
                await interaction.editReply({embeds: [new EmbedBuilder().setColor('Green').setAuthor({iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}`}).setDescription(`<:success:1146683498766291024> You sold ${item.name} \`x${amount}\``)]})
            }
        })
    }
} as Command