import { Interaction, EmbedBuilder, GuildMember, Guild } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { MemberClass } from "../../../classes/misc/member";
import { AllItems, items } from "../../../classes/EventSpecial/types";
const inventoryClass = InventoryClass.getInstance();
const crateClass = CrateClass.getInstance();
export default async (instance: ConfigInstance, interaction: Interaction) => {

    // const open = crateClass.openCrate(inventoryClass.getInventory(member), crate, Amount);
    // if (open === 'NoItems' || open === 'CrateNotFound') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Red').setDescription("You don't have that many crates!")]})

    // inventoryClass.addItemAnimalCrate(member, open.map((value) => { return { name:  value.name, amount: 1 } }));
    // const add = inventoryClass.removeItemAnimalCrate(member, [{ name: crate, amount: Amount }])
    // if (add == 'InventoryError') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Grey').setDescription("You don't have that crate in your inventory!")]})

    // const obtainedItemsDescription = getObtainedItemsDescription(open);

    // await interaction.editReply({
    //     embeds: [new EmbedBuilder().setColor('Grey').setDescription(`You obtained the following items:\n${obtainedItemsDescription}`)]
    // });
}

