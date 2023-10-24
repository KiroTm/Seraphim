import { Channel, Collection, EmbedBuilder, Guild, GuildMember, Role } from "discord.js";
import { MemberClass } from "../../classes/misc/member";
import { Callback, Command } from "../../typings";
import { StatsClass } from "../../classes/misc/Message";
import { ChannelClass } from "../../classes/misc/channel";
import ms from "enhanced-ms";
import { RoleClass } from "../../classes/misc/role";
const statsClass = StatsClass.getInstance();
const timeFrameLabels: Record<string, string> = {
    "7days": "1 week",
    "3days": "3 days",
    "1day": "1 day",
    alltime: "All Time",
};
const memberClass = new MemberClass()
export default {
    name: "stats",
    description: "Get message stats about you or someone else.",
    cooldown: {
        Duration: '5s',
        Type: 'perGuildCooldown'
    },
    aliases: ['s', 'stat'],
    callback: async ({ message, args, guild }: Callback) => {
        const time = Date.now()
        const queryType = ['top', 'me', 'role', 'lookback'].includes(args[0]) ? args[0] : memberClass.fetch(guild, args[0] ?? message.author.id as string) as GuildMember;
        if (queryType == 'top') {
            const top = statsClass.getTopMembers(guild, 10)
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2B2D32')
                        .setDescription(`Message stats for ${guild.name}.  Started Caching <t:1696982480:R>`)
                        .addFields(
                            {
                                name: `<:People:1161712673868755005> Top 10 members.`, 
                                value: top.map((value, index, ) => `**${index + 1}.** ${value.member} - ${value.value.size} messages`).join("\n"),
                                inline: false 
                            }
                        )
                        .setFooter({
                            text: `⏱️ | Time taken: ${ms(Date.now() - time, { includeMs: true, includeSubMs: true, shortFormat: true })}`
                        })
                ]
            });
        } else if (queryType == 'role') {
            if (!args[1]) {
                return message.channel.send("Please provide role parameters!")
            }
            const role = new RoleClass().fetch(guild, args[1]) as Role | undefined
            if (!role) {
                return message.channel.send("Invalid Role!")
            }
            const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));
            if (membersWithRole.size === 0) {
                return message.channel.send("No members with that role found!");
            }
            const sortedMembers = membersWithRole.sort((a, b) => {
                const aMessageCount = statsClass.getMessages(guild, a.id)["7days"].size;
                const bMessageCount = statsClass.getMessages(guild, b.id)["7days"].size;
                return bMessageCount - aMessageCount;
            })
            let index: number = 0;
            const rankedMembers = Array.from(sortedMembers).map(([_, member]) => {
                index++
                const messageCount = statsClass.getMessages(guild, member.id)["7days"].size;
                return `${index == sortedMembers.size ? "<:branch_tail_curved:1161479147839828018>" : "<:branch_90_curved:1161486023814025266>"} **${index}.** ${member} - \`${messageCount} messages\``
            });

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2B2D32')
                        .setDescription(`Message stats for ${role}.  Started Caching <t:1696982480:R>`)
                        .addFields(
                            { name: `<:People:1161712673868755005> Members in ${role.name}.`, value: rankedMembers.join("\n"), inline: false }
                        )
                        .setFooter({
                            text: `⏱️ | Time taken: ${ms(Date.now() - time, { includeMs: true, includeSubMs: true, shortFormat: true })}`
                        })
                ]
            });
        } else if (queryType == 'me' || typeof queryType == 'object' && 'roles' in queryType) {
            const member: GuildMember = queryType == 'me' ? message.member as GuildMember : queryType as GuildMember
            if (!statsClass.getStats(guild.id, member.id)) return message.channel.send("No data found for that member!");
            const [indexedChannels, channelCounts] = statsClass.getChannels(guild, member.id);
            const messages = Object.entries(statsClass.getMessages(guild, member.id));
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${member.user.username}`,
                            iconURL: `${member.user.displayAvatarURL()}`
                        })
                        .setColor('#2B2D32')
                        .setDescription(`${member}(${member.user.username}). Started Caching <t:1696982480:R>`)
                        .addFields(
                            {
                                name: "<:channel:1161484020346003550> **Most Active Channels**",
                                value: indexedChannels.map((channel, index) => `${index == indexedChannels.size ? "<:branch_tail_curved:1161479147839828018>" : "<:branch_90_curved:1161486023814025266>"} **${index}.** ${new ChannelClass().fetchChannel(guild, channel) ?? "Unknown"} - \`${channelCounts.get(channel)} messages\``).join("\n"),
                                inline: true
                            },
                            {
                                name: "<:Monitor:1161484480008175717> **Messages**",
                                value: messages.map(([timeframe, message_count], index) => `${index == messages.length ? "start-" : "<:branch_tail_curved:1161479147839828018>"} ${timeFrameLabels[timeframe]}: \`${message_count.size} messages\``).join("\n")
                            }
                        )
                        .setFooter({
                            text: `⏱️ | Time take: ${ms(Date.now() - time, { includeMs: true, shortFormat: true })}`
                        })
                ]
            })
        } else if (queryType == 'lookback') {
            const days = parseInt(args[1] ?? undefined)
            if (!days ) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid time!\nCorrect usage example: ?stats lookback 2 <-- sets lookback 2 days")]})
            if (days < 1 || !Number.isInteger(days)) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid time! Make sure the time is is a __whole number__ between 1 - 365")]})
            statsClass.setLookback(guild, days)
            return message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`Set the lookback to **${days} day${days == 1 ? '' : 's'}**`)]})
        } else {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`Invalid args! Must be one of \`top, me, lookback <days>, role <@role>, @user\``)
                ]
            })
        }
    }
} as Command;