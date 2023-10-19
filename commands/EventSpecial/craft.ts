import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../typings";
import { CraftingClass } from "../../classes/EventSpecial/crafting";
import { ItemClass } from "../../classes/EventSpecial/item";
export default {
    name: "craft",
    description: "Craft items using materials!",
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}{COMMAND} item-name"
    },
    callback: async ({message, args, client}: Callback) => {
        const item = args[0]
        const ItemRecipe = new CraftingClass().getMaterials(item)
        if (ItemRecipe == 'Invalid Item') return message.channel.send(`${message.author} Invalid Item!`)
        if (ItemRecipe == 'Not Craftable') return message.channel.send(`${message.author} Item cannot be crafted!`)
        const response = await message.channel.send({embeds: [new EmbedBuilder().setColor('#D4F1F4').setDescription(`Materials required to craft **${item}** are:\n${ItemRecipe.map((value) => `${value.emoji} **${value.itemName} \`x${value.amount}\`**`).join("\n")}\n\nAre you sure you want to craft this item?`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`craft-yes-${message.id}`).setStyle(ButtonStyle.Primary).setLabel("Yes"), new ButtonBuilder().setCustomId(`craft-no-${message.id}`).setStyle(ButtonStyle.Secondary).setLabel("No"))]})
        const collector = response.createMessageComponentCollector({filter : (int: Interaction) => int.user.id === message.author.id , maxUsers: 1, max: 1, time: 10000})
        collector.on('end', async (collected, reason) => {
            if (!collected.size || reason == 'time') {
                response.edit({components: [], embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setTitle("You didn't respond in time. Move fast, ya lazy sloth!")]})
                return;
            }
            if (collected.size) {
                const interaction = collected.values().next().value as ButtonInteraction
                if (interaction.customId == `craft-no-${message.id}`) {
                    response.edit({components: [] , embeds: [new EmbedBuilder(response.embeds[0].data).setTitle(`${interaction.member?.user.username} changed their mind.`).setColor('Red')]})
                    interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new EmbedBuilder()
                            .setAuthor({
                                name: `${client.user?.username}`,
                                iconURL: `${client.user?.displayAvatarURL()}`
                            })
                            .setColor('Red')
                            .setDescription("Alrighty! Cancelled your request.")
                        ]
                    })
                } else if (interaction.customId == `craft-yes-${message.id}`) {
                    interaction.reply({content: "You if see this, you're an idiot", ephemeral: true})
                    response.edit({
                        content: "oops",
                        embeds: [],
                        components: []
                    })
                }
            }
        })
    }
} as Command