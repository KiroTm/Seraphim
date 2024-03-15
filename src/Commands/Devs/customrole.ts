import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember, GuildPremiumTier, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { MemberClass } from "../../Classes/Misc/member";
import { Callback, Command } from "../../../Main-Handler/typings";
const memberClass = new MemberClass()
export default {
    name: 'customrole',
    description: 'Grants custom role to the member provided',
    cooldown: {
        Duration: '3s',
    },
    ownersOnly: true,
    callback: async ({ message, args }: Callback) => {
        const member = memberClass.fetch(message.guild as Guild, `${args.join(" ") || undefined}`) as GuildMember
        if (!member) return;
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel('Start').setCustomId(`${member.id}customrole`).setStyle(ButtonStyle.Primary))
        const response = await message.channel.send({
            content: `${member} Please click the button to continue.`,
            components: [
                row
            ]
        })
        const collector = response.createMessageComponentCollector({ filter: ( Int: Interaction ) => { return Int.user.id === member.user.id }, time: 10 * 6000 });
        collector.on('collect', async ( collected ) => {

            collector.stop("limit")

            const modal = new ModalBuilder()
            .setTitle('Making a custom role.')
            .setCustomId(`${member.id}CustomRoleModal`);

            const name = new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("Name").setMaxLength(30).setLabel("Role name").setPlaceholder(`${member.user.username}`).setStyle(TextInputStyle.Short).setRequired(true))
            const color = new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("Color").setMaxLength(15).setLabel("Role color").setPlaceholder('Red').setStyle(TextInputStyle.Short).setRequired(true))
            const icon = new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("Icon").setMaxLength(200).setLabel("Role icon").setPlaceholder('👑').setStyle(TextInputStyle.Short).setRequired(false))
            modal.addComponents( name, color)
            if ( message.guild?.premiumTier && message.guild?.premiumTier > 1) modal.addComponents(icon)
            await collected.showModal(modal)

        })

        collector.on('end', async ( collected, reason ) => {
            if (reason == 'time') response.edit({components: [], embeds: [ new EmbedBuilder().setDescription("The member didn't respond in time!") ]})
            if (reason == 'limit') response.delete()
            return;
        })
    }
} as Command