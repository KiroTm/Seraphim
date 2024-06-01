import { ColorResolvable, EmbedBuilder, GuildMember, Interaction } from "discord.js";
import { ConfigInstance } from "../../../NeoHandler/ConfigHandler";

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isModalSubmit() || !interaction.customId.endsWith("CustomRoleModal")) return;

    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member as GuildMember;
    const fields = interaction.fields.fields;

    const name = fields.find((_, key) => key.toLowerCase() === "name")?.value as string
    let color = fields.find((_, key) => key.toLowerCase() === "color")?.value as string
    color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    const icon = fields.find((_, key) => key.toLowerCase() === "icon")?.value

    try {
        const role = await interaction.guild?.roles.create({
            name,
            color: color as ColorResolvable as `#${string}` ?? 'Default',
            permissions: ["ViewChannel"],
            icon: icon?.toString() ?? undefined,
            hoist: false,
            mentionable: false,
            position: member.roles.highest.position + 1
        }).catch((e) => console.log(e));

        if (!role) return interaction.editReply("Something went south...")

        await member.roles.add(role.id);
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`Role info:\nName: **${name}**\nIcon: ${icon ?? 'N/A'}\nColor: **${color}**`)
            ]
        });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "Make sure the name, color, and icon (if any) are valid.",
            embeds: []
        });
    }
};
