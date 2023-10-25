import { Interaction, EmbedBuilder, GuildMember, Guild } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { MemberClass } from "../../../classes/misc/member";
import { AllItems, items } from "../../../classes/EventSpecial/types";
const inventoryClass = InventoryClass.getInstance();
const crateClass = CrateClass.getInstance();
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    const [type, crate, userID, crateAmount] = customId.split('-');
    if (!type.includes('HalloweenCrate')) return;
    if (type == 'HalloweenCrateNo') return interaction.reply({embeds: [new EmbedBuilder().setAuthor({name: `${interaction.client.user?.username}`, iconURL: `${interaction.client.user?.displayAvatarURL()}`}).setColor('Red').setDescription("Alrighty! Cancelled your request.")]})
    if (interaction.member?.user.id !== userID) {
        return interaction.reply({ ephemeral: true, content: "You can't use this button!" });
    }

    const Amount = parseInt(crateAmount) ?? 1;

    await interaction.deferReply({ ephemeral: true });
    interaction.message.delete().catch(() => { });

    const member = new MemberClass().fetch(interaction.guild as Guild, userID) as GuildMember;

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('Grey')
                .setAuthor({ name: 'Loading...', iconURL: 'https://media.discordapp.net/attachments/1162785970064740513/1166679422062051428/loadingWeb.gif' })
        ]
    });

    const open = crateClass.openCrate(inventoryClass.getInventory(member), crate, Amount);

    if (open === 'NoItems' || open === 'CrateNotFound') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Red').setDescription("You don't have that many crates!")]})

    inventoryClass.addItemAnimalCrate(member, open.map((value) => { return { name:  value.name, amount: 1 } }));
    const add = inventoryClass.removeItemAnimalCrate(member, [{ name: crate, amount: Amount }])
    if (add == 'InventoryError') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Grey').setDescription("You don't have that crate in your inventory!")]})

    const obtainedItemsDescription = getObtainedItemsDescription(open);

    await interaction.editReply({
        embeds: [new EmbedBuilder().setColor('Grey').setDescription(`You obtained the following items:\n${obtainedItemsDescription}`)]
    });
}

function getObtainedItemsDescription(items: items[]) {
    const groupedItems = groupItemsByName(items);
    return groupedItems.map((item) => `${Object.entries(AllItems).find((value) => value[1].name.toLowerCase() == item.name.toLowerCase())?.[1].emoji! ?? ''} **${item.name}** x${item.amount}`).join("\n");
}

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
