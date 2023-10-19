import { EmbedBuilder, Message } from "discord.js";
import AllItems, { recipe, items } from "./types";
import { ItemClass } from "./item";
type Recipe = {
    itemName: string
    amount: number
    emoji: string
}

export class CraftingClass {
    public getMaterials(item: string): Recipe[] | 'Invalid Item' | 'Not Craftable' {
        const Item = new ItemClass().getItem(item)
        if (!Item) return 'Invalid Item'
        if (!Item.info.craft?.recipe) return 'Not Craftable'
        const Materials = Item.info.craft.recipe.map((value) => {
            return {
                itemName: value.itemName,
                amount: value.amount,
                emoji: AllItems[value.itemName].emoji || ""
            }
        })
        return Materials
    }

    public hasMaterials(inventory: Array<items>, recipe: recipe) {

    }

    public craftItem(recipe: recipe) {

    }
}