import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, Message } from "discord.js"
import { ConfigHandler } from "../../Main-Handler/ConfigHandler"
import { AfkClass } from "../../classes/misc/afk"
export const mentions = new Collection<string, { messageContent: string, author: string, target :string ,url: string}>()
const afkClass = AfkClass.getInstance()
export default async (instance: ConfigHandler, message: Message) => {
    if (message?.channel?.type !== ChannelType.GuildText) return;
    if (message.author.bot) return;
    if (message.content.startsWith("?afk")) return;
    const key = `${message.author.id}-${message.guildId}`
    const id = message.author.id
    const afk = afkClass.findOne(key)
    if (afk) {
        afk.Mentions?.forEach((mention) => {
            const info = mention.split('-')
            mentions.set(info[0], {messageContent: info[1], author: info[2], target: info[3] ,url: info[3]})
        })
        if (message.author.id == id) {
            const mentioners = mentions.filter((a,b ) => b = message.id)
            const component = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`afk-${id}`)
                        .setLabel("View Pings")
                        .setStyle(ButtonStyle.Secondary)
                )
            message.channel.send({ content: `Welcome back! ${message.author} I've removed your AFK. You got (**${mentioners.size}**) mentions`, components: [component] }).then((msg) => {
                setTimeout(() => {
                    msg.edit({ components: [] })
                    if (!mentioners.size) return;
                    mentioners.forEach((mentioner, key) => {
                        mentions.delete(key)
                    })
                }, 1000 * 10)
            })
            afkClass.deleteOne(key)
        }
    }
    const mentioned = message.mentions.members?.first()?.user
    const userkey = `${mentioned?.id}-${message.guildId}`
    const userafk = afkClass.findOne(userkey)
    if (userafk) {
        message.channel.send({ content: `<@${mentioned?.id}> is AFK: ${userafk.Reason} | <t:${Math.round(userafk.Timestamp / 1000)}:R>`, allowedMentions: { roles: [], users: [] } })
        const key = `${message.id}-${message.content}-${message.author.id}-${message.url}`
        userafk.Mentions ?
            userafk.Mentions.push(key)
            :
            userafk.Mentions = [key]
    }
}