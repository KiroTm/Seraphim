import { Collection } from "discord.js";
import { AllItems, items } from "./types";

export type CrateObject = { image: string, description: string, weight: number, emoji: string };
export type CrateType = 'Common' | 'Uncommon' | 'Rare' | 'Mythic';

export class CrateClass {
    private static instance: CrateClass;
    public readonly Crates: Collection<CrateType, Collection<string, items[]>> = new Collection();
    private crates: Record<CrateType, items[]> = this.populateCrates(AllItems);

    private constructor() {
        this.startUp();
    }

    public static getInstance(): CrateClass {
        return this.instance || (this.instance = new CrateClass());
    }

    public openCrate(inventory: { name: string, amount: number }[], name: string) {
        const crate = inventory.find((item) => item.name.toLowerCase() === name);
        if (!crate || crate?.amount == 0) return 'CrateNotFound';
        return crate;
    }

    public getCratesWithMaterials() {
        return Object.entries(dropTypes).map(([name, { description, emoji, image, weight }]) => {
            return {
                name: {
                    description: description,
                    emoji: emoji ?? "",
                    image: image,
                    weight: weight,
                    items: this.getMaterialForCrate(name)
                }
            };
        });
    }

    private getMaterialForCrate(crate: string, single?: true) {
        const targetCrate = this.crates[crate.toLowerCase() as CrateType];
        return targetCrate || [];
    }

    private populateCrates(allItems: Record<string, items>): Record<CrateType, items[]> {
        const crates: Record<CrateType, items[]> = {
            Common: [],
            Uncommon: [],
            Rare: [],
            Mythic: [],
        };
        const coinsAndJunk: items[] = [];
        for (const itemName in allItems) {
            const item = allItems[itemName];
            const { weight, info } = item;
            if (info.type === 'Junk' || info.type === 'Utility') {
                coinsAndJunk.push(item);
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
        crates.Common.push(...coinsAndJunk);
        crates.Uncommon.push(...coinsAndJunk);
        crates.Rare.push(...coinsAndJunk)
        return crates;
    }

    private startUp() {
        for (const crateName in dropTypes) {
            this.Crates.set(crateName as CrateType, new Collection<string, items[]>());
        }

        for (const crateName in dropTypes) {
            const itemsInCrate = this.crates[crateName as CrateType];
            if (itemsInCrate) {
                for (const item of itemsInCrate) {
                    this.Crates.get(crateName as CrateType)?.set(item.name, [item]);
                }
            }
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
