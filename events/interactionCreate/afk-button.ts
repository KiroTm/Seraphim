import { EmbedBuilder, Guild, GuildMember, Interaction} from "discord.js";
import { ConfigHandler } from "../../Main-Handler/ConfigHandler";
import { mentions } from "../messageCreate/afk";
import { MemberClass } from "../../classes/misc/member";
export default async (instance: ConfigHandler, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("afk-")) return;
    const userid = interaction.customId.split("-")[1] as string
    const mentioners = mentions.filter((a, b) => a.target = userid)
    const guild = interaction.guild as Guild
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Grey')
                .setTitle("Mentions")
                .setDescription(mentioners.map((object, key) => {
                    const member = new MemberClass().fetch(guild, object.author) as GuildMember
                    return `**${member.user.username}**\n<:branch_tail_curved:1161479147839828018> ${object.messageContent} [Jump](${object.url})`
                }).join("\n") || "None")
        ],
        ephemeral: true
    })
    mentioners.forEach((mentioner, key) => {
        mentions.delete(key)
    })
}