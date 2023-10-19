import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";
import { DropClass, dropTypes } from "../../classes/EventSpecial/drops";
import { InventoryClass } from "../../classes/EventSpecial/inventory";
const memberClass = new MemberClass()
const Inventory  = InventoryClass.getInstance()
export default {
    name: "inventory",
    description: 'Get your inventory',
    type: CommandType.legacy,
    cooldowns: {
        Duration: '5s'
    },
    aliases: ['inv'],
    callback: async ({ message, args, guild }: Callback) => {
        const member = memberClass.fetch(guild, args[0] ?? message.author.id, message) as GuildMember
        const inventory = Inventory.getInventory(member)
        console.log(inventory)
    }
} as Command