import { APISelectMenuOption, ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, Collection, Embed, EmbedBuilder, ModalSubmitInteraction, RestOrArray, RoleSelectMenuBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import ms from "ms";
import { garnetClient as client } from "../../../..";
import { automodtype, AdvancedSettingCustomActions, AutomodSetupInterface } from "./automod";

export function utils(interaction: | ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction | ChatInputCommandInteraction) {
  return {
    constants: {
      Main: {
        embeds: [
          new EmbedBuilder()
            .setColor("Blue")
            .setAuthor({
              name: `${client.user?.username}`,
              iconURL: `${client.user?.displayAvatarURL()}`,
            })
            .setDescription(
              `**🌟 Welcome to AutoMod Configuration!**\nElevate your server's moderation game with AutoMod by ${client.user?.username}! 🤖✨\n\n**Getting Started:**\n\n1. **Rule Selection:**\n   - Choose the type of rule you want to configure from a variety of options.\n\n2. **Fine-Tune Settings:**\n   - Customize each rule to suit your server's unique needs.\n\n3. **Instant Moderation:**\n   - Enjoy swift moderation actions for rule violations.\n\n4. **Rule Combos:**\n   - Explore the possibilities of combining rules for comprehensive moderation.\n\nEmpower your server with the advanced moderation features of AutoMod. Follow these steps and ensure a safer and more enjoyable community experience!`,
            ),
        ],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setPlaceholder("Select automod rule type")
              .setCustomId(
                `${interaction.guildId}Automod_Setup_RuleType_SelectMenu`,
              )
              .addOptions(
                Object.keys(automodtype).map((key) => ({
                  label: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
                  value: automodtype[key as keyof typeof automodtype],
                })) as SelectMenuComponentOptionData[],
              ),
          ),
        ],
        files: []
      },
      BannedWords: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                `**🚫 Banned Words System Setup!**\nElevate your server's content moderation with the Banned Words system, a robust feature of AutoMod by ${client.user?.username}. 🌟🔍\n\n**Quick Setup Guide:**\n\n1. **Define Banned Words:**\n   - Compile a list of words you want to restrict or filter within your server.\n\n2. **Enable Banned Words System:**\n   - Activate the Banned Words module to automatically detect and take action against prohibited language\n\nSet up the list of prohibited words for this server and choose the desired filtering method:\n\n- **Match**: Matches the entire word (case insensitive).\n- **Exact**: Matches the exact word (case sensitive).\n- **Include**: Filters out any message containing the specified word.\n\nChoose the method that best aligns with your moderation preferences and server policies.`,
              ),
          ],
          components: [
            new ActionRowBuilder<
              StringSelectMenuBuilder | ButtonBuilder
            >().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_BannedWords_TypeSelectMenu`,
                )
                .setPlaceholder("Select Banned Words filter type.")
                .setOptions([
                  { label: "Match", value: "match" },
                  { label: "Exact", value: "exact" },
                  { label: "Includes", value: "includes" },
                ]),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
        AddWord: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle(
                interaction.isButton() &&
                  interaction.message?.embeds[0]?.title &&
                  ["match", "includes", "exact"].includes(
                    interaction.message.embeds[0].title,
                  )
                  ? interaction.message.embeds[0].title
                  : null,
              )
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setDescription(
                `**🔍 Word Addition Setup!**\nEnhance content control by adding single or multiple words to your watchlist. 🌐🤖\n\n1. **Single Word:**\n   - Input a term (frick).\n\n2. **Multiple Words:**\n   - Use commas for multiple entries. (frick,heck)`,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_BannedWords_Main`,
                ),

              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_BannedWords_AddWord`,
                )
                .setStyle(ButtonStyle.Primary)
                .setEmoji("<:plus:1180907179172167862>")
                .setLabel("Add word(s)"),
            ),
          ],
        },
      },
      PhishingLinks: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "**🚫 Shield Your Server: Anti-Phishing Links System Setup**\n\nEnhance your server's security and protect your members from potential threats with our Anti-Phishing Links System! 🛡️ Follow these simple steps to set up this powerful defense:\n\n**Steps to Safeguard Your Server:**\n\n1. **Specify Danger Zones:**\n - Clearly define the types of links that should trigger the system.\n\n2. **Immediate Alerts:**\n - Receive instant alerts for any suspicious links detected.\n\n3. **Automatic Actions:**\n - Choose predefined actions for the system to take upon identifying a potential threat.\n\nBy implementing our Anti-Phishing Links System, you're taking a proactive step towards creating a safer and more secure environment for everyone in your server!",
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enable Anti Phishing Links")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_PhishingLinks_Enable`,
                ),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
        Type: {},
      },
      MassMention: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                `**🚀 MassMention Rule Setup!**\nSupercharge your server's moderation with the MassMention rule, part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Customize Mentions Threshold:**\n   - Tailor the number of mentions that trigger the MassMention system.\n\n2. **Immediate Moderation:**\n   - Experience swift moderation for excessive mentions to maintain a balanced server environment.\n\n3. **Fine-Tune Security:**\n   - Adjust the MassMention settings to align with your server's moderation requirements.\n\nEnable MassMention now and enjoy a hassle-free moderation experience!`,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_MassMention_Limit_Setup`,
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Setup Mentions Limit"),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      ServerLinks: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                `**🌐 Server Invites Module Setup!**\nEmpower your server security with the Server Invites module, a key feature of AutoMod by ${client.user?.username}. 🚀🔒\n\n**Quick Setup Guide:**\n\n1. **Customize Settings:**\n   - Tailor the module to your preferences\n\n2. **Immediate Moderation:**\n   - Enjoy swift moderation actions for any unwanted or unauthorized server invites.\n\n3. **Protect Community:**\n   - Safeguard your server community by preventing the spread of inappropriate or harmful content.\n\nActivate the Server Invites module now and fortify your server against unauthorized invite activities!`,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_ServerInvites_Enable`,
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enable Anti Server Invite"),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      MassEmoji: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                `**🎉 MassEmoji Rule Setup!**\nEnhance your server's moderation with the MassEmoji rule, part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Customize Emoji Threshold:**\n   - Tailor the number of emojis that trigger the MassEmoji system.\n\n2. **Immediate Moderation:**\n   - Experience swift moderation for excessive emoji usage to maintain a balanced server environment.\n\n3. **Fine-Tune Security:**\n   - Adjust the MassEmoji settings to align with your server's moderation requirements.\n\nEnable MassEmoji now and enjoy a hassle-free moderation experience!`,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_MassEmoji_Limit_Setup`,
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Setup Emoji Limit"),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      LinkCooldown: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                `**⏳ Link Cooldown Rule Setup!**\nEnhance your server's moderation with the Link Cooldown rule, part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Define Cooldown Time:**\n   - Set the cooldown time between consecutive links sent by users.\n\n2. **Immediate Moderation:**\n   - Experience swift moderation for users who exceed the defined link cooldown.\n\n3. **Fine-Tune Security:**\n   - Adjust the Link Cooldown settings to align with your server's moderation requirements.\n\nEnable Link Cooldown now and enjoy a hassle-free moderation experience!`,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_LinkCooldown_Cooldown_Setup`,
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Setup Cooldown Time"),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      NewLines: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "**🔄 New Lines Rule Setup**\n\nEnhance your server's content cleanliness with the New Lines rule, a part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Immediate Moderation:**\n - Experience swift moderation for users who excessively use new lines in messages.\n\n2. **Fine-Tune Security:**\n - Adjust the New Lines settings to align with your server's moderation requirements.\n\nEnable the New Lines rule now and maintain a neat and organized server environment!",
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enable New Lines Rule")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_NewLines_Enable`,
                ),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      ChatFlood: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "**💬 Chat Flood Rule Setup**\n\nEnhance your server's chat experience with the Chat Flood rule, a part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Immediate Moderation:**\n - Experience swift moderation for users who flood the chat with excessive messages.\n\n2. **Fine-Tune Security:**\n - Adjust the Chat Flood settings to align with your server's moderation requirements.\n\nEnable the Chat Flood rule now and maintain a balanced and organized chat environment!",
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enable Chat Flood Rule")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_ChatFlood_Enable`,
                ),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      FastMessage: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "**⚡ Fast Message Rule Setup**\n\nEnhance your server's chat experience with the Fast Message rule, a part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Immediate Moderation:**\n - Experience swift moderation for users who send messages too quickly.\n\n2. **Fine-Tune Security:**\n - Adjust the Fast Message settings to align with your server's moderation requirements.\n\nEnable the Fast Message rule now and maintain a balanced and organized chat environment! \n\n**Explanation:**\n\nThe Fast Message rule is implemented to manage situations where users send messages at an unusually fast pace. Such behavior can flood the chat and disrupt the flow of conversation, leading to a less enjoyable chat experience for all members. By enabling the Fast Message rule, the server can promptly detect instances of rapid message sending and take immediate moderation actions to address the issue effectively. Server administrators have the flexibility to adjust the rule settings to suit the moderation requirements of their server, ensuring a balanced and organized chat environment for all members. Enabling the Fast Message rule helps to maintain a pleasant and engaging chat atmosphere, promoting healthier and more constructive interactions among server members."
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_FastMessage_Limit_Setup`,
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Setup FastMessage"),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      AllCaps: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${client.user?.username}`,
                iconURL: `${client.user?.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "**🔠 All Caps Rule Setup**\n\nEnhance your server's communication etiquette with the All Caps rule, a part of AutoMod by ${client.user?.username}. 🌟🤖\n\n**Quick Setup Guide:**\n\n1. **Immediate Moderation:**\n - Experience swift moderation for messages written in all capital letters.\n\n2. **Fine-Tune Security:**\n - Adjust the All Caps rule settings to align with your server's moderation requirements.\n\nEnable the All Caps rule now and promote a more respectful and readable chat environment! \n\n**Explanation:**\n\nThe All Caps rule is implemented to discourage the excessive use of capital letters in messages. Messages written in all caps can be perceived as shouting and may create a disruptive atmosphere in the chat. By enabling the All Caps rule, the server can promptly detect messages written in all caps and take immediate moderation actions to address the issue effectively. Server administrators have the flexibility to adjust the rule settings to suit the moderation requirements of their server, promoting a more respectful and readable chat environment for all members."
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Enable All Caps Rule")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AllCaps_Enable`,
                ),
            ),

            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Back")
                .setEmoji("<:back:1159470407527694367>")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`${interaction.guildId}Automod_Setup_Main`),
            ),
          ],
        },
      },
      AdvancedSettings: {
        Main: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setDescription(
                `**🌟 Dive into AutoMod's Advanced Settings Wizard!**\nWelcome to the world of enhanced moderation with AutoMod, courtesy of ${interaction.client.user?.username}! 🤖✨\n\n**Unlock the Power:**\n1. **Rule Selection:** - Choose from a variety of rule types to tailor moderation to your server's unique atmosphere.\n\n2. **Instant Moderation:** - Swiftly enforce rules with instant moderation actions, ensuring a responsive and secure environment.\n\n3. **Ignored Channels and Roles:** - Configure exemptions for certain channels and roles, allowing flexibility in rule application.\n\n4. **Custom Actions:** - Implement personalized actions for handling rule violations, giving your community a distinct touch.\n\nElevate your server's moderation game with AutoMod's advanced features. Follow these steps for a more secure and enjoyable community experience!\nDefault:\`None\``,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Setup Advanced Settings")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels`,
                ),
            ),
          ],
          files: []
        },
        IgnoredRoles: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle(
                interaction.isButton() &&
                  interaction?.message?.embeds[0]?.title &&
                  Object.keys(automodtype).includes(
                    interaction.message.embeds[0].title,
                  )
                  ? interaction.message.embeds[0].title
                  : null,
              )
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setDescription(
                `**🌟 Ignored Roles Configuration:**\nExclude specific roles with Ignored Roles for enhanced control and a better community experience! 🤖✨\nDefault:\`None\``,
              ),
          ],
          components: [
            new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
              new RoleSelectMenuBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRole_SelectMenu`,
                )
                .setPlaceholder("Select roles to ignore")
                .setMaxValues(10)
                .setMinValues(1),
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction`,
                )
                .setLabel("Skip")
                .setEmoji("<:track_forward:1159470397612380171>")
                .setStyle(ButtonStyle.Secondary),
            ),
          ],
        },
        IgnoredChannels: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle(
                interaction.isButton() && interaction?.message?.embeds
                  ? interaction.message.embeds[0]?.title ??
                  interaction.message.embeds[1]?.title ??
                  null
                  : null,
              )
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setDescription(
                `**Ignored Channels Configuration:**\nExclude specific channels from rule enforcement to accommodate different content and discussions, by configuring Ignored Channels, you ensure that certain areas of your server remain unaffected by specific rules, fostering a more tailored moderation experience.\nDefault:\`None\``,
              ),
          ],
          components: [
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_SelectMenu`,
                )
                .setChannelTypes([ChannelType.GuildText])
                .setMaxValues(10)
                .setMinValues(1)
                .setPlaceholder("Select Channels to ignore"),
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles`,
                )
                .setLabel("Skip")
                .setEmoji("<:track_forward:1159470397612380171>")
                .setStyle(ButtonStyle.Secondary),
            ),
          ],
          files: []
        },
        CustomAction: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle(
                interaction.isButton() && interaction?.message?.embeds
                  ? interaction.message.embeds[0]?.title ??
                  interaction.message.embeds[1]?.title ??
                  null
                  : null,
              )
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setDescription(
                `**Custom Action Configuration:**\nCustomize specific actions like mute, ban, kick, or ignore to enforce tailored moderation policies in your server.\nThese actions will only trigger once the threshold criteria is met; which will be setup shortly.\n\nFor the sake of simplicity ${client.user?.username} Automod only offers 1 global action per automod rule.\nDefault:\`None\``,
              ),
          ],
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_SelectMenu`,
                )
                .setMinValues(1)
                .setMaxValues(1)
                .setPlaceholder("Choose action type")
                .setOptions(
                  Object.values(AdvancedSettingCustomActions).map(
                    ({ id, emoji }) => {
                      return { label: id, value: id, emoji };
                    },
                  ),
                ),
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Skip")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold`,
                ),
            ),
          ],
        },
        Threshold: {
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle(
                interaction.isButton() && interaction?.message?.embeds
                  ? interaction.message.embeds[0]?.title ??
                  interaction.message.embeds[1]?.title ??
                  null
                  : null,
              )
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setDescription(
                `**Threshold Configuration:**\nDefine the amount of violations until the bot takes an action\nDefault:\`2\``,
              ),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Add Threshold")
                .setCustomId(
                  `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Setup`,
                ),
            ),
          ],
        },
      },
    },
    functions: {
      General: {
        RemoveField: (main: Embed | undefined, info: Embed, query: string) => {
          const fields =
            info?.fields?.filter((val) => val.name !== query) ?? [];
          const embeds = [];

          if (main) embeds.push(new EmbedBuilder(main.data))

          if (fields.length > 0) {
            embeds.push(new EmbedBuilder(info.data).setFields(fields));
          }
          return embeds;
        },
        EvaluateNumber: (input: string) => {
          const int = parseInt(input);
          if (Number.isNaN(int) || int < 0) return int < 0 ? "INT_ZERO" : "INVALID_TYPE";
          return int;
        },
        EvaluateDuration: (input: string) => {
          const milliseconds = ms(input);
          if (milliseconds == -1) return input
          if (isNaN(milliseconds)) return "INVALID_TYPE";
          return ms(milliseconds, { long: true });
        }
      },
      BannedWords: {
        EvaluateWords: (inputString: string): string[] => {
          return Array.from(new Set(inputString.split(",")))
            .map((word) => word.trim())
            .filter((word) => word !== "");
        },
      },
      Manage: {
        constructActionOptions: (ruleType: automodtype,): SelectMenuComponentOptionData[] => {
          const numberEmojis: { [key: number]: string } = {
            1: '1️⃣',
            2: '2️⃣',
            3: '3️⃣',
            4: '4️⃣',
            5: '5️⃣',
            6: '6️⃣',
            7: '7️⃣',
            8: '8️⃣',
            9: '9️⃣',
            10: '🔟'
        };        
          let options: Array<SelectMenuComponentOptionData> = [
            {
              label: "Enable",
              value: "enable"
            },
            {
              label: "Disable",
              value: "disable"
            },
            {
              label: "Advanced Settings",
              value: "advancedsettings"
            }
          ];


          if (ruleType === automodtype.MassMention || ruleType === automodtype.MassEmoji || ruleType === automodtype.LinkCooldown || ruleType === automodtype.FastMessage || ruleType === automodtype.BannedWords) options.push({ label: ruleType === automodtype.LinkCooldown ? "Duration" : ruleType === automodtype.BannedWords ? "Words" : "Limit", value: ruleType === automodtype.LinkCooldown ? "duration" : ruleType === automodtype.BannedWords ? "words" : "limit" })
          return options.map((option, index) => {
            const { label, value } = option;
            const emoji = numberEmojis[index + 1];
            return {
              label,
              value,
              emoji
            };
          });
        },
        constructRuleType: (config?: Collection<automodtype, AutomodSetupInterface> | undefined, setDefault?: string | undefined) => {
          return Object.keys(automodtype).map((key) => {
            const rule = config?.find((val) => val.type === automodtype[key as keyof typeof automodtype])
                return {
                    label: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
                    value: automodtype[key as keyof typeof automodtype],
                    emoji: rule && rule.enabled ? "<:on:1146683600641736744>" : "<:off:1146683633483141140>",
                    default: setDefault === key.toLowerCase() ? true : false
                }
          })
        }
      }
    },
  };
}