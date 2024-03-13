import { EmbedBuilder, GuildMember } from "discord.js";
import { Command, Callback } from "../../../../../typings";
import { EconomyClass } from "../../Classes/economy";
import { InventoryClass } from "../../Classes/inventory";
const economyClass = new EconomyClass()
const inventoryClass = InventoryClass.getInstance()
export default {
    name: 'hunt',
    description: 'Hunt for animals and earn rewards!',
    cooldown: {
        Duration: '5s',
        Type: 'perUserCooldown'
    },
    callback: async ({ message, }: Callback) => {
        type outcome = 'fail' | 'success'
        const member = message.member as GuildMember
        const animal = economyClass.getRandomAnimal()
        const result = ['success', 'fail'];
        const outcome = result[Math.floor(Math.random() * result.length)] as outcome
        const reply = economyClass.getRandomEconomyReply(outcome)
        if (outcome == 'fail') {
            
        } else {
            inventoryClass.addItemAnimalCrate(member, { name: animal?.name!, amount: 1 })
        }
        await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(outcome == 'success' ? 'Green' : outcome == 'fail' ? 'Red' : 'Yellow')
                    .setDescription(`${reply.replace(/{animal}/g, `${animal?.name}${animal?.emoji}`)}`)
            ]
        })
    }
} as Command