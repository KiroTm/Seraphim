import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Channel, Collection, Embed, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../typings";
import DropSchema from "../../../models/Drop-Schema";
import { DropClass } from "../../../classes/EventSpecial/drops";
import { MemberClass } from "../../../classes/misc/member";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";  // Import the InventoryClass
const dropClass = DropClass.getInstance();
const inventoryInstance = InventoryClass.getInstance();  // Get an instance of the InventoryClass

export default {
    name: "drops",
    description: "Setup and manage Halloween special module, drops!",
    type: CommandType.both,
    options: [
        {
            name: "setup",
            description: "Setup drops in your server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: 'Channel you want drops to be sent to.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        }
    ],
    args: {
        minArgs: 4,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}drop remove/grant user amount"
    },
    permissions: [PermissionFlagsBits.ManageRoles],
    callback: async ({ message, interaction, args, guild }: Callback) => {
        if (message) {
            const member = new MemberClass().fetch(guild, args[1], message) as GuildMember;

            if (!member) {
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid member!")],
                });
            }

            if (args[0] === 'grant' && ['Common', 'Uncommon', 'Rare', 'Mythic'].includes(args[2])) {
                const crate_name = args[2];
                const amount = parseInt(args[3]);
                if (!amount) return message.channel.send("Invalid amount");
                
                // Use the InventoryClass to add crates to a user's inventory
                inventoryInstance.addItemAnimalCrate(member, [{ name: crate_name, amount: amount }]);
                
                message.channel.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription(`Granted ${amount} ${crate_name} crates to ${member.user.username}`)] });
            } else if (args[0] === 'remove') {
                // Add code for removing crates from the inventory if needed.
            } else {
                message.channel.send('Invalid Args! Make sure the crate name is among: "Common, Uncommon, Rare, Mythic and action type is among grant/remove"');
            }

        } else if (interaction) {
            await interaction.deferReply({ ephemeral: true })
            const channel = interaction.options.getChannel('channel') as Channel
            if (!channel || (channel && !channel.isTextBased())) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setDescription("Provide a TextChannel").setColor('Red')] });
            }
            await DropSchema.findOneAndUpdate({
                GuildID: interaction.guildId
            },
            {
                GuildID: interaction.guildId,
                ChannelID: channel.id
            },
            {
                upsert: true,
                new: true
            });
            interaction.editReply("Set!");
            dropClass.DropsSetupData.set(`${interaction.guildId}`, channel.id);
        }
    }
} as Command;
