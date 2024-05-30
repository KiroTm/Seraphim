import { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Interaction, ButtonInteraction } from "discord.js";
import { ResponseClass } from "../../../../../src/Classes/Utility/Response";
import { Command, Callback } from "../../../../../NeoHandler/typings";
import { CrateClass, CrateType } from "../../Classes/crate";
import { InventoryClass } from "../../Classes/inventory";
import { dropTypes } from "../../Classes/crate";
const inventoryClass = InventoryClass.getInstance();
const crateClass = CrateClass.getInstance()
export default {
    name: 'open',
    description: 'Open crates.',
    cooldown: {
        Duration: '2s',
    },
    callback: async ({ message, member, args, instance, channel, client }: Callback) => {
        const crateName = args[0]?.toLowerCase() ?? undefined;
        const amount = parseInt(args[1] ?? undefined)
        if (!['uncommon', 'common', 'rare', 'mythic'].includes(crateName)) return new ResponseClass().error(instance, message, { embeds: [new EmbedBuilder().setDescription('Crate name must be one of `common, uncommon, rare, mythic`').setColor('Red')] }, { cooldownType: 'perGuildCooldown', commandName: 'open' })
        if (!amount) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Please provide the amount of crates to be opened!")] })
        const inventory = inventoryClass.getInventory(member);
        const crate = crateClass.hasCrate(inventory, crateName)
        if (crate == 'CrateNotFound') return new ResponseClass().error(instance, message, { embeds: [new EmbedBuilder().setColor('Blue').setDescription(`You don't have the ${crateName} crate!`)] }, { cooldownType: 'perGuildCooldown', commandName: 'open' })
        const Crate = inventory.find((value) => value.name.toLowerCase() == crateName)
        if (!Crate) message.channel.send({ embeds: [new EmbedBuilder().setDescription('Invalid crate, please contact the devs!').setColor('Red')] })
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${message.id}1`).setStyle(ButtonStyle.Primary).setLabel("Open"), new ButtonBuilder().setCustomId(`${message.id}2`).setStyle(ButtonStyle.Danger).setLabel("Cancel"))
        const response = await channel.send({ content: `${message.author} Are you sure you want to open **${crateName}** \`x${amount}\``, embeds: [new EmbedBuilder().setTitle(`${crateName}`).setColor('Blue').setDescription(`Possible outcomes:\n${crateClass.Crates.find((_, key) => key.toLowerCase().includes(crateName.toLowerCase()))!.map((value, _) => `${value.emoji} ${value.name}`).join("\n")}`).setFields({name: `You have:`, value: `**${crate.amount ?? 0}**`, inline: false}).setThumbnail(dropTypes[crate.name as CrateType].image).setFooter({ text: "This message will expire in 15 seconds.", iconURL: `${message.client.user.displayAvatarURL()}` })], components: [row] });
        const collector = response.createMessageComponentCollector({ filter: (Int: Interaction) => Int.user.id === message.author.id, max: 1, maxUsers: 1, time: 15 * 1000 })
        collector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                await response.edit({ content: `${message.author} You didn't respond in time`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red')], components: [] })
                return;
            };
            const interaction = collected.values().next().value as ButtonInteraction
            await interaction.reply({ embeds: [new EmbedBuilder().setColor('Grey').setAuthor({ name: 'Loading...', iconURL: 'https://media.discordapp.net/attachments/1162785970064740513/1166679422062051428/loadingWeb.gif' })], ephemeral: true })
            if (interaction.customId == `${message.id}2`) {
                response.edit({ content: `${message.author} I've cancelled your request!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Red').setFooter(null)], components: [] }).catch(() => { })
                await interaction.editReply({ embeds: [new EmbedBuilder().setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` }).setColor('Red').setDescription("Alrighty! Cancelled your request.")] })
            } else if (interaction.customId == `${message.id}1`) {
                const open = crateClass.openCrate(member, inventoryClass.getInventory(member), crateName, amount);
                if (typeof open === 'string') {
                    interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("You don't have that many crates!")] })
                    return;
                }
                await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Green').setAuthor({ iconURL: `${interaction.client.user.displayAvatarURL()}`, name: `${interaction.client.user.username}` }).setDescription(`** <:success:1146683498766291024> You've obtained the following items:**\n${open.map((value) => `${value.emoji} ${value.name} – ${value.amount}`).join("\n")}`)] })
                response.edit({ content: `${message.author} Opening successful!`, embeds: [new EmbedBuilder(response.embeds[0].data).setColor('Green').setFields({name: `You have:`, value: `**${inventory.find((value) => value.name.toLowerCase().includes(crateName.toLowerCase()))?.amount ?? 0}**`, inline: false}).setFooter(null)], components: [] }).catch(() => { })
            }
        })
    }
} as Command
