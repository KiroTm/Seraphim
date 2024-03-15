import { APIStringSelectComponent, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, PermissionFlagsBits, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuComponent, messageLink } from "discord.js";
import { Callback, Command } from "../../../Main-Handler/typings";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { utils } from "../../Classes/moderation/Automod/utils";
export default {
  name: 'automod',
  description: 'Automod module.',
  type: CommandType.both,
  permissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "setup",
      description: "Setup automod module",
      type: ApplicationCommandOptionType.Subcommand
    },
    {
      name: "view",
      description: "Manage completed automod module.",
      type: ApplicationCommandOptionType.Subcommand
    }
  ],
  callback: async ({ interaction }: Callback) => {
    if (interaction) {
      await interaction.deferReply({ ephemeral: true })
      const subcommand = interaction.options.getSubcommand()
      switch (subcommand) {
        case "setup": {
          const MainPageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Create Rule")
              .setCustomId(`${interaction.guild?.id}Automod_Setup_Main`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<:Add:1094332442615226378>'),

            new ButtonBuilder()
              .setLabel("Manage Rule")
              .setCustomId(`${interaction.guild?.id}Automod_Manage_Main`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🗄️'),

            new ButtonBuilder()
              .setLabel("Default Settings")
              .setCustomId(`${interaction.guild?.id}Automod_Setup_AdvancedSetting_IgnoredChannels`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:Gear:1215967263354650664>")
          );
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Welcome to ${interaction.client?.user?.username} Automod`)
                .setColor('Yellow')
                .setDescription('Automod module allows you to manage and automate moderation tasks effectively. With Automod, you can create custom rules tailored to your server\'s needs. Take advantage of advanced settings such as default configurations and ignored roles to streamline your moderation efforts. Configure rules, manage existing ones, and enhance your server\'s security effortlessly.')
                .setImage('attachment://Automod.gif')
            ],
            components: [MainPageRow],
            files: [
              './Assets/Videos/Automod/Automod.gif'
            ]
          })
        }
      }
    }
  }
} as Command
