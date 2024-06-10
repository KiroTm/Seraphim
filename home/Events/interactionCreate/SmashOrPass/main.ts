import { Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Collection } from 'discord.js';
import { SmashOrPassActionRow_Buttons, get } from '../../../Classes/Misc/smashorpass';
import { ConfigInstance } from "../../../../NeoHandler/ConfigHandler";

const usersParticipated = new Collection<string, Collection<string, string>>();
const votes = new Collection<string, { smash: number; pass: number }>();
const hasStarted = new Collection<string, boolean>();

const createButtons = (disabled: boolean) => (
    new ActionRowBuilder<ButtonBuilder>({
        components: [
            new ButtonBuilder()
                .setCustomId("SmashOrPassButton_Smash")
                .setLabel("Smash")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("SmashOrPassButton_Pass")
                .setLabel("Pass")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("SmashOrPassBegin")
                .setLabel("New")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!disabled)
        ]
    })
);

export default async (_: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton() || interaction.customId !== "SmashOrPassBegin") return;

    const guildId = interaction.guildId;
    if (!guildId) return;

    if (hasStarted.has(guildId)) return interaction.reply({ ephemeral: true, content: "Smash or Pass already started!" })

    hasStarted.set(guildId, true);

    if (interaction.customId.endsWith("New")) {
        usersParticipated.delete(guildId);
        votes.delete(guildId);
    }

    if (!usersParticipated.has(guildId)) {
        usersParticipated.set(guildId, new Collection());
    }
    if (!votes.has(guildId)) {
        votes.set(guildId, { smash: 0, pass: 0 });
    }

    const { message: { embeds } } = interaction;
    const themes = embeds[0].footer?.text.split(": ")[1].split(" | ") || [];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    interaction.deferUpdate()

    const url = await get(randomTheme);

    if (!url) return interaction.editReply({ content: "Failed to get content, contact developer for help." });

    const message = await interaction.channel.send({
        embeds: [
            new EmbedBuilder(embeds[0])
                .setImage(url)
                .setDescription("Voting has started...")
        ],
        components: [
            createButtons(false)
        ]
    });

    await interaction.deleteReply();

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000
    });

    collector.on('collect', async (buttonInteraction) => {
        const userId = buttonInteraction.user.id;

        if (usersParticipated.get(guildId)!.has(userId)) {
            return buttonInteraction.reply({ content: "You have already voted!", ephemeral: true });
        }

        usersParticipated.get(guildId)!.set(userId, buttonInteraction.customId);

        const guildVotes = votes.get(guildId)!;

        if (buttonInteraction.customId === "SmashOrPassButton_Smash") {
            guildVotes.smash += 1;
        } else if (buttonInteraction.customId === "SmashOrPassButton_Pass") {
            guildVotes.pass += 1;
        }

        buttonInteraction.deferUpdate();
    });

    collector.on('end', async () => {
        const guildVotes = votes.get(guildId)!;
        const totalVotes = guildVotes.smash + guildVotes.pass;
        const smashPercentage = totalVotes > 0 ? (guildVotes.smash / totalVotes) * 100 : 0;
        const passPercentage = totalVotes > 0 ? (guildVotes.pass / totalVotes) * 100 : 0;


        usersParticipated.delete(guildId);
        votes.delete(guildId);
        hasStarted.delete(guildId);

        message.edit({
            content: `Voting has ended.`,
            embeds: [
                new EmbedBuilder(message.embeds[0])
                    .setDescription(`Voting has ended.\n\n**Results:**\nSmash: ${guildVotes.smash} (${smashPercentage.toFixed(2)}%)\nPass: ${guildVotes.pass} (${passPercentage.toFixed(2)}%)`)
            ],
            components: [
                createButtons(true)
            ]
        });
    });
};  
