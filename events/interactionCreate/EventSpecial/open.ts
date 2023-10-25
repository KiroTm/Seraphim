import { Interaction, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { MemberClass } from "../../../classes/misc/member";
import { AllItems } from "../../../classes/EventSpecial/types";
const inventoryClass = InventoryClass.getInstance()
const crateClass = CrateClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const CustomId = interaction.customId
    const [ amount, crate, userID ] = CustomId.split('-')
    if (!amount.includes('HalloweenCrate')) return;
    if (interaction.member?.user.id !== userID) return interaction.reply({ephemeral: true, content: "You can't use this button!"})
    await interaction.deferReply({ephemeral: true})
    interaction.message.delete().catch(() => {})
    const member = new MemberClass().fetch(interaction.guild as Guild, userID) as GuildMember
    interaction.editReply({
        embeds: [
            new EmbedBuilder()
            .setColor('Grey')
            .setAuthor({name: 'Loading...', iconURL: 'https://media.discordapp.net/attachments/1162785970064740513/1166679422062051428/loadingWeb.gif'})
        ]
    })
    const open = crateClass.openCrate(inventoryClass.getInventory(member), crate, amount == 'HalloweenCrate1' ? 1 : 10)
    if (open == 'NoItems' || open == 'CrateNotFound') {
        return interaction.editReply({
            embeds: [new EmbedBuilder().setColor('Red').setDescription("You don't have this crate!")]
        })
    }
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
            .setColor('Grey')
            .setDescription(`You obtained: \n${open.map((value, index) => `> **${value.name} ${value.emoji}**`).join("\n")}`)
        ]
    })
}