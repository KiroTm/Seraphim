import { Collection, GuildMember } from "discord.js";
import InventorySchema from "../../models/InventorySchema";
import { ItemClass } from "./item";

export class InventoryClass {
    private static instance: InventoryClass;
    private inventoryCollection: Collection<string, Collection<string, { name: string, amount: number }[]>> = new Collection();

    private constructor() {
        this.initializeInventoryData().then(() => {
            this.startUp();
        });
    }

    public static getInstance(): InventoryClass {
        return this.instance || (this.instance = new InventoryClass());
    }

    public getInventory(member: GuildMember) {
        return this.inventoryCollection.get(member.guild.id)?.get(member.id) || [];
    }

    public addCratesToInventory(member: GuildMember, crates: { crateName: string; amount: number } | { crateName: string, amount: number }[]) {
        const guildId = member.guild.id;
        const userId = member.id;
        const inventoryData = this.inventoryCollection.get(guildId)?.get(userId);
    
        if (!inventoryData) {
            this.inventoryCollection.set(guildId, new Collection<string, { name: string, amount: number }[]>().set(userId, this.cratesAsArray(crates)));
        } else {
            if (Array.isArray(crates)) {
                crates.forEach((crate) => {
                    const existing = inventoryData.find((item) => item.name === crate.crateName);
                    if (existing) {
                        existing.amount += crate.amount;
                    } else {
                        inventoryData.push({ name: crate.crateName, amount: crate.amount });
                    }
                });
            } else {
                const existing = inventoryData.find((item) => item.name === crates.crateName);
                if (existing) {
                    existing.amount += crates.amount;
                } else {
                    inventoryData.push({ name: crates.crateName, amount: crates.amount });
                }
            }
        }
    }

    private cratesAsArray(crates: { crateName: string; amount: number } | { crateName: string, amount: number } | { crateName: string, amount: number }[]) {
        if (Array.isArray(crates)) {
            return crates.map(crate => ({ name: crate.crateName, amount: crate.amount }));
        } else {
            return [{ name: crates.crateName, amount: crates.amount }];
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