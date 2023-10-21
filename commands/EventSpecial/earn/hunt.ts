import { GuildMember } from "discord.js";
import { InventoryClass } from "../../../classes/EventSpecial/inventory";
import { MemberClass } from "../../../classes/misc/member";
import { Command, Callback } from "../../../typings";
import { RandomedClass } from "../../../classes/EventSpecial/Randomed";
const inventoryClass = InventoryClass.getInstance()
const randomedClass = new RandomedClass()
export default {
    name: 'hunt',
    description: 'Hunt for animals and earn rewards!',
    callback: async ({ message, }: Callback) => {
        const member = message.member as GuildMember
        const animal = randomedClass.getRandomAnimal()
        const result = ['sucess', 'fail', 'neutral']
        const outcome = result[Math.floor(Math.random() * result.length)]
        message.channel.send(`Outcome: ${outcome}\nAnimal: ${animal}`)
    }
} as Command