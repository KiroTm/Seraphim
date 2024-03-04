import { EmbedBuilder, User, GuildMember, ApplicationCommandOptionType, UserFlagsBitField, EmbedField } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";
import { UserClass } from "../../classes/misc/user";

const memberClass = new MemberClass();
const userClass = new UserClass();
export default {
    name: "whois",
    description: "View information about other members or users",
    type: CommandType.both,
    options: [
        {
            name: "user",
            description: "Select a user to display information for.",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    aliases: ["w"],
    cooldown: {
        Duration: '5s'
    },
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "?whois @user/id/name <-- (optional parameter)"
    },
    callback: async ({ args, message, interaction, guild, client }: Callback) => {
        interaction ? await interaction.deferReply() : message
        const sendEmbed = (embed: EmbedBuilder) => message ? message.channel.send({ embeds: [embed] }) : interaction.editReply({ embeds: [embed] });
        const target: GuildMember | User | undefined = message ? (memberClass.fetch(guild, args.join(' '), message) as GuildMember ?? (await userClass.fetch(client, args.join(' '), message) as User || undefined)) : (interaction.options.getUser('user') as User || interaction.member)
        if (typeof target == 'undefined') {
            return (message ? message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Couldn't fetch that user! Most likely the user doesn't exists")] }) : interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Invalid User/Member')] }))
        }
        const getUserInfo = (u: User, m?: GuildMember) => {
            const roles = m ? m.roles.cache.sort((a, b) => b.position - a.position).map((r) => r) : undefined
            const fieldsdata: Array<EmbedField> = m ? [
                { name: `Roles [${roles?.length}]`, value: `${m.roles.cache.size >= 20 ? "Too many  roles to display" : `${roles?.join("\n")}`}`, inline: false },
                { name: "Key Permissions", value: `${m ? (memberClass.getformatPermissions(m.permissions.toArray())).sort().join(", " ) || "None" : "None"}`, inline: false },
                { name: "Acknowledgement", value: `${m ? memberClass.getAcknowledgment(m) : "Ghost"}`, inline: false }
            ] : [{ name: "Acknowledgement", value: `${m ? memberClass.getAcknowledgment(m) : "Ghost"}`, inline: false }];

            return new EmbedBuilder()
                .setColor("Blue")
                .setAuthor({ name: `${u.username}`, iconURL: `${u.displayAvatarURL({ forceStatic: true })}` })
                .setDescription(`**General Information:\n**<:User:1153571122697224263> **User ID:** ${u.id}\n<:HashTag:1153571114606395483> **Username:** ${u.username} ${m ? m.nickname ? `${`(${m.nickname})`}` : '' : ''}\n<:Tag:1153571118607777852> **Badges**: ${memberClass.getFlags((u.flags as UserFlagsBitField).toArray()) || "*No badges*"}\n<:Asterik:1153571108646309918> **Account Created**: <t:${Math.floor(Math.round(parseFloat(`${u.createdTimestamp}`) / 1000))}:f>\n<:Bot:1153572049634197504> **Bot?**: ${u.bot === false ? "No" : "Yes"}${m ? `\n<:Role:1153574929669816350> **Highest Server Role**: ${m.roles.highest}` : ""}${m ? `\n<:Calender:1153575414556545104> **Member Since**: <t:${Math.floor(Math.round(parseFloat(`${m.joinedTimestamp}`) / 1000))}:f>` : ""}`)
                .setFields(fieldsdata)
                .setThumbnail(`${u.displayAvatarURL({ forceStatic: false })}`);
        };
        if (typeof target === 'object' && target !== null) {
            const embedTarget = 'roles' in target ? target.user : target;
            sendEmbed(getUserInfo(embedTarget, 'roles' in target ? target : undefined));
        }
    },
    extraInfo: {
        command_detailedExplaination: "The \"whois\" command adeptly manages the result in accordance with your input, obviating the requirement for you to intricately procure member or user information. In cases where the provided ID exists outside the guild, it will encompass user-specific details; conversely, it will furnish guild-specific member information for internally recognized IDs.",
        command_example: "?whois kiro\n?w 919568881939517460\n?whois @oreotm\n?whois 691811957812232253 (outside present guild)"
    }
} as Command;
