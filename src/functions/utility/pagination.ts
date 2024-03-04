import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelSelectMenuInteraction, ChatInputCommandInteraction, ColorResolvable, ComponentType, Embed, EmbedBuilder, EmbedField, Interaction, MentionableSelectMenuInteraction, Message, MessageComponentInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, TextChannel, UserSelectMenuInteraction } from "discord.js";

export async function Messagepagination(message: Message, pages: EmbedBuilder[], time: Number) {
    // run through a bunch of argument checks
    if (!message) throw new Error("Pass a message, not an interaction")
    if (!Array.isArray(pages)) throw new Error("Provide an array for pages!")
    if (typeof time !== "number") throw new Error("Time must be a number in miliseconds")
    if (time < 9000) throw new Error("Time must be greater than 30 seconds!")
    // if the pages.length === 1 
    if (pages.length === 1) {
        const page = await message.channel.send({
            embeds: pages,
            components: [],
        })
        return page
    } else {
        const prev = new ButtonBuilder()
            .setCustomId(`${message.id}prev`)
            .setEmoji("<:track_previous:1159470407527694367>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        const next = new ButtonBuilder()
            .setCustomId(`${message.id}next`)
            .setEmoji("<:track_forward:1159470397612380171>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)

        const home = new ButtonBuilder()
            .setCustomId(`${message.id}home`)
            .setEmoji("<:track_home:1159470401416613980>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)

        const end = new ButtonBuilder()
            .setCustomId(`${message.id}end`)
            .setEmoji("<:track_end:1159470394953183254>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(home, prev, next, end);
        let index = 0;
        const currentpage = await message.channel.send({
            embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
            components: [row]
        })
        // Create a component collector
        const filter = (btn: Interaction) => {
            return btn.user.id === message.author.id
        }
        const collector = currentpage.createMessageComponentCollector({
            filter,
            time: time
        });

        collector.on('collect', async (i) => {
            if (i.customId === `${message.id}prev`) {
                if (index > 0) index--;
            } else if (i.customId === `${message.id}home`) {
                index = 0;
            } else if (i.customId === `${message.id}end`) {
                index = pages.length - 1;
            } else if (i.customId === `${message.id}next`) {
                if (index < pages.length - 1) index++;
            };

            if (index === 0) prev.setDisabled(true);
            else prev.setDisabled(false);

            if (index === 0) home.setDisabled(true);
            else home.setDisabled(false);

            if (index === pages.length - 1) next.setDisabled(true);
            else next.setDisabled(false);

            if (index === pages.length - 1) end.setDisabled(true);
            else end.setDisabled(false);
            i.deferUpdate()
            currentpage.edit({
                embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                components: [row],
            })
        })

        collector.on('end', async () => {
            row.components.forEach((c) => c.setDisabled(true))
            await currentpage.edit({
                embeds: [pages[index].setColor('Red').setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                components: [row]
            });
        });
        return currentpage;
    }

}


// for interaction

export async function Interactionpagination(interaction: ChatInputCommandInteraction, pages: EmbedBuilder[], time: Number) {
    // run through a bunch of argument checks
    if (!interaction) throw new Error("Pass an interaction, not an message")
    if (!pages) throw new Error("Provide atleast 2 pages!")
    if (!Array.isArray(pages)) throw new Error("Provide an array for pages!")
    if (typeof time !== "number") throw new Error("Time must be a number in miliseconds")
    if (time < 9000) throw new Error("Time must be greater than 30 seconds!")
    await interaction.deferReply()
    // if the pages.length === 1 
    if (pages.length === 1) {
        const page = await interaction.editReply({
            embeds: pages,
            components: [],
        })
        return page
    } else {
        //else continue adding buttons

        const prev = new ButtonBuilder()
            .setCustomId(`${interaction.id}prev`)
            .setEmoji("<:track_previous:1159470407527694367>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        const next = new ButtonBuilder()
            .setCustomId(`${interaction.id}next`)
            .setEmoji("<:track_forward:1159470397612380171>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)

        const home = new ButtonBuilder()
            .setCustomId(`${interaction.id}home`)
            .setEmoji("<:track_home:1159470401416613980>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)

        const end = new ButtonBuilder()
            .setCustomId(`${interaction.id}end`)
            .setEmoji("<:track_end:1159470394953183254>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(home, prev, next, end);
        let index = 0;
        const currentpage = await interaction.editReply({
            embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
            components: [row]
        })
        // Create a component collector
        const filter = (btn: Interaction) => {
            return btn.user.id === interaction.user.id
        }
        const collector = currentpage.createMessageComponentCollector({
            filter,
            time
        });

        collector.on('collect', async (i) => {
            if (i.customId === `${interaction.id}prev`) {
                if (index > 0) index--;
            } else if (i.customId === `${interaction.id}home`) {
                index = 0;
            } else if (i.customId === `${interaction.id}end`) {
                index = pages.length - 1;
            } else if (i.customId === `${interaction.id}next`) {
                if (index < pages.length - 1) index++;
            };

            if (index === 0) prev.setDisabled(true);
            else prev.setDisabled(false);

            if (index === 0) home.setDisabled(true);
            else home.setDisabled(false);

            if (index === pages.length - 1) next.setDisabled(true);
            else next.setDisabled(false);

            if (index === pages.length - 1) end.setDisabled(true);
            else end.setDisabled(false);
            await interaction.editReply({
                embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                components: [row],
            }).then(async () => {
                await i.deferUpdate()
            });;
        })

        collector.on('end', async () => {
            row.components.forEach((c) => c.setDisabled(true))
            await interaction.editReply({
                embeds: [pages[index].setColor('Red')],
                components: [row]
            });
        });
        return currentpage;
    }

}


// handle them component interactions
export async function MessageComponentInteractionPagination(message: Message, Int: StringSelectMenuInteraction<CacheType> | UserSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType> | MentionableSelectMenuInteraction<CacheType> | ChannelSelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>, pages: EmbedBuilder[], time: Number, ephemeral: Boolean) {
    if (ephemeral === true) {
        if (!message) throw new Error("Pass a message, not an interaction")
        if (!pages) throw new Error("Provide atleast 2 pages!")
        if (!Array.isArray(pages)) throw new Error("Provide an array for pages!")
        if (typeof time !== "number") throw new Error("Time must be a number in miliseconds")
        if (time < 9000) throw new Error("Time must be greater than 30 seconds!")
        // if the pages.length === 1    
        await Int.deferReply({ ephemeral: true, fetchReply: true })
        if (pages.length === 1) {
            const page = await Int.editReply({
                embeds: pages,
                components: [],
            })
        } else {
            //else continue adding buttons

            const prev = new ButtonBuilder()
                .setCustomId(`${message.id}prev`)
                .setEmoji("<:track_previous:1159470407527694367>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            const next = new ButtonBuilder()
                .setCustomId(`${message.id}next`)
                .setEmoji("<:track_forward:1159470397612380171>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)

            const home = new ButtonBuilder()
                .setCustomId(`${message.id}home`)
                .setEmoji("<:track_home:1159470401416613980>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)

            const end = new ButtonBuilder()
                .setCustomId(`${message.id}end`)
                .setEmoji("<:track_end:1159470394953183254>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)

            const cancel = new ButtonBuilder()
                .setCustomId(`${message.id}cancel`)
                .setEmoji("<:Cross_1:1062631129829625907>")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(home, prev, cancel, next, end);
            let index = 0;
            await Int.editReply({
                embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                components: [row]
            })
            // Create a component collector
            const filter = (btn: Interaction) => {
                return btn.user.id === message.author.id
            }
            const channel = Int.channel as TextChannel
            const collector = channel.createMessageComponentCollector({
                filter,
                time: time,
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate()
                if (i.customId === `${message.id}prev`) {
                    if (index > 0) index--;
                } else if (i.customId === `${message.id}home`) {
                    index = 0;
                } else if (i.customId === `${message.id}end`) {
                    index = pages.length - 1;
                } else if (i.customId === `${message.id}next`) {
                    if (index < pages.length - 1) index++;
                } else if (i.customId === `${message.id}cancel`){
                    collector.stop("cancelled")    
                    index = -3                                   
                }
    
                if (index === -3) {
                    await i.deleteReply()
                    collector.stop("cancelled")
                } else {
                    if (index === 0) {
                        prev.setDisabled(true);
                    } else prev.setDisabled(false);
                    if (index === 0) {
                        home.setDisabled(true);
                    } else home.setDisabled(false);
    
                    if (index === pages.length - 1) {
                        next.setDisabled(true);
                    } else next.setDisabled(false);
    
                    if (index === pages.length - 1) {
                        end.setDisabled(true);
                    } else end.setDisabled(false);            
    
                    await i.editReply({
                        embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                        components: [row]
                    })
                }
            })
        }
    } else {
        if (!message) throw new Error("Pass a message, not an interaction")
        if (!pages) throw new Error("Provide atleast 2 pages!")
        if (!Array.isArray(pages)) throw new Error("Provide an array for pages!")
        if (typeof time !== "number") throw new Error("Time must be a number in miliseconds")
        if (time < 10000) throw new Error("Time must be greater than 10 seconds!")
        // if the pages.length === 1    
        await Int.deferReply()
        if (pages.length === 1) {
            const page = await Int.editReply({
                embeds: pages,
                components: [],
            })
            return page
        } else {
            //else continue adding buttons

            const prev = new ButtonBuilder()
                .setCustomId(`${message.id}prev`)
                .setEmoji("<:track_previous:1159470407527694367>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            const next = new ButtonBuilder()
                .setCustomId(`${message.id}next`)
                .setEmoji("<:track_forward:1159470397612380171>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)

            const home = new ButtonBuilder()
                .setCustomId(`${message.id}home`)
                .setEmoji("<:track_home:1159470401416613980>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)

            const end = new ButtonBuilder()
                .setCustomId(`${message.id}end`)
                .setEmoji("<:track_end:1159470394953183254>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)

            const cancel = new ButtonBuilder()
                .setCustomId(`${message.id}cancel`)
                .setEmoji("<:Cross_1:1062631129829625907>")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(home, prev, cancel, next, end);
            let index = 0;
            const currentpage = await Int.editReply({
                embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                components: [row]
            })
            // Create a component collector
            const filter = (btn: Interaction) => {
                return btn.user.id === message.author.id
            }
            const channel = Int.channel as TextChannel
            const collector = channel.createMessageComponentCollector({
                filter,
                time: time,
            });

            collector.on('collect', async (i) => {
                await i.deferUpdate()
                if (i.customId === `${message.id}prev`) {
                    if (index > 0) index--;
                } else if (i.customId === `${message.id}home`) {
                    index = 0;
                } else if (i.customId === `${message.id}end`) {
                    index = pages.length - 1;
                } else if (i.customId === `${message.id}next`) {
                    if (index < pages.length - 1) index++;
                } else if (i.customId === `${message.id}cancel`) {
                    collector.stop()
                };
                if (index === 0) {
                    prev.setDisabled(true);
                } else prev.setDisabled(false);
                if (index === 0) {
                    home.setDisabled(true);
                } else home.setDisabled(false);

                if (index === pages.length - 1) {
                    next.setDisabled(true);
                } else next.setDisabled(false);

                if (index === pages.length - 1) {
                    end.setDisabled(true);
                } else end.setDisabled(false);
                await currentpage.edit({
                    embeds: [pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` })],
                    components: [row]
                })
            })
            collector.on('end', async () => {
                const reason = collector.endReason
                if (reason == "time") {
                    await currentpage.edit({
                        content: `<@${message.author.id}>, timeout!`,
                        embeds: [],
                        components: []
                    });
                } else if (reason == "xyz") {
                    await currentpage.edit({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Cancelled")], components: [] })
                }
            });
            return currentpage;
        }
    }
}


// data pagination 

export async function MessageDataPagination(Sorted: Array<any>, message: Message, pages: EmbedBuilder[], time: Number, ThisReply: Boolean, PaginationReply: Boolean) {
    function chunkify(arr: Array<any>, len: number) {
        let chunks = [];
        let i = 0;
        let n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
        }

        return chunks;
    }
    const max_fields = 3
    const fields = Sorted.map((value) => ({
        name: `Message Information:`,
        value: `Message: ${value.message}\nTime: <t:${value.time}:R>\nSent By: <@${value.senderId}>`
    })) as APIEmbedField[]
    if (fields.length >= max_fields) {
        const chunks = chunkify(fields, max_fields);
        const pages = [] as EmbedBuilder[];
        chunks.forEach((chunk) => {
            // create a new embed for each 3 fields
            pages.push(
                new EmbedBuilder()
                    .setTitle("Your Messages")
                    .setColor("#00ffe5")
                    .addFields(chunk)
            );
        });
        Messagepagination(message, pages, time)
    } else {
        const action = ThisReply === false ? message.channel.send : message.reply
        await action({
            embeds: [
                new EmbedBuilder()
                    .addFields(fields)
            ]
        })
    }
}



export async function InteractionDataPagination(interaction: ChatInputCommandInteraction, time: Number, fields: String[], Color: ColorResolvable) {
    function chunkify(arr: Array<any>, len: number) {
        let chunks = [];
        let i = 0;
        let n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
        }

        return chunks;
    }
    const max_fields = 5
    // const fields = Sorted.map((value) => ({
    //     name: "",
    //     value: ""
    // })) as APIEmbedField[]
    if (fields.length >= max_fields) {
        const chunks = chunkify(fields, max_fields);
        const pages = [] as EmbedBuilder[];
        chunks.forEach((chunk) => {
            // create a new embed for each 3 fields
            pages.push(
                new EmbedBuilder()
                    .setColor("#00ffe5")
                    .setDescription(chunk.join("\n\n"))
            );
        });
        Interactionpagination(interaction, pages, time)
    } else if (fields.length === 0) {
        await interaction.deferReply()
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription("Nothing to display.")
            ]
        })
    } else {
        await interaction.deferReply()
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Color)
                    .setDescription(fields.join("\n\n"))
            ]
        })
    }
}