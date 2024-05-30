import { ActionRowBuilder, Activity, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ComponentType, EmbedBuilder, Guild, GuildMember, Message, TextChannel } from "discord.js";
import DropSchema from "../../../../src/Models/Drop-Schema";
import { client } from "../../../../src";
import { InventoryClass } from "./inventory";
import { CrateType, dropTypes } from "./crate";

const inventoryInstance = InventoryClass.getInstance();

export class DropClass {
    private static instance: DropClass;
    private weightBasedCrates: Array<keyof typeof dropTypes> = []
    public DropsSetupData: Collection<string, string> = new Collection();

    private constructor() {
        this.initializeDropsData().then(() => {
            this.startUp();
        });
    }

    public static getInstance(): DropClass {
        return this.instance || (this.instance = new DropClass());
    }

    private shouldSendDrop(channel: TextChannel): boolean {
        const recentMessagesWithinTimeFrame = channel.messages.cache.filter(({ createdTimestamp }) => {
            const timeDifference = Date.now() - createdTimestamp;
            return timeDifference < 84 * 1000;
        });
        return recentMessagesWithinTimeFrame.size >= 5;
    }

    private async sendDrops(checkActivity = false) {
        if (!this.DropsSetupData) return;

        for (const [guildId, channelId] of this.DropsSetupData) {
            const guild = client.guilds.cache.get(guildId) as Guild | undefined;

            if (!guild) continue;

            const channel = client.channels.cache.get(channelId) as TextChannel

            if (!channel) return;

            if (checkActivity && !this.shouldSendDrop(channel as TextChannel)) continue;

            let crate_name: string = '';

            crate_name = this.pickRandomDrop()
            const crate = dropTypes[crate_name as CrateType];

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${guild.id}-${channel.id}`)
                        .setLabel('Collect')
                        .setStyle(ButtonStyle.Success)
                );

            const response = await channel.send({
                content: `A mystery drop has appeared!`,
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('Unknown Crate')
                        .setDescription("This holds a monster behind! (that's what she said)")
                        .setThumbnail("https://media.discordapp.net/attachments/1162785970064740513/1163745740833706094/image.png")
                ],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                max: 2,
                maxUsers: 3,
                time: 12 * 1000
            });

            let description: string = '';

            collector.on('collect', async (int) => {
                const interaction = int as ButtonInteraction;
                const [interactionGuildId, interactionChannelId] = interaction.customId.split('-');
                if (guildId !== interactionGuildId || channelId !== interactionChannelId) return;
                interaction.reply({ content: 'Your click was registered', ephemeral: true })
                const member = interaction.member as GuildMember;
                inventoryInstance.addItemAnimalCrate(member, [{ name: crate_name, amount: 1 }]);
                description += `\n${member.nickname ?? member.user.globalName ?? member.user.username}`
            });

            collector.on('end', async (collected, reason) => {
                if (reason == 'time' && collected.size == 0) {
                    await response.edit({embeds: [], components: [], content: "No one claimed. Sad"})
                    return;
                }
                crate_name = crate_name.charAt(0).toUpperCase() + crate_name.slice(1)
                const CollectedEmbed = new EmbedBuilder().setColor('Blue').setThumbnail(crate.image).setTitle(`${crate_name} Crate`).setDescription(crate.description ?? 'Unknown').setFields({ name: "Collectors:", value: description ?? 'None', inline: false })
                const CollectedObject = { content: `The Crate was **${crate_name}** ${crate.emoji}`, embeds: [CollectedEmbed], components: [] }
                response.edit(CollectedObject)
                setTimeout(() => {
                    response.delete().catch(() => { })
                }, 5000);
                return;
            })
        }
    }


    private pickRandomDrop(): string {
        return this.weightBasedCrates[Math.floor(Math.random() * this.weightBasedCrates.length)]
    }

    private setWeightBasedCrates(){
        for (const rarity in dropTypes) {
            if (Object.prototype.hasOwnProperty.call(dropTypes, rarity)) {
                for (let i = 0; i < dropTypes[rarity as keyof typeof dropTypes].weight; i++) {
                    this.weightBasedCrates.push(rarity as keyof typeof dropTypes);
                }
            }
        }
    }

    private async initializeDropsData() {
        const dropSetups = await DropSchema.find();

        for (const dropSetup of dropSetups) {
            const { GuildID, ChannelID } = dropSetup;
            this.DropsSetupData.set(GuildID, ChannelID);
        }
    }

    public trigger(checkActivity: boolean) {
        // this.sendDrops(checkActivity ?? true);
    }

    private startUp() {
        
    }
}