import { TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
export async function send(channel: TextChannel) {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("TRUTH")
                .setLabel('Truth')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("DARE")
                .setLabel('Dare')
                .setStyle(ButtonStyle.Danger)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("WYR")
                .setLabel('Would You Rather')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("NHIE")
                .setLabel('Never Have I Ever')
                .setStyle(ButtonStyle.Secondary)
        )
    channel.send({
        embeds: [
            new EmbedBuilder()
            .setColor('Blue')
            .setDescription("Start by choosing from the buttons below")
        ],
        components: [row]
    })

}

export async function todrow() {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("TRUTH")
                .setLabel('Truth')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("DARE")
                .setLabel('Dare')
                .setStyle(ButtonStyle.Danger)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("WYR")
                .setLabel('Would You Rather')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId("NHIE")
                .setLabel('Never Have I Ever')
                .setStyle(ButtonStyle.Secondary)
        )
}