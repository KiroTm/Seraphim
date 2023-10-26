import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, GuildMember, Interaction, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../../typings";
import { CraftingClass } from "../../../classes/EventSpecial/crafting"
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { ItemClass } from "../../../classes/EventSpecial/item";
const craftingClass = new CraftingClass()
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
        if (!item) return message.channel.send("Invalid item")
        const ItemRecipe = new CraftingClass().getMaterials(item)
        const member = message.member as GuildMember
        if (ItemRecipe == 'Invalid Item') return message.channel.send(`${message.author} Invalid Item!`)
        if (ItemRecipe == 'Not Craftable') return message.channel.send(`${message.author} Item cannot be crafted!`)
        const response = await message.channel.send({ embeds: [new EmbedBuilder().setColor('#D4F1F4').setDescription(`Materials required to craft **${item}** are:\n${ItemRecipe.map((value) => `${value.emoji} **${value.itemName} \`x${value.amount}\`**`).join("\n")}\n\nAre you sure you want to craft this item?`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`craft-yes-${message.id}`).setStyle(ButtonStyle.Primary).setLabel("Yes"), new ButtonBuilder().setCustomId(`craft-no-${message.id}`).setStyle(ButtonStyle.Secondary).setLabel("No"))] })
        const collector = response.createMessageComponentCollector({ filter: (int: Interaction) => int.user.id === message.author.id, maxUsers: 1, max: 1, time: 10000 })
        collector.on('end', async (collected, reason) => {
            if (!collected.size || reason == 'time') {
                response.edit({ components: [], embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setTitle("You didn't respond in time. Move fast, ya lazy sloth!")] })
                return;
            }
            if (collected.size) {
                const interaction = collected.values().next().value as ButtonInteraction
                await interaction.deferReply({ ephemeral: true })
                response.delete().catch(() => {})
                message.delete().catch(() => {})
                if (interaction.customId == `craft-no-${message.id}`) {
                    await interaction.editReply({embeds: [new EmbedBuilder().setAuthor({name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}`}).setColor('Red').setDescription("Alrighty! Cancelled your request.")]})
                } else if (interaction.customId == `craft-yes-${message.id}`) {
                    const craft = craftingClass.craftItem(member, item, ItemRecipe);
                    const Object = craft == 'Insufficient Materials' || craft == 'Invalid Item' || craft == 'Not Craftable' ? { embeds: [new EmbedBuilder().setColor('Red').setDescription('You do not have enough material to craft that or that item isn\'t craftable!')]} : {embeds: [new EmbedBuilder(response.embeds[0].data).setDescription(`You've crafted ${craft.emoji ?? ""} ${craft.name} \`x1\``).setColor('Blue')]} 
                    await interaction.editReply(Object)
                }
            }
        })
    }
} as Command