import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalSubmitInteraction, RoleSelectMenuBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder } from "discord.js";
import { client } from "../..";

export enum automodtype {
    BannedWords = 'bannedwords',
    ServerInvites = 'serverinvites',
    PhishingLinks = 'phishinglinks',
    MassMention = 'massmention'
}

export interface AutomodSetupInterface {
    type: automodtype;
    enabled?: boolean;
    filterType?: string;
    customResponse?: string;
    query?: Array<string>;
}

export class AutomodClass {
    private static instance: AutomodClass;
    public AutomodCollection: Collection<string, Collection<string, AutomodSetupInterface[]>> = new Collection();

    private constructor() {
    }

    public static getInstance(): AutomodClass {
        return this.instance || (this.instance = new AutomodClass());
    }

    private getOrCreateGuildCollection(guildId: string): Collection<string, AutomodSetupInterface[]> {
        const existingGuildCollection = this.AutomodCollection.get(guildId);

        if (existingGuildCollection) {
            return existingGuildCollection;
        } else {
            const newGuildCollection = new Collection<string, AutomodSetupInterface[]>();
            this.AutomodCollection.set(guildId, newGuildCollection);
            return newGuildCollection;
        }
    }

    private getOrCreateRuleTypeCollection(guildId: string, type: automodtype): AutomodSetupInterface[] {
        const existingGuildCollection = this.getOrCreateGuildCollection(guildId);
        const existingRules = existingGuildCollection.get(type);

        if (existingRules) {
            return existingRules;
        } else {
            const newRules: AutomodSetupInterface[] = [];
            existingGuildCollection.set(type, newRules);
            return newRules;
        }
    }

    public addOrUpdateRuleType(guildId: string, data: AutomodSetupInterface) {
        const existingRules = this.getOrCreateRuleTypeCollection(guildId, data.type);
        const existingRuleIndex = existingRules.findIndex(rule => rule.query && rule.query.join() === data.query?.join());

        if (existingRuleIndex !== -1) {
            const existingRule = existingRules[existingRuleIndex];
            Object.assign(existingRule, data);
        } else {
            existingRules.push(data);
        }

        const existingGuildCollection = this.getOrCreateGuildCollection(guildId);
        existingGuildCollection.set(data.type, existingRules);
        this.AutomodCollection.set(guildId, existingGuildCollection);
    }


    public enableRuleType(guildId: string, type: automodtype, query: string) {
        const existingRules = this.getOrCreateRuleTypeCollection(guildId, type);
        const index = existingRules.findIndex(rule => rule.query && rule.query.join() === query);

        if (index !== -1) {
            existingRules[index].enabled = true;

            const existingGuildCollection = this.getOrCreateGuildCollection(guildId);
            existingGuildCollection.set(type, existingRules);
            this.AutomodCollection.set(guildId, existingGuildCollection);
        }
    }


    public utils(interaction: ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction | ChatInputCommandInteraction) {
        return {
            constants: {
                Main: {
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                            .setDescription(`**🌟 Welcome to AutoMod Configuration!**\nElevate your server's moderation game with AutoMod by ${client.user?.username}! 🤖✨\n\n**Getting Started:**\n\n1. **Rule Selection:**\n   - Choose the type of rule you want to configure from a variety of options.\n\n2. **Fine-Tune Settings:**\n   - Customize each rule to suit your server's unique needs.\n\n3. **Instant Moderation:**\n   - Enjoy swift moderation actions for rule violations.\n\n4. **Rule Combos:**\n   - Explore the possibilities of combining rules for comprehensive moderation.\n\nEmpower your server with the advanced moderation features of AutoMod. Follow these steps and ensure a safer and more enjoyable community experience!`)
                    ],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setPlaceholder("Select automod rule type")
                                    .setCustomId(`${interaction.guildId}Automod_Setup_RuleType_SelectMenu`)
                                    .addOptions(Object.keys(automodtype).map(key => ({ label: key.replace(/([a-z])([A-Z])/g, '$1 $2'), value: automodtype[key as keyof typeof automodtype] })) as SelectMenuComponentOptionData[])
                            )
                    ]
                },
                BannedWords: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setColor('Blue')
                                .setDescription(`**🚫 Banned Words System Setup!**\nElevate your server's content moderation with the Banned Words system, a robust feature of AutoMod by ${client.user?.username}. 🌟🔍\n\n**Quick Setup Guide:**\n\n1. **Define Banned Words:**\n   - Compile a list of words you want to restrict or filter within your server.\n\n2. **Enable Banned Words System:**\n   - Activate the Banned Words module to automatically detect and take action against prohibited language\n\nSet up the list of prohibited words for this server and choose the desired filtering method:\n\n- **Match**: Matches the entire word (case insensitive).\n- **Exact**: Matches the exact word (case sensitive).\n- **Include**: Filters out any message containing the specified word.\n- **Wildcard**: Allows for more flexible filtering using wildcards for partial matches.\n\nChoose the method that best aligns with your moderation preferences and server policies.`)
                        ],
                        components: [
                            new ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_TypeSelectMenu`)
                                        .setPlaceholder("Select Banned Words filter type.")
                                        .setOptions([
                                            { label: "Match", value: "match" },
                                            { label: "Exact", value: "exact" },
                                            { label: "Includes", value: "includes" },
                                            { label: "Wildcard", value: "wildcard" }
                                        ])
                                ),

                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Back")
                                        .setEmoji("<:back:1159470407527694367>")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`${interaction.guildId}Automod_Setup_Main`)
                                )
                        ]
                    },
                    AddWord: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(interaction.isButton() && interaction.message?.embeds[0]?.title && ['match', 'includes', 'exact', 'wildcard'].includes(interaction.message.embeds[0].title) ? interaction.message.embeds[0].title : null)
                                .setAuthor({ name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}` })
                                .setDescription(`**🔍 Word Addition Setup!**\nEnhance content control by adding single or multiple words to your watchlist. 🌐🤖\n\n1. **Single Word:**\n   - Input a term (frick).\n\n2. **Multiple Words:**\n   - Use commas for multiple entries. (frick,heck)`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Back")
                                        .setEmoji("<:back:1159470407527694367>")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_Main`),

                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_AddWord`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji("<:plus:1180907179172167862>")
                                        .setLabel("Add word(s)"),
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
                                ),

                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Back")
                                        .setEmoji("<:back:1159470407527694367>")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`${interaction.guildId}Automod_Setup_Main`)
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
                                ),

                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Back")
                                        .setEmoji("<:back:1159470407527694367>")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`${interaction.guildId}Automod_Setup_Main`)
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
                                ),

                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Back")
                                        .setEmoji("<:back:1159470407527694367>")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`${interaction.guildId}Automod_Setup_Main`)
                                )
                        ]
                    }
                },
                AdvancedSettings: {
                    Main: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                                .setDescription(`**🌟 Dive into AutoMod's Advanced Settings Wizard!**\nWelcome to the world of enhanced moderation with AutoMod, courtesy of ${interaction.client.user?.username}! 🤖✨\n\n**Unlock the Power:**\n1. **Rule Selection:** - Choose from a variety of rule types to tailor moderation to your server's unique atmosphere.\n\n2. **Instant Moderation:** - Swiftly enforce rules with instant moderation actions, ensuring a responsive and secure environment.\n\n3. **Ignored Channels and Roles:** - Configure exemptions for certain channels and roles, allowing flexibility in rule application.\n\n4. **Custom Actions:** - Implement personalized actions for handling rule violations, giving your community a distinct touch.\n\nElevate your server's moderation game with AutoMod's advanced features. Follow these steps for a more secure and enjoyable community experience!`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel("Setup Advanced Settings")
                                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels`)
                                )
                        ]
                    },
                    IgnoredRoles: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(interaction.isButton() && interaction?.message?.embeds[0]?.title && Object.keys(automodtype).includes(interaction.message.embeds[0].title) ? interaction.message.embeds[0].title : null)
                                .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                                .setDescription(`**🌟 Ignored Roles Configuration:**\nExclude specific roles with Ignored Roles for enhanced control and a better community experience! 🤖✨`)
                        ],
                        components: [
                            new ActionRowBuilder<RoleSelectMenuBuilder>()
                                .addComponents(
                                    new RoleSelectMenuBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRole_SelectMenu`)
                                        .setPlaceholder("Select roles to ignore")
                                        .setMaxValues(10)
                                        .setMinValues(1)
                                ),
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction`)
                                        .setLabel("Skip")
                                        .setEmoji("<:track_forward:1159470397612380171>")
                                        .setStyle(ButtonStyle.Secondary)
                                )
                        ]
                    },
                    IgnoredChannels: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(interaction.isButton() && interaction?.message?.embeds ? interaction.message.embeds[0]?.title ?? interaction.message.embeds[1]?.title ?? null : null)
                                .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                                .setDescription(`**Ignored Channels Configuration:**\nExclude specific channels from rule enforcement to accommodate different content and discussions, by configuring Ignored Channels, you ensure that certain areas of your server remain unaffected by specific rules, fostering a more tailored moderation experience.`)
                        ],
                        components: [
                            new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                .addComponents(
                                    new ChannelSelectMenuBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_SelectMenu`)
                                        .setChannelTypes([ChannelType.GuildText])
                                        .setMaxValues(10)
                                        .setMinValues(1)
                                        .setPlaceholder('Select Channels to ignore')
                                ),
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles`)
                                        .setLabel("Skip")
                                        .setEmoji("<:track_forward:1159470397612380171>")
                                        .setStyle(ButtonStyle.Secondary)
                                )
                        ]
                    },
                    CustomAction: {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(interaction.isButton() && interaction?.message?.embeds ? interaction.message.embeds[0]?.title ?? interaction.message.embeds[1]?.title ?? null : null)
                                .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                                .setDescription(`**Custom Action Configuration:**\nCustomize specific actions like mute, ban, kick, or ignore to enforce tailored moderation policies in your server.\nThese actions will only trigger once the threshold criteria is met; which will be setup shortly.\n\nFor the sake of simplicity ${client.user?.username} Automod only offers 1 global action per automod rule.`)
                        ],
                        components: [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_SelectMenu`)
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setPlaceholder("Choose action type")
                                .setOptions([
                                    {
                                        label: "Mute",
                                        value: 'mute',
                                        emoji: "<:mute:1211755876977872958>"
                                    },
                                    {
                                        label: "Ban",
                                        value: 'ban',
                                        emoji: "<:ban:1211754347797422100>"
                                    },{
                                        label: "Warn",
                                        value: 'warn',
                                        emoji: "<:Warn:1211758195220160512>"
                                    },{
                                        label: "Kick",
                                        value: 'kick',
                                        emoji: "<:kick:1211757211215208469>"
                                    },
                                ])
                            ),
                            new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel("Skip")
                                .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold`)
                            )
                        ]
                    },
                    Threshold: {
                        embeds: [
                            new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle(interaction.isButton() && interaction?.message?.embeds ? interaction.message.embeds[0]?.title ?? interaction.message.embeds[1]?.title ?? null : null)
                            .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                            .setDescription(`**Threshold Configuration:**\nDefine the conditions under which specific actions, such as mute, ban, kick, or ignore, will be enforced to uphold customized moderation policies on your server.\nThese actions will activate once the established threshold criteria are satisfied; you'll set them up in just a moment.\n\nFor simplicity, ${client.user?.username}'s Automod currently supports only one global action per automod rule.`)
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setLabel("Add Threshold")
                                .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Setup`)
                            )
                        ]
                    }
                }
            },
            functions: {
                General: {
                    EnableRule: (type: automodtype, query: string) => {
                        this.enableRuleType(interaction.guildId as string, type, query)
                    },
                },
                BannedWords: {
                    EvaluateWords: (inputString: string): string[] => {
                        return Array.from(new Set(inputString.split(',')))
                            .map(word => word.trim()).filter(word => word !== '');
                    }
                },
                AdvancedSettings: {
                    EvaluateThreshold: (input: string) => {
                        const int = parseInt(input);
                        if (Number.isNaN(int) || int < 0) {
                            return int < 0 ? 'INT_ZERO' : 'INVALID_TYPE';
                        }
                        return int;
                    }
                }
                
            }
        };
    }

}

