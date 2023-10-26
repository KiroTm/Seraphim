import { AllItems, recipe, items } from "./types";
import { ItemClass } from "./item";
import { InventoryClass } from "./inventory";
import { GuildMember } from "discord.js";
type Recipe = {
    itemName: string
    amount: number
    emoji: string
}
const inventoryClass = InventoryClass.getInstance()
export class CraftingClass {
    public getMaterials(item: string): Recipe[] | 'Invalid Item' | 'Not Craftable' {
        const Item = new ItemClass().getItem(item);
        if (!Item) return 'Invalid Item';
        const craftInfo = Item.info.craft;

        if (!craftInfo || !craftInfo.recipe) return 'Not Craftable';

        const Materials = craftInfo.recipe.map((value) => {
            return {
                itemName: value.itemName,
                amount: value.amount,
                emoji: AllItems[value.itemName]?.emoji || ""
            }
        });
        return Materials;
    }

    public hasMaterials(inventory: Array<{name: string, amount: number}>, recipe: recipe): boolean {
        let result: boolean = true
        if (!inventory) result = false
        for (let material of recipe) {
            const requiredName = AllItems[material.itemName].name;
            const requiredAmount = material.amount;
            const foundMaterial = inventory.find(item => item.name === requiredName);
            if (result === true) {
                if (!foundMaterial || foundMaterial.amount < requiredAmount) {
                    return result = false
                } else {
                    result = true
                }
            };
        }
        return result;
    }    

    public craftItem(member: GuildMember, itemName: string, recipe: recipe): 'Invalid Item' | 'Not Craftable' | 'Insufficient Materials' | items {
        const inventory = inventoryClass.getInventory(member)
        const itemClass = new ItemClass();
        const item = itemClass.getItem(itemName)
        if (!item) return 'Invalid Item';
        if (!item.info.craft || !item.info.craft.recipe) return 'Not Craftable';
        if (!this.hasMaterials(inventory, recipe)) return 'Insufficient Materials';
        const itemsToRemove: Array<{ name: string, amount: number }> = []
        for (const material of recipe) {
            itemsToRemove.push({
                name: material.itemName,
                amount: material.amount
            })
        }
        const Remove = inventoryClass.removeItemAnimalCrate(member, itemsToRemove)
        if (Remove == 'InventoryError') return 'Insufficient Materials'
        
        inventoryClass.addItemAnimalCrate(member, [{name: item.name, amount: 1}]);
        return AllItems[itemName]
    }
}
