import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
const crateClass = CrateClass.getInstance()
export default (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const CustomId = interaction.customId
    if (!CustomId.split('-')[0].includes('HalloweenCrate')) return;
    console.log(crateClass.Crates)
    if (CustomId.split('-')[0] == 'HalloweenCrate1') {

    } else if (CustomId.split('-')[0] == 'HalloweenCrate10') {

    }
}

export const dropTypes: Record<string, { image: string, description: string, weight: number, emoji: string }> = {
    Mythic: {
        image: 'https://i.imgur.com/Wq756bZ.png',
        description: 'A crate with mythic items.',
        weight: 1,
        emoji: "<:crate_mythic:1162792060110245979>"
    },
    Rare: {
        image: "https://i.imgur.com/cJqMcyq.png",
        description: "A crate with rare items.",
        weight: 10,
        emoji: "<:crate_rare:1162792090451853383>",
    },
    Uncommon: {
        image: 'https://i.imgur.com/M5xKemu.png',
        description: 'A crate with gold items',
        weight: 30,
        emoji: "<:crate_uncommon:1162792140456333453>",
    },
    Common: {
        image: 'https://i.imgur.com/ZYB2r1f.png',
        description: 'A crate with common items.',
        weight: 60,
        emoji: "<:crate_common:1162792170277834792>",
    },
};