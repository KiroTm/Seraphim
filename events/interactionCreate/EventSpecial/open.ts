import { Interaction, EmbedBuilder, GuildMember, Guild } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { MemberClass } from "../../../classes/misc/member";
import { items } from "../../../classes/EventSpecial/types";
const inventoryClass = InventoryClass.getInstance();
const crateClass = CrateClass.getInstance();

async function handleButtonClick(instance: ConfigInstance, interaction: Interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const [amount, crate, userID] = customId.split('-');

    if (!amount.includes('HalloweenCrate')) return;

    if (interaction.member?.user.id !== userID) {
        return interaction.reply({ ephemeral: true, content: "You can't use this button!" });
    }

    const Amount = amount === 'HalloweenCrate1' ? 1 : 10;

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

    if (open === 'NoItems' || open === 'CrateNotFound') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Red').setDescription("You don't have this crate!")]})

    inventoryClass.addItemAnimalCrate(member, open.map((value) => {return {name: value.name,amount: 1}}));
    const add = inventoryClass.removeItemAnimalCrate(member, [{ name: crate, amount: Amount }])
    if (add == 'InventoryError') return interaction.editReply({embeds: [new EmbedBuilder().setColor('Grey').setDescription("You don't have that crate in your inventory!")]})

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('Grey')
                .setDescription(`You obtained: \n${getObtainedItemsDescription(open)}`)
        ]
    });
}

function getObtainedItemsDescription(items: items[]) {
    return items.map((value, index) => `**${index + 1}.** **${value.name} ${value.emoji}**`).join("\n");
}

export default handleButtonClick;
