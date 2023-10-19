import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Channel, Collection, Embed, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import DropSchema from "../../models/Drop-Schema";
import { DropClass } from "../../classes/EventSpecial/drops";
import { MemberClass } from "../../classes/misc/member";
const dropClass = DropClass.getInstance()
export default {
    name: "drops",
    description: "Setup and manage halloween special module, drops!",
    type: CommandType.both,
    options: [
        {
            name: "setup",
            description: "Setup drops in your server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: 'Channel you want to drops to be sent in.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        }
    ],
    args: {
        minArgs: 4,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}drop remove/grant user amount"
    },
    permissions: [PermissionFlagsBits.ManageRoles],
    callback: async ({ message, interaction, args, guild }: Callback) => {
        if (message) {
            const member = new MemberClass().fetch(guild, args[1], message) as GuildMember;

            if (!member) {
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid member!")],
                });
            }

            if (args[0] === 'grant' && ['Common', 'Uncommon', 'Rare', 'Mythic'].includes(args[2])) {
                const crate_name = args[2]
                const amount = parseInt(args[3])
                if (!amount) return message.channel.send("Invalid amount")
                const Items = dropClass.DropsData.get(member.id);
                if (!Items) {
                    message.channel.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription(`Granted ${amount} ${crate_name} crates to ${member.user.username}`)]})
                    return dropClass.DropsData.set(member.id, new Collection<string, number>().set(args[2], amount))
                }
                Items.set(args[2], (Items.get(args[2]) ?? 0) + (parseInt(args[3]) || 1));
                message.channel.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription(`Granted ${args[3]} ${args[2]} crates to ${member.user.username}`)]})
            } else if (args[0] === 'remove') {
            } else {
                message.channel.send('Invalid Args! Make sure the crate name is among: "Common, Uncommon, Rare, Mythic and action type is among grant/remove"');
            }

        } else if (interaction) {
            await interaction.deferReply({ ephemeral: true })
            const channel = interaction.options.getChannel('channel') as Channel
            if (!channel || channel && !channel.isTextBased()) return interaction.editReply({ embeds: [new EmbedBuilder().setDescription("Provide a TextChannel").setColor('Red')] })
            await DropSchema.findOneAndUpdate({
                GuildID: interaction.guildId
            },
                {
                    GuildID: interaction.guildId,
                    ChannelID: channel.id
                },
                {
                    upsert: true,
                    new: true
                })
            interaction.editReply("Set!")
            dropClass.DropsSetupData.set(`${interaction.guildId}`, channel.id)
        }
    }

} as Command