import { Collection, GuildMember } from "discord.js";
import { AllItems, items } from "./types";
import { InventoryClass } from "./inventory";
export type CrateObject = { image: string, description: string, weight: number, emoji: string };
export type CrateType = 'Common' | 'Uncommon' | 'Rare' | 'Mythic';
const inventoryClass = InventoryClass.getInstance()

export class CrateClass {
    private static instance: CrateClass;
    public readonly Crates: Collection<CrateType, Collection<string, items>> = new Collection();
    private crates: Record<CrateType, items[]> = this.populateCrates(AllItems);

    private constructor() {
        this.startUp();
    }

    public static getInstance(): CrateClass {
        return this.instance || (this.instance = new CrateClass());
    }

    public hasCrate(inventory: { name: string, amount: number }[], name: string) {
        const crate = inventory.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (!crate || crate?.amount == 0) return 'CrateNotFound';
        return crate;
    }

    public openCrate(member: GuildMember, inventory: { name: string, amount: number }[], crateName: string, amount: number): 'CrateNotFound' | 'NoItems' | Array<{name: string, emoji: string, amount: number}> {
        const crate = this.Crates.find((_, key) => key.toLowerCase() == crateName.toLowerCase())
        if (!crate) return 'CrateNotFound';
        const foundCrate = inventory.find((item) => item.name.toLowerCase() === crateName.toLowerCase());
        if (!foundCrate || foundCrate.amount < amount) return 'CrateNotFound';
        const itemsToRetrieve: items[] = [];
        for (let i = 0; i < amount; i++) {
            const randomItem = this.pickRandomItem([...crate.values()].flat());
            if (randomItem) {
                itemsToRetrieve.push(randomItem);
            }
        }
        if (!itemsToRetrieve.length) return 'NoItems';
        const itemsObtained = this.getFormattedItems(itemsToRetrieve)
        inventoryClass.removeItemAnimalCrate(member, [{name: crateName, amount}])
        inventoryClass.addItemAnimalCrate(member, itemsObtained.map((value) => { return { name: value.name, amount: value.amount } }))
        return itemsObtained
    }


    private pickRandomItem(itemsInCrate: items[]): items | null {
        const weightedItems: items[] = [];

        for (const item of itemsInCrate) {
            for (let i = 0; i < (item.weight || 1); i++) {
                weightedItems.push(item);
            }
        }

        const randomIndex = Math.floor(Math.random() * weightedItems.length);
        return weightedItems[randomIndex] || null;
    }

    private populateCrates(allItems: Record<string, items>): Record<CrateType, items[]> {
        const crates: Record<CrateType, items[]> = {
            Common: [],
            Uncommon: [],
            Rare: [],
            Mythic: [],
        };
        for (const itemName in allItems) {
            const item = allItems[itemName];
            const { weight, info } = item;
            if (info.type === 'Junk' || info.type === 'Utility') {
                crates.Common.push(item);
                crates.Uncommon.push(item);
            } else {
                if (weight <= 5) {
                    crates.Mythic.push(item);
                } else if (weight <= 10) {
                    crates.Rare.push(item);
                } else if (weight <= 20) {
                    crates.Uncommon.push(item);
                } else {
                    crates.Common.push(item);
                }
            }
        }
        return crates;
    }

    private startUp() {
        for (const crateName in dropTypes) {
            this.Crates.set(crateName as CrateType, new Collection<string, items>());
        }

        for (const crateName in dropTypes) {
            const itemsInCrate = this.crates[crateName as CrateType];
            if (itemsInCrate) {
                for (const item of itemsInCrate) {
                    this.Crates.get(crateName as CrateType)?.set(item.name, item);
                }
            }
        }
    }

    private getFormattedItems(items: items[]) {
        const groupedItems = groupItemsByName(items);
        return groupedItems.map((item) => {
            const AllItem = Object.entries(AllItems);
            return {
                emoji: AllItem.find((value) => value[1].name.toLowerCase() == item?.name?.toLowerCase())?.[1]?.emoji ?? '',
                name: item?.name ?? 'unknown',
                amount: item?.amount ?? 0
            }
        })

        function groupItemsByName(items: items[]) {
            const groupedItems = new Map<string, number>();

            for (const item of items) {
                if (groupedItems.has(item.name)) {
                    groupedItems.set(item.name, groupedItems.get(item.name)! + 1);
                } else {
                    groupedItems.set(item.name, 1);
                }
            }

            const result: { name: string; amount: number }[] = [];
            for (const [name, amount] of groupedItems) {
                result.push({ name, amount });
            }

            return result;
        }
    }
}

export const dropTypes: Record<CrateType, CrateObject> = {
    Mythic: {
        image: 'https://i.imgur.com/Wq756bZ.png',
        description: 'A crate with mythic items.',
        weight: 1,
        emoji: "<:crate_mythic:1162792060110245979>"
    },
    Rare: {
        image: "https://i.imgur.com/cJqMcyq.png",
        description: "A crate with rare items.",
        weight: 5,
        emoji: "<:crate_rare:1162792090451853383>",
    },
    Uncommon: {
        image: 'https://i.imgur.com/M5xKemu.png',
        description: 'A crate with gold items',
        weight: 50,
        emoji: "<:crate_uncommon:1162792140456333453>",
    },
    Common: {
        image: 'https://i.imgur.com/ZYB2r1f.png',
        description: 'A crate with common items.',
        weight: 90,
        emoji: "<:crate_common:1162792170277834792>",
    },
};
