import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { ItemClass } from "../../../classes/EventSpecial/item";

export default (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const CustomId = interaction.customId
    if (!CustomId.split('-')[0].includes('HalloweenCrate')) return;
    if (CustomId.split('-')[0] == 'HalloweenCrate1') {

    } else if (CustomId.split('-')[0] == 'HalloweenCrate10') {

    }
}