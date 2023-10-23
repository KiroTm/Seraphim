import { EmbedBuilder, GuildMember } from "discord.js";
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
        const result = ['success', 'fail', 'neutral'];
        const outcome = result[Math.floor(Math.random() * result.length)];
        let reply;
        if (outcome == 'success') {
            reply = randomedClass.getRandomEconomyReply('success')
        } else if (outcome == 'fail') {
            reply = randomedClass.getRandomEconomyReply('fail')
        } else {
            reply = randomedClass.getRandomEconomyReply('neutral')
        }
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor(outcome == 'success' ? 'Green' : outcome == 'fail' ? 'Red' : 'Yellow')
                .setDescription(`${reply.replace("{animal}", `${animal?.name}${animal?.emoji}`)}`)
            ]
        })
    }
} as Command