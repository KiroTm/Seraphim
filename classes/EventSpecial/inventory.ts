import { Collection, GuildMember } from "discord.js";
import InventorySchema from "../../models/InventorySchema";
import { ItemClass } from "./item";
import { AllItems } from "./types";

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
        return this.inventoryCollection.get(member.guild.id)?.get(member.user.id) || [];
    }

    public addItemAnimalCrate(member: GuildMember, itemsOrAnimals: { name: string; amount: number } | { name: string, amount: number }[]) {
        const guildId = member.guild.id;
        const userId = member.id;
        const inventoryData = this.inventoryCollection.get(guildId)?.get(userId);
        if (!inventoryData) {
            this.inventoryCollection.set(guildId, new Collection<string, { name: string, amount: number }[]>().set(userId, this.itemsOrAnimalsAsArray(itemsOrAnimals)));
        } else {
            if (Array.isArray(itemsOrAnimals)) {
                itemsOrAnimals.forEach((itemOrAnimal) => {
                    const existing = inventoryData.find((entry) => entry.name === itemOrAnimal.name);
                    if (existing) {
                        existing.amount += itemOrAnimal.amount;
                    } else {
                        inventoryData.push({ name: itemOrAnimal.name, amount: itemOrAnimal.amount });
                    }
                });
            } else {
                const existing = inventoryData.find((entry) => entry.name === itemsOrAnimals.name);
                if (existing) {
                    existing.amount += itemsOrAnimals.amount;
                } else {
                    inventoryData.push({ name: itemsOrAnimals.name, amount: itemsOrAnimals.amount });
                }
            }
        }
    }

    public removeItemAnimalCrate(member: GuildMember, itemsOrAnimals: { name: string, amount: number }[]): 'InventoryError' | void {
        const guildId = member.guild.id;
        const userId = member.id;
        const inventoryData = this.inventoryCollection.get(guildId)?.get(userId);
        if (!inventoryData) return 'InventoryError';
        for (const itemOrAnimal of itemsOrAnimals) {
            const itemIndex = inventoryData.findIndex((value) => value.name.toLowerCase() === AllItems[itemOrAnimal.name]?.name.toLowerCase() || itemOrAnimal.name || undefined)
            if (itemIndex !== -1) {
                const currentItem = inventoryData[itemIndex];
                if (currentItem.amount <= itemOrAnimal.amount) {
                    inventoryData.splice(itemIndex, 1);
                } else {
                    currentItem.amount -= itemOrAnimal.amount;
                }
            }
        }
    }
    
    

    private itemsOrAnimalsAsArray(itemsOrAnimals: { name: string; amount: number } | { name: string, amount: number } | { name: string, amount: number }[]) {
        if (Array.isArray(itemsOrAnimals)) {
            return itemsOrAnimals.map((itemOrAnimal) => ({ name: itemOrAnimal.name, amount: itemOrAnimal.amount }));
        } else {
            return [{ name: itemsOrAnimals.name, amount: itemsOrAnimals.amount }];
        }
    }


    private async initializeInventoryData() {
        try {
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
        }, 10000);
    }
}