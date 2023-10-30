import { Collection, GuildMember } from "discord.js";
import InventorySchema from "../../models/InventorySchema";
import { AllItems, items } from "./types";

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

        if (!this.inventoryCollection.has(guildId)) {
            this.inventoryCollection.set(guildId, new Collection<string, { name: string, amount: number }[]>());
        }

        const guildCollection = this.inventoryCollection.get(guildId)!;

        if (!guildCollection.has(userId)) {
            guildCollection.set(userId, []);
        }

        const inventoryData = guildCollection.get(userId)!;

        if (Array.isArray(itemsOrAnimals)) {
            itemsOrAnimals.forEach((itemOrAnimal) => {
                const existing = inventoryData.find((entry) => entry.name.toLowerCase() === (itemOrAnimal.name.toLowerCase()));
                if (existing) {
                    existing.amount += itemOrAnimal.amount;
                } else {
                    inventoryData.push({ name: itemOrAnimal.name, amount: itemOrAnimal.amount });
                }
            });
        } else {
            const existing = inventoryData.find((entry) => entry.name.toLowerCase() === (itemsOrAnimals.name.toLowerCase()));
            if (existing) {
                existing.amount += itemsOrAnimals.amount;
            } else {
                inventoryData.push({ name: itemsOrAnimals.name, amount: itemsOrAnimals.amount });
            }
        }
    }


    public removeItemAnimalCrate(member: GuildMember, itemsOrAnimals: { name: string, amount: number }[]): 'InventoryError' | void {
        const guildId = member.guild.id;
        const userId = member.id;
        const inventoryData = this.inventoryCollection.get(guildId)?.get(userId);
        if (!inventoryData) return 'InventoryError';
        for (const itemOrAnimal of itemsOrAnimals) {
            const itemIndex = inventoryData.findIndex((value) => value.name.toLowerCase() === (itemOrAnimal.name.toLowerCase()) || value.name.toLowerCase() === (AllItems[itemOrAnimal.name]?.name?.toLowerCase()))
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

    public purchaseItemFromShop(member: GuildMember, inventory: { name: string, amount: number }[], item: items, amount: number): void | 'InsufficientCoins' {
        const TotalPrice = item.price?.purchasePrice! * amount
        if (!inventory || !item || inventory.find((value) => value.name.toLowerCase().includes('coin'))?.amount! < TotalPrice) return 'InsufficientCoins'
        this.addItemAnimalCrate(member, { name: item.name, amount })
        this.removeItemAnimalCrate(member, [{ name: 'Shop Coins', amount: TotalPrice }])
    }

    public sellItem(member: GuildMember, inventory: { name: string, amount: number }[], item: items, amount: number): void | 'InsufficientItem' {
        const TotalPrice = item.price?.sellPrice! * amount
        if (!inventory || !item || inventory.find((value) => value.name.toLowerCase().includes(item.name.toLowerCase()))?.amount! < amount) return 'InsufficientItem'
        this.addItemAnimalCrate(member, { name: 'Shop Coins', amount: TotalPrice })
        this.removeItemAnimalCrate(member, [{ name: item.name, amount: amount }])
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
            const bulkOps = [];

            for (const [guildID, users] of this.inventoryCollection) {
                for (const [userID, items] of users) {
                    bulkOps.push({
                        updateOne: {
                            filter: { GuildID: guildID, UserID: userID },
                            update: { $set: { Items: items } },
                            upsert: true,
                        },
                    });
                }
            }

            if (bulkOps.length > 0) {
                InventorySchema.bulkWrite(bulkOps);
            }
        } catch (error) {
            console.log("Couldn't upload data to mongo for inventory!")
        }
    }

    private startUp() {
        this.uploadInventoryDataToMongo();
        setInterval(() => {
            this.uploadInventoryDataToMongo();
        }, 10000);
    }
}