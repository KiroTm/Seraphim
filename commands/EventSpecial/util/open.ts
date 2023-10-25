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
        Duration: '20s',
    },
    callback: async ({ message, member, args, instance }: Callback) => {
        const crateName = args[0]?.toLowerCase() ?? undefined;
        if (!['uncommon', 'common', 'rare', 'mythic'].includes(crateName)) {
            return new ResponseClass().error(instance, message, {embeds: [new EmbedBuilder().setDescription('Crate name must be one of `common, uncommon, rare, mythic`').setColor('Red')]}, {cooldownType: 'perGuildCooldown', commandName: 'open'})
        }
        const inventory = inventoryClass.getInventory(member);
        const crate = crateClass.openCrate(inventory, crateName)
        if (crate == 'CrateNotFound') {
            return new ResponseClass().error(instance, message, {embeds: [new EmbedBuilder().setColor('Blue').setDescription(`You don't have the ${crateName} crate!`)]}, {cooldownType: 'perGuildCooldown', commandName: 'open'})
        }
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
            .setDisabled(crate.amount <= 10),
        )
        message.channel.send({
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
            setTimeout(() => {
                msg.delete().catch(() => {})
            }, 16000);
        })
    }
} as Command
