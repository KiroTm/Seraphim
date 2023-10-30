import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, GuildMember, Interaction, Message, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../../typings";
import { CraftingClass } from "../../../classes/EventSpecial/crafting"
import { ItemClass } from "../../../classes/EventSpecial/item";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
const craftingClass = new CraftingClass()
const itemClass = new ItemClass()
const inventoryClass = InventoryClass.getInstance()
export default {
    name: "craft",
    description: "Craft items using materials!",
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}{COMMAND} item-name"
    },
    callback: async ({ message, args, client }: Callback) => {
        let item = args[0]
        const ItemRecipe = new CraftingClass().getMaterials(item)
        const member = message.member as GuildMember
        if (ItemRecipe == 'Invalid Item') return message.channel.send(`${message.author} Invalid Item!`)
        if (ItemRecipe == 'Not Craftable') return message.channel.send(`${message.author} Item cannot be crafted!`)
        const itemEmbed = itemClass.generate(message, item, true) as EmbedBuilder | Message
        if ('content' in itemEmbed) return;
        const response = await message.channel.send({content: `${message.author} Are you sure you want craft ${item}`, embeds: [itemEmbed.setColor('Blue').setFooter({ text: "This message will expire in 15 seconds.", iconURL: `${message.client.user.displayAvatarURL()}` })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${message.id}1`).setStyle(ButtonStyle.Primary).setLabel("Yes"), new ButtonBuilder().setCustomId(`${message.id}2`).setStyle(ButtonStyle.Secondary).setLabel("No"))] })
        const collector = response.createMessageComponentCollector({ filter: (int: Interaction) => int.user.id === message.author.id, maxUsers: 1, max: 1, time: 10000 })
        collector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                await response.edit({ content: `${response.content} You didn't respond in time`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: [] })
                return;
            };
            const interaction = collected.values().next().value as ButtonInteraction
            await interaction.reply({ embeds: [new EmbedBuilder().setColor('Blue').setDescription("Crafting... <a:loading:1166992405199859733>")], ephemeral: true })
            if (interaction.customId == `${message.id}2`) {
                response.edit({ content: `${message.author} I've cancelled your craft!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: [] }).catch(() => { })
                await interaction.editReply({ embeds: [new EmbedBuilder().setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` }).setColor('Red').setDescription("Alrighty! Cancelled your request.")] })
            } else if (interaction.customId == `${message.id}1`) {
                const inventory = inventoryClass.getInventory(member)
                const craft = craftingClass.craftItem(member, item, ItemRecipe);
                if (!(typeof craft == 'object')) {
                    response.edit({ content: `${message.author} You don't have enough materials to craft that!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: [] }).catch(() => { })
                    await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setAuthor({ iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}` }).setDescription(`<:fail:1146683470114996274> You don't have enough materials to craft this item!`)] })
                    return;
                }
                response.edit({ content: `${message.author} Craft successful!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Green').setFields({name: "You have", value: `**${inventory.find((value) => value.name.toLowerCase().includes(item.toLowerCase()))?.amount ?? 0}**`, inline: false}).setFooter(null)], components: [] }).catch(() => { })
                await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Green').setAuthor({ iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}` }).setDescription(`<:success:1146683498766291024> You've crafted ${craft.emoji ?? ""} ${craft.name} \`x1\``)] })
            }

        })
    }
} as Command