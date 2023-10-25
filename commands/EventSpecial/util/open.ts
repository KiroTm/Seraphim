import { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { CrateClass } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { Command, Callback } from "../../../typings";
import { dropTypes } from "../../../classes/EventSpecial/crate";

const inventoryClass = InventoryClass.getInstance();

export default {
    name: 'open',
    description: 'Open crates.',
    callback: async ({ message, member, args }: Callback) => {
        const crateName = args[0]?.toLowerCase() ?? undefined;
        const amount = parseInt(args[1]) ?? 1
        if (!['uncommon', 'common', 'rare', 'mythic'].includes(crateName)) return message.channel.send({embeds: [new EmbedBuilder().setDescription('Crate name must be one of `common, uncommon, rare, mythic`').setColor('Red')]})
        const inventory = inventoryClass.getInventory(member);
        const crate = new CrateClass().openCrate(inventory, crateName)
        if (crate == 'CrateNotFound') return message.channel.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription(`You don't have the ${crateName} crate!`)]})
        const Crate = inventory.find((value) => value.name.toLowerCase() == crateName)
        if (!Crate) message.channel.send({embeds: [new EmbedBuilder().setDescription('Invalid crate, please contact the devs!').setColor('Red')]})
        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`HalloweenCrate1-${message.author.id}`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(`Open 1 ${crate.name} crate`),

            new ButtonBuilder()
            .setCustomId(`HalloweenCrate10-${message.author.id}`)
            .setStyle(ButtonStyle.Primary)
            .setLabel(`Open 10 ${crate.name} crates`)
            .setDisabled(crate.amount >= 10 ? false : true),
        )
        await message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(`How many would you like to open?`)
                .setColor('#2fe5ff')
                .setDescription(`You have: **${crate.amount ?? 0}**`)
                .setImage(dropTypes[crate.name].image)
            ],
            components: [row]
        })
    }
} as Command
