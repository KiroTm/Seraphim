import { CategoryChannel, RoleSelectMenuBuilder, Guild, GuildMember, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Role, TextBasedChannel, TextChannel, PermissionFlagsBits, ApplicationCommandOptionType, ButtonStyle, ChannelType, ApplicationCommandType, StringSelectMenuBuilder, ComponentType, Attachment } from "discord.js"
import { CommandType } from "../../../Main-Handler/ConfigHandler"
import { Command, Callback } from '../../../typings'
export default {
  name: "ticketing",
  description: 'Setup up ticketing for this server!',
  permissions: [PermissionFlagsBits.Administrator],
  type: CommandType.slash,
  options: [
    {
      name: 'setup',
      type: ApplicationCommandOptionType.Subcommand,
      description: '⚙️-Setup your ticketing System',
    },
    {
      name: 'view',
      type: ApplicationCommandOptionType.Subcommand,
      description: '🔎-View your ticketing System',
    },
    {
      name: 'disable',
      type: ApplicationCommandOptionType.Subcommand,
      description: '❌-Disable your ticketing System',
    }
  ],
  callback: async ({ interaction, instance }: Callback) => {
    if (interaction && interaction.isChatInputCommand()) {
      const { options } = interaction;
      await interaction.deferReply({ ephemeral: true })
      switch (options.getSubcommand()) {
        case "setup": {
          const MainPageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Manage Panel")
              .setCustomId(`${interaction.guild?.id}Manage_Panel`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🗄️'),

            new ButtonBuilder()
              .setLabel("Create Panel")
              .setCustomId(`${interaction.guild?.id}Create_Panel`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<:Add:1094332442615226378>')
          );
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Welcome to ${instance._client?.user?.username} Tickets`)
                .setColor('Yellow')
                .setDescription("You can Manage your current panels (if any) or create new panels from scratch.")
              .setImage('attachment://Tickets.gif')
            ],
            components: [MainPageRow],
            files: [
              './Assets/Videos/Tickets/Tickets.gif'
            ]
          })
        }
          break;


        case "view": {

        }
          break;


        case "disable": {

        }
          break;
      }
    }



    // await interaction.deferReply({ ephemeral: true });

    // switch (interaction.options.getSubcommand()) {
    //   case "setup": {
    //     const Panel_Channel = options.getChannel('panel_channel') as TextChannel;
    //     const Ticket_Category = options.getChannel('ticket_category') as CategoryChannel;
    //     const Panel_Button = (options.getString('panel_button') as string).split(',') as string[];
    //     const Button_Text = Panel_Button[0] || 'Ticket';
    //     const Button_Emoji = Panel_Button[1] || '🎫';
    //     const Panel_Description = options.getString('panel_description') as string || undefined;
    //     const Panel_Thumbnail = options.getString('panel_thumbnail') as string || undefined;
    //     const Transcript_Channel = options.getChannel('ticket_transcript_channel') || "None"
    //     const embed = new EmbedBuilder()
    //       .setColor('Blue')
    //       .setTitle('Setup your ticketing panel!')
    //       .setDescription(`We've already got most of the information for your ticket panel, however we would like to further customize your panel.\nHere's the information for your (unfinished) ticket panel:\n→ Channel to send the panel into: ${Panel_Channel}\n→ Category to generate tickets in: ${Ticket_Category}\n→ Channel to send transcripts in: ${Transcript_Channel}\n→ Panel Button: Text-> \`${Button_Text}\`  | \`Emoji\`-> ${Button_Emoji}\n→ Panel Description: ${Panel_Description || "None"}\n→ Panel thumbnail: ${Panel_Thumbnail || "None"}\n\nFinish your panel by adding ticket Admins and mods.`)


    //     const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
    //       .addComponents(
    //         new RoleSelectMenuBuilder({
    //           custom_id: `${interaction.id}_Role_Select_Menu`,
    //           placeholder: "Select Ticket Managers/Helpers",
    //           type: ComponentType.RoleSelect,
    //           maxValues: 5,
    //           minValues: 1
    //         })
    //       )
    //     await interaction.editReply({
    //       embeds: [embed],
    //       components: [row]
    //     })
    //     const collector = channel.createMessageComponentCollector({
    //       time: 60 * 1000,
    //       componentType: ComponentType.RoleSelect
    //     })
    //     collector.on('collect', async (collected) => {
    //       if (collected.customId !== `${interaction.id}_Role_Select_Menu`) return;

    //     })
    //   }
    //     break;

    //   case "": {

    //   }
    //     break;

    //   case "": {

    //   }
    //     break;
    // }

































    // if (interaction) {
    //   if (interaction.isChatInputCommand()) {
    //     const setup = interaction.options.getSubcommand() === 'setup'
    //     const view = interaction.options.getSubcommand() === 'view'
    //     const disable = interaction.options.getSubcommand() === 'disable'
    //     if (setup) {
    //       try {
    //         const Guild = interaction.guild as Guild
    //         const Thumbnail = interaction.options.getString("thumbnail") as string || undefined
    //         const Channel = interaction.options.getChannel("channel") as TextChannel
    //         const Transcript = (interaction.options.getChannel("transcript_channel") as TextChannel).id as string || "None"
    //         const Category = interaction.options.getChannel("category") as CategoryChannel
    //         const Handler = interaction.options.getRole("admins_mods") as Role
    //         const Description = interaction.options.getString("description") || " "
    //         const RawButton1 = interaction.options.getString("button") as string
    //         const Button1 = RawButton1.split(",");
    //         const Emoji1 = Button1[1] || "<:ticket:1071014328385425418>"
    //         const GuildIconUrl = Guild.iconURL({ forceStatic: false }) as string
    //         await TicketChannelSchema.findOneAndUpdate({
    //           GuildID: Guild.id
    //         },
    //           {
    //             GuildID: Guild.id,
    //             Channel: Channel.id,
    //             Category: Category.id,
    //             Transcripts: Transcript,
    //             Handlers: Handler.id,
    //             Description: Description,
    //             Buttons: [Button1[0]],
    //             Emoji1: Emoji1,
    //           },
    //           {
    //             new: true,
    //             upsert: true,
    //           }
    //         );

    //         const Buttons = new ActionRowBuilder<ButtonBuilder>();
    //         Buttons.addComponents(
    //           new ButtonBuilder()
    //             .setCustomId(Button1[0])
    //             .setLabel(Button1[0])
    //             .setStyle(ButtonStyle.Primary)
    //             .setEmoji(Emoji1)
    //         )
    //         const Embed = new EmbedBuilder()
    //           .setAuthor({
    //             name: Guild.name + " | Ticketing System",
    //             iconURL: `${GuildIconUrl ? GuildIconUrl : interaction.client.user.displayAvatarURL({ extension: 'png' })}`
    //           })
    //         Description ? Embed.setDescription(Description) : Embed
    //         Thumbnail ? Embed.setThumbnail(`${Thumbnail}`) : Embed
    //           .setColor("#23e8e8")
    //         const CHANNEL = Guild.channels.cache.find((c) => c.id === `${Channel.id}`) as TextChannel
    //         await CHANNEL.send({
    //           embeds: [Embed],
    //           components: [Buttons]
    //         }).then(async (i) => {
    //           const MessageId = i.id
    //           await TicketChannelSchema.findOneAndUpdate({
    //             GuildID: Guild.id,
    //             Channel: Channel.id,
    //           },
    //             {
    //               GuildID: Guild.id,
    //               Channel: Channel.id,
    //               Category: Category.id,
    //               Transcripts: Transcript,
    //               Handlers: Handler.id,
    //               Description: Description,
    //               Buttons: [Button1[0]],
    //               Emoji1: Emoji1,
    //               Thumbnail: Thumbnail,
    //             },
    //             {
    //               upsert: true,
    //               new: true
    //             })
    //         })


    //         await interaction.reply({
    //           content: "<:AverySuccess:981585438387101696> Done",
    //         })
    //       } catch (err) {
    //         let error = err as Error
    //         const ErrEmbed = new EmbedBuilder()
    //           .setColor('Red')
    //           .setDescription(`
    //             🛑 | Something feels odd... \n Make sure you have followed these:
    //             1. Make sure none of your bottons' names are duplicated
    //             2. Make sure your bottons followed by emojis are like this example: Save,📁
    //             3. Make sure your button name do not exceed 200 characters
    //             4. Make sure your button emojis, are actual emojis, not ids
    //             5. Make sure you've entered a valid gif/image link if any
    //           `)
    //         console.log(err)
    //         await interaction.reply({
    //           content: `${error.message}`,
    //           embeds: [ErrEmbed]
    //         })
    //       }
    //     } else;

    //     if (view) {
    //       const data = await TicketChannelSchema.findOne({ GuildID: interaction.guildId })
    //       if (data) {
    //         const channelId = data.Channel
    //         const categoryId = data.Category
    //         const channel = interaction.guild?.channels.cache.find((ch) => ch.id === channelId) as TextChannel
    //         const transcipt_channel_id = data.Transcripts
    //         const description = data.description
    //         const buttontext = data.Buttons
    //         const buttonEmoji = data.Emoji1
    //         const Handlers = interaction.guild?.roles.cache.find((r) => r.id === data.Handlers) as Role

    //         const embed = new EmbedBuilder()
    //           .setColor('Gold')
    //           .setTitle('Ticketing System')
    //           .setDescription(`Ticket Channel: ${channel}
    //     Ticket transcripts channel: <#${transcipt_channel_id}>
    //     Ticket Moderator role: ${Handlers}
    //     Category for ticket creation: <#${categoryId}>
    //     Ticket description: ${description || "*No description was set*"}
    //     Ticket button text: ${buttontext}
    //     Ticket button emoji : ${buttonEmoji}
    //     `)

    //         await interaction.reply({
    //           embeds: [embed]
    //         })
    //       } else {
    //         const embed = new EmbedBuilder()
    //           .setColor('Red')
    //           .setDescription(`Ticketing System for ${interaction.guild?.name} has not been setup`)

    //         await interaction.reply({
    //           embeds: [embed]
    //         })
    //       }
    //     } else;


    //     if (disable) {
    //       const data = await TicketSetup.findOne({ GuildID: interaction.guildId })
    //       if (!data) {
    //         const embed = new EmbedBuilder()
    //           .setDescription(`Ticketing System for ${interaction.guild?.name} has not been setup`)
    //           .setColor('Red')
    //         await interaction.reply({
    //           embeds: [embed]
    //         })
    //       } else {
    //         await TicketSetup.findOneAndDelete({ GuildID: interaction.guildId })
    //         const embed = new EmbedBuilder()
    //           .setDescription(`Ticketing System for ${interaction.guild?.name} has been deleted`)
    //           .setColor('Green')
    //         await interaction.reply({
    //           embeds: [embed]
    //         })
    //       }
    //     }
    //   }
    // }
  },
  extraInfo: {
    command_detailedExplaination: `Use \`/{COMMAND} help\``
  }
} as Command
