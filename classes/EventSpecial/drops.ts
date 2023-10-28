import { ActionRowBuilder, Activity, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ComponentType, EmbedBuilder, Guild, GuildMember, Message, TextChannel } from "discord.js";
import DropSchema from "../../models/Drop-Schema";
import { client } from "../..";
import { InventoryClass } from "./inventory";
import { dropTypes } from "../../classes/EventSpecial/crate";

const inventoryInstance = InventoryClass.getInstance();

export class DropClass {
    private static instance: DropClass;
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

    private async sendDrops(checkActivity?: boolean) {
        if (!this.DropsSetupData) return;
        const check = checkActivity || false;

        this.DropsSetupData.forEach(async (drop_value, drop_key) => {
            const guild = client.guilds.cache.get(drop_key) as Guild | undefined;

            if (!guild) return;

            const channel = client.channels.cache.get(drop_value);

            if (!channel || !channel.isTextBased()) return;

            if (check && !this.shouldSendDrop(channel as TextChannel)) return;

            const Embed = new EmbedBuilder()
                .setColor('#2b2d32')
                .setDescription(`A mystery drop appeared!`)
                .setImage(`https://i.imgur.com/BLtdF0M.png`)
                .setTitle("Halloween Drops");

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${guild.id}-${channel.id}`)
                        .setLabel('Collect')
                        .setStyle(ButtonStyle.Success)
                );
            const response = await channel.send({
                embeds: [Embed],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, max: 1, maxUsers: 2, time: 10000 });
            collector.on('collect', async (int) => {
                int.deferUpdate()
                response.edit({ components: [] })
            })
            collector.on('end', async (int, reason) => {
                if (reason == 'time') {
                    response.edit({ embeds: [Embed.setColor('Red').addFields({ name: "Collectors:", value: "None", inline: false })], components: [] });
                    setTimeout(async () => {
                        response.delete().catch(() => { });
                        return;
                    }, 1000 * 5);
                }
                const interaction = int.values().next().value as ButtonInteraction;
                const [guildId, channelId] = interaction.customId.split('-');
                const crate_name = this.pickRandomDrop();
                const crate = dropTypes[crate_name];
                const collection = this.DropsSetupData.get(guildId);
                if (!collection || collection !== channelId) return;
                const member = interaction.member as GuildMember;
                inventoryInstance.addItemAnimalCrate(member, [{ name: crate_name, amount: 1 }]);
                const field = { name: "Collectors", value: `${Embed.data.fields ? `${Embed.data.fields.map((value) => `${value.value}`).join()}\n` : ""}  ${member}`, inline: false };
                interaction.message.edit({
                    embeds: [Embed.setFields(field).setImage(crate.image).setDescription(`The mystery drop was: ${crate_name.toUpperCase()}`)],
                    components: []
                });

                setTimeout(() => {
                    interaction.message.delete().catch(() => { });
                }, 1000 * 6);
            });
        });
    }

    private pickRandomDrop(): keyof typeof dropTypes {
        const weightedRarities: (keyof typeof dropTypes)[] = [];

        for (const rarity in dropTypes) {
            if (Object.prototype.hasOwnProperty.call(dropTypes, rarity)) {
                for (let i = 0; i < dropTypes[rarity as keyof typeof dropTypes].weight; i++) {
                    weightedRarities.push(rarity as keyof typeof dropTypes);
                }
            }
        }

        const randomIndex = Math.floor(Math.random() * weightedRarities.length);
        return weightedRarities[randomIndex];
    }

    private async initializeDropsData() {
        const dropSetups = await DropSchema.find();

        for (const dropSetup of dropSetups) {
            const { GuildID, ChannelID } = dropSetup;
            this.DropsSetupData.set(GuildID, ChannelID);
        }
    }

    public trigger(checkActivity: boolean) {
        this.sendDrops(checkActivity ?? true);
    }

    private uploadDropsDataToMongoDbAndIdkIWantToMakeThisLongAsFuck() {

    }

    private startUp() {
        this.sendDrops(true);
        setInterval(() => {
            this.sendDrops(true);
            this.uploadDropsDataToMongoDbAndIdkIWantToMakeThisLongAsFuck();
        }, 60000);
    }
}