import { Messagepagination } from '../../functions/utility/pagination';
import {AllItems, items } from './types'
import { Message, Collection, EmbedBuilder, parseEmoji } from "discord.js"
const ShopItemsCollection: Collection<string, items> = new Collection<string, items>(Object.entries(AllItems))
export class ItemClass {
    public async generate(message: Message, item?: string) {
        const createEmbed = (item: items) => {
            const { name, description, emoji, info, price } = item
            const { usage, boosts, type, craft } = info || { type: 'Other' }
            const { recipe } = craft || { usedInCrafting: false, canbeCrafted: false, recipe: null }

            return new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(name)
                .setThumbnail(emoji ? `https://cdn.discordapp.com/emojis/${parseEmoji(emoji)!.id! + (parseEmoji(emoji)!.animated ? '.gif' : '.png')}` : null)
                .setDescription(`${`> *${description}*` || ''}${usage ? `\n\n${usage}` : ''}${recipe ? `\n\n**Recipe**:\n${recipe.map((value) => `<:branch_tail_curved:1161479147839828018>${AllItems[value.itemName]?.emoji ?? ''} **${value.itemName} \`x${value.amount}\`**`).join("\n")}` : ''}${price ? `\n\nPrice Info:\nPurchase in: ${price.purchasePrice} <:coin:1164253043991253116> | Sell in: ${price.sellPrice} <:coin:1164253043991253116>`: ''}${type ? `\n\n${type}` : ''}`);
        };

        if (item) {
            const Item = this.getItem(item)
            if (!Item) return message.channel.send("Invalid Item!");
            message.channel.send({ embeds: [createEmbed(Item)] });
        } else {
            const ShopItems = ShopItemsCollection.filter((a) => a.info.type !== 'Junk').map((value) => createEmbed(value));
            Messagepagination(message, ShopItems, 1000 * 90);
        }
    }

    public getItem(itemName: string): items | undefined {
        const Item = ShopItemsCollection.find((_, key) => key.toLowerCase().includes(itemName.toLowerCase()));
        return Item || undefined
    }

    public AllItems(): Collection<string, items> {
        const itemCollection = new Collection(Object.entries(AllItems));
        return itemCollection;
    }

}


