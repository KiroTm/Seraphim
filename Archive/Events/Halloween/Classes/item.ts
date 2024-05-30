import { Messagepagination } from '../../../../src/Functions/utility/pagination';
import { InventoryClass } from './inventory';
import {AllItems, items } from './types'
import { Message, Collection, EmbedBuilder, parseEmoji, GuildMember } from "discord.js"
const inventoryClass = InventoryClass.getInstance()
const ShopItemsCollection: Collection<string, items> = new Collection<string, items>(Object.entries(AllItems))
export class ItemClass {
    public generate(message: Message, item?: string, embedOnly?: boolean): any {
        const inventory = inventoryClass.getInventory(message.member as GuildMember)
        const createEmbed = (item: items) => {
            const { name, description, emoji, info, price } = item
            const { usage, type, craft } = info || { type: 'Other' }
            const { recipe } = craft || { usedInCrafting: false, canbeCrafted: false, recipe: null }

            return new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(name)
                .setThumbnail(emoji ? `https://cdn.discordapp.com/emojis/${parseEmoji(emoji)!.id! + (parseEmoji(emoji)!.animated ? '.gif' : '.png')}` : null)
                .setDescription(`${`> *${description}*` || ''}${usage ? `\n\n${usage}` : ''}${recipe ? `\n\n**Recipe**:\n${recipe.map((value) => `<:branch_tail_curved:1161479147839828018>${AllItems[value.itemName]?.emoji ?? ''} **${value.itemName} \`x${value.amount}\`**`).join("\n")}` : ''}${price ? `\n\nPrice Info:\nPurchase in: ${price.purchasePrice} <:coin:1164253043991253116> | Sell in: ${price.sellPrice} <:coin:1164253043991253116>`: ''}${type ? `\n\n${type}` : ''}`)
                .setFields(
                    {name: `You have:`, value: `**${inventory.find((value) => value.name.toLowerCase().includes(item.name.toLowerCase()))?.amount ?? 0}**` , inline: false}
                );
        };

        if (item) {
            const Item = this.getItem(item)
            if (!Item) return message.channel.send("Invalid Item!");
            const embed = createEmbed(Item)
            if (embedOnly) return embed
            message.channel.send({ embeds: [embed] });
        } else {
            const ShopItems = ShopItemsCollection.filter((a) => a.info.type !== 'Junk').map((value) => createEmbed(value));
            Messagepagination(message, ShopItems, 1000 * 90);
        }
    }

    public getItem(itemName: string): items | undefined {
        const Item = ShopItemsCollection.find((value, key) => key.toLowerCase().includes(itemName.toLowerCase()) || value.name.toLowerCase().includes(itemName.toLowerCase())) || undefined
        return Item || undefined
    }

    public AllItems(): Collection<string, items> {
        const itemCollection = new Collection(Object.entries(AllItems));
        return itemCollection;
    }

}


