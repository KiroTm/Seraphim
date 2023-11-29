import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, EmbedBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { client } from "../..";

export enum automodtype {
    BannedWords = 'bannedwords',
    ServerInvites = 'serverinvites',
    PhishingLinks = 'phishinglinks',
    MassMention = 'massmention'
}

export interface AutomodSetupInterface {
    type: automodtype,
    enabled: boolean,
    query?: string
}

export class AutomodClass {
    private static instance: AutomodClass;
    public AutomodCollection: Collection<string, { type: string, query: string[] }> = new Collection()
    private constructor() {
        this.startUp()
    }

    public static getInstance(): AutomodClass {
        return this.instance || (this.instance = new AutomodClass());
    }


    private async initializeData() {

    }

    private async uploadData() {

    }

    public utils(interaction: ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction) {
        return {
            constants: {
                BannedWords: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription(`**🚫 Banned Words System Setup!**\nElevate your server's content moderation with the Banned Words system, a robust feature of AutoMod by ${client.user?.username}. 🌟🔍\n\n**Quick Setup Guide:**\n\n1. **Define Banned Words:**\n   - Compile a list of words you want to restrict or filter within your server.\n\n2. **Enable Banned Words System:**\n   - Activate the Banned Words module to automatically detect and take action against prohibited language.\n\n3. **Customized Moderation:**\n   - Specify the moderation actions for users who violate the Banned Words policy.\n\nEnable the Banned Words system now and maintain a welcoming environment by curbing undesirable language`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Enable Anti Banned Words")
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_Enable`)
                                )
                        ]
                    },
                    Type: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription("**Configure Banned Words for this Server**\n\nSet up the list of prohibited words for this server and choose the desired filtering method:\n\n- **Match**: Matches the entire word (case insensitive).\n- **Exact**: Matches the exact word (case sensitive).\n- **Include**: Filters out any message containing the specified word.\n- **Wildcard**: Allows for more flexible filtering using wildcards for partial matches.\n\nChoose the method that best aligns with your moderation preferences and server policies.")
                        ],
                        components: [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_TypeSelectMenu`)
                                        .setPlaceholder("Select Banned Words filter type.")
                                        .setOptions([
                                            {
                                                label: "Match",
                                                value: "match"
                                            },
                                            {
                                                label: "Exact",
                                                value: "exact"
                                            },
                                            {
                                                label: "Includes",
                                                value: "includes"
                                            },
                                            {
                                                label: "Wildcard",
                                                value: "wildcard"
                                            }
                                        ])
                                )
                        ]
                    },
                    AddWord: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setDescription(`**🔍 Word Addition Setup!**\nEnhance content control by adding single or multiple words to your watchlist. 🌐🤖\n\n1. **Single Word:**\n   - Input a term (frick).\n\n2. **Multiple Words:**\n   - Use commas for multiple entries. (frick,heck)`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_AddWord`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Add word(s)")
                                )
                        ]
                    }
                },
                PhishingLinks: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription("**🚫 Shield Your Server: Anti-Phishing Links System Setup**\n\nEnhance your server's security and protect your members from potential threats with our Anti-Phishing Links System! 🛡️ Follow these simple steps to set up this powerful defense:\n\n**Steps to Safeguard Your Server:**\n\n1. **Specify Danger Zones:**\n - Clearly define the types of links that should trigger the system.\n\n2. **Immediate Alerts:**\n - Receive instant alerts for any suspicious links detected.\n\n3. **Automatic Actions:**\n - Choose predefined actions for the system to take upon identifying a potential threat.\n\nBy implementing our Anti-Phishing Links System, you're taking a proactive step towards creating a safer and more secure environment for everyone in your server!")
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Enable Anti Phishing Links")
                                        .setCustomId(`${interaction.guildId}Automod_Setup_PhishingLinks_Enable`)
                                )
                        ]
                    },
                    Type: {}
                },
                MassMention: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription(`**🚀 MassMention Rule Setup!**\nSupercharge your server's moderation with the MassMention rule, part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Customize Mentions Threshold:**\n   - Tailor the number of mentions that trigger the MassMention system.\n\n2. **Immediate Moderation:**\n   - Experience swift moderation for excessive mentions to maintain a balanced server environment.\n\n3. **Fine-Tune Security:**\n   - Adjust the MassMention settings to align with your server's moderation requirements.\n\nEnable MassMention now and enjoy a hassle-free moderation experience!`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_MassMentions_Enable`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Enable Anti Mass Mention")
                                )
                        ]
                    }
                },
                ServerLinks: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription(`**🌐 Server Invites Module Setup!**\nEmpower your server security with the Server Invites module, a key feature of AutoMod by ${client.user?.username}. 🚀🔒\n\n**Quick Setup Guide:**\n\n1. **Customize Settings:**\n   - Tailor the module to your preferences, setting specific criteria for invite detection.\n\n2. **Immediate Moderation:**\n   - Enjoy swift moderation actions for any unwanted or unauthorized server invites.\n\n3. **Protect Community:**\n   - Safeguard your server community by preventing the spread of inappropriate or harmful content.\n\nActivate the Server Invites module now and fortify your server against unauthorized invite activities!`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_ServerInvites_Enable`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Enable Anti Server Invite")
                                )
                        ]
                    }
                }
            },
            functions: {
                BannedWords: {
                    EvaluateWords: (inputString: string): string[] => {
                        return Array.from(new Set(inputString.split(',')))
                            .map(word => word.trim()).filter(word => word !== '');
                    }
                }
            }
        }
    }

    private startUp() {
        this.initializeData().then(() => {
            setInterval(() => {
                this.uploadData()
            }, 1000 * 10);
        })
    }

}