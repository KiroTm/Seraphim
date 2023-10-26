import { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { CrateClass, CrateType } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { Command, Callback } from "../../../typings";
import { dropTypes } from "../../../classes/EventSpecial/crate";
import { ResponseClass } from "../../../classes/Utility/Response";
const inventoryClass = InventoryClass.getInstance();
const crateClass = CrateClass.getInstance()
export default {
    name: 'open',
    description: 'Open crates.',
    cooldown: {
        Duration: '2s',
    },
    callback: async ({ message, member, args, instance, channel }: Callback) => {
        const crateName = args[0]?.toLowerCase() ?? undefined;
        const amount = parseInt(args[1] ?? undefined)
        if (!amount) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Please provide the amount of crates to be opened!")]})
        if (amount > 999999) return message.channel.send("😭 Stop burning my pc")
        if (!['uncommon', 'common', 'rare', 'mythic'].includes(crateName)) {
            return new ResponseClass().error(instance, message, {embeds: [new EmbedBuilder().setDescription('Crate name must be one of `common, uncommon, rare, mythic`').setColor('Red')]}, {cooldownType: 'perGuildCooldown', commandName: 'open'})
        }
        const inventory = inventoryClass.getInventory(member);
        const crate = crateClass.hasCrate(inventory, crateName)
        if (crate == 'CrateNotFound') {
            return new ResponseClass().error(instance, message, {embeds: [new EmbedBuilder().setColor('Blue').setDescription(`You don't have the ${crateName} crate!`)]}, {cooldownType: 'perGuildCooldown', commandName: 'open'})
        }
        const Crate = inventory.find((value) => value.name.toLowerCase() == crateName)
        if (!Crate) message.channel.send({embeds: [new EmbedBuilder().setDescription('Invalid crate, please contact the devs!').setColor('Red')]})
        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`HalloweenCrateYes-${crate.name}-${message.author.id}-${amount}`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(`Are you sure?`),

            new ButtonBuilder()
            .setCustomId(`HalloweenCrateNo-${crate.name}-${message.author.id}-${amount}`)
            .setStyle(ButtonStyle.Danger)
            .setLabel(`Cancel`),
        )
        channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(`How many would you like to open?`)
                .setColor('#2fe5ff')
                .setDescription(`You have: **${crate.amount ?? 0}**`)
                .setImage(dropTypes[crate.name as CrateType].image)
                .setFooter({text: "This message will expire in 15 seconds.", iconURL: `${message.client.user.displayAvatarURL()}`})
            ],
            components: [row]
        }).then((msg) => {
            message.delete().catch(() => {})
            setTimeout(() => {
                msg.delete().catch(() => {})
            }, 16000);
        })
    }
} as Command
