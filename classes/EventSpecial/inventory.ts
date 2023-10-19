import { Collection, GuildMember } from "discord.js";
import InventorySchema from "../../models/InventorySchema";
import { ItemClass } from "./item";

export class InventoryClass {
    private static instance: InventoryClass;
    private inventoryCollection: Collection<string, Collection<string, { name: string, amount: number }[]>> = new Collection()

    private constructor() {
        this.initializeInventoryData().then(() => {
            this.startUp();
        });
    }

    public static getInstance(): InventoryClass {
        return this.instance || (this.instance = new InventoryClass());
    }

    public async addItemToInventory(member: GuildMember, item: { name: string, amount: number }) {
        const guildID = member.guild.id;
        const userID = member.id;

        if (!this.inventoryCollection.has(guildID)) {
            this.inventoryCollection.set(guildID, new Collection());
        }

        if (!this.inventoryCollection.get(guildID)!.has(userID)) {
            this.inventoryCollection.get(guildID)!.set(userID, []);
        }

        const userInventory = this.inventoryCollection.get(guildID)!.get(userID)!;

        if (this.ValidateItem(item.name)) {
            const existingItem = userInventory.find((i) => i.name === item.name);

            if (existingItem) {
                existingItem.amount += item.amount;
            } else {
                userInventory.push(item);
            }
        } else {
            console.log(`Invalid item: ${item.name}`);
        }
    }

    public getInventory(member: GuildMember) {
        const guildID = member.guild.id;
        const userID = member.id;
        if (this.inventoryCollection.has(guildID) && this.inventoryCollection.get(guildID)!.has(userID)) {
            return this.inventoryCollection.get(guildID)!.get(userID);
        } else {
            return [];
        }
    }

    private async initializeInventoryData() {
        try {
            // Fetch all inventory data from MongoDB
            const inventoryData = await InventorySchema.find();
            for (const entry of inventoryData) {
                const guildID = entry.GuildID;
                const userID = entry.UserID;
                const items = entry.Items;
                if (!this.inventoryCollection.has(guildID)) {
                    this.inventoryCollection.set(guildID, new Collection());
                }
                this.inventoryCollection.get(guildID)!.set(userID, items);
            }
        } catch (error) {
            console.error('Error initializing inventory data:', error);
        }
    }

    private async uploadInventoryDataToMongo() {
        try {
            for (const [guildID, users] of this.inventoryCollection) {
                for (const [userID, items] of users) {
                    await InventorySchema.updateOne(
                        { GuildID: guildID, UserID: userID },
                        { Items: items },
                        { upsert: true }
                    );
                }
            }
        } catch (error) {
            console.error('Error uploading inventory data to MongoDB:', error);
        }
    }

    private startUp() {
        setInterval(() => {
            this.uploadInventoryDataToMongo();
        }, 20000);
    }

    private ValidateItem(item: string) {
        return new ItemClass().getItem(item)
    }
}