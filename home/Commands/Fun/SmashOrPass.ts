// import { ApplicationCommandOptionType, ChatInputApplicationCommandData, ChatInputCommandInteraction, EmbedBuilder, Interaction, PermissionFlagsBits } from 'discord.js'
// import { SmashOrPass, SmashOrPassActionRow_Dropdown, SmashOrPassEmbed_Main } from "../../Classes/Misc/smashorpass";
// import { CommandType } from "../../../NeoHandler/ConfigHandler";
// import { Callback, Command } from "../../../NeoHandler/typings";
// import { ChatInputCommand } from '@sapphire/framework';
// const SmashOrPassClass = new SmashOrPass()
// export default {
//     name: "smash-or-pass",
//     description: "Smash OR Pass",
//     type: CommandType.slash,
//     options: [
//         {
//             name: "create",
//             description: "Create a new smash or pass game",
//             type: ApplicationCommandOptionType.Subcommand,
//             required: true,
//             options: [
//                 {
//                     name: "nsfw",
//                     description: "Should the game be nsfw?",
//                     type: ApplicationCommandOptionType.Boolean
//                 },
//                 {
//                     name: "anonymous_voting",
//                     description: "Should the game have anonymous voting?",
//                     type: ApplicationCommandOptionType.Boolean
//                 }
//             ]
//         },
//         {
//             name: "delete",
//             description: "Delete an existing game.",
//             required: true,
//             type: ApplicationCommandOptionType.Subcommand,
//             options: [
//                 {
//                     name: "id",
//                     description: "Game ID",
//                     required: true,
//                     type: ApplicationCommandOptionType.String
//                 }
//             ]
//         },
//         {
//             name: "view",
//             description: "View a game info",
//             type: ApplicationCommandOptionType.Subcommand,
//             options: [
//                 {
//                     name: "id",
//                     description: "Game ID",
//                     required: true,
//                     type: ApplicationCommandOptionType.String
//                 }
//             ]
//         },
//     ],
//     permissions: [PermissionFlagsBits.Administrator],
//     callback: async ({ interaction }: Callback) => {

//         const Subcommand = interaction.options.getSubcommand();

//         let gameID = interaction?.options?.getString?.bind("id");
        
//         switch (Subcommand) {

//             case "create": {
//                 let game = SmashOrPassClass.getGameData(interaction);

//                 if (game) {

//                     const embed = SmashOrPassClass.generateGameInfoEmbed(interaction, game.firstKey())

//                     if (typeof embed === 'string') return 

//                     await interaction.editReply({
//                         embeds: []
//                     })
//                 }

//                 await interaction.reply({
//                     embeds: [
//                         new EmbedBuilder()
//                         .setColor('Blue')
//                         .setDescription("Create a new smash or pass game!")
//                     ]
//                 })
//             }
//                 break;

//             case "view": {
//             }
//                 break;

//             case "delete": {
//             }
//                 break;

//         }
//     }
// } as Command

// function returnError(interaction: ChatInputCommandInteraction, ) {
//     interaction.isRepliable ? interaction.reply({
//         embeds: [
//             new EmbedBuilder()
//             .setColor('Red')
//             .setDescription("")
//         ]
//     })
// }