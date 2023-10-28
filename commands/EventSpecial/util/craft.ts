import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, GuildMember, Interaction, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../../typings";
import { CraftingClass } from "../../../classes/EventSpecial/crafting"
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
        const response = await message.channel.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription(`Materials required to craft **${item}** are:\n${ItemRecipe.map((value) => `${value.emoji} **${value.itemName} \`x${value.amount}\`**`).join("\n")}\n\nAre you sure you want to craft this item?`).setFooter({text: "This message will expire in 15 seconds.", iconURL: `${message.client.user.displayAvatarURL()}`})], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${message.id}1`).setStyle(ButtonStyle.Primary).setLabel("Yes"), new ButtonBuilder().setCustomId(`${message.id}2`).setStyle(ButtonStyle.Secondary).setLabel("No"))] })
        const collector = response.createMessageComponentCollector({ filter: (int: Interaction) => int.user.id === message.author.id, maxUsers: 1, max: 1, time: 10000 })
        collector.on('end', async (collected, reason) => {
            if (!collected.size || reason == 'time') {
                response.edit({ components: [], embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setTitle("You didn't respond in time. Move fast, ya lazy sloth!")] })
                return;
            }
            if (collected.size) {
                const interaction = collected.values().next().value as ButtonInteraction
                await interaction.reply({ embeds: [new EmbedBuilder().setColor('Blue').setDescription("Crafting... <a:loading:1166992405199859733>")], ephemeral: true })
                if (interaction.customId == `${message.id}2`) {
                    response.edit({ content: `${message.author} I've cancelled your craft!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: [] }).catch(() => {})
                    await interaction.editReply({ embeds: [new EmbedBuilder().setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` }).setColor('Red').setDescription("Alrighty! Cancelled your request.")] })
                } else if (interaction.customId == `${message.id}1`) {
                    const craft = craftingClass.craftItem(member, item, ItemRecipe);
                    if (!(typeof craft == 'object')) {
                        response.edit({ content: `${message.author} You don't have enough materials to craft that!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red')] ,components: []}).catch(() => {})
                        await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setAuthor({ iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}` }).setDescription(`<:fail:1146683470114996274> You don't have enough materials to craft this item!`)]})
                        return;
                    }
                    response.edit({ content: `${message.author} Craft successful!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Green').setFooter(null)], components: [] }).catch(() => {})
                    await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Green').setAuthor({ iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}` }).setDescription(`<:success:1146683498766291024> You've crafted ${craft.emoji ?? ""} ${craft.name} \`x1\``)] })
                }
            }
        })
    }
} as Command