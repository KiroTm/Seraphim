import { EmbedBuilder } from "discord.js"
import { Callback, Command } from "../../../typings"
import { UserClass } from "../../classes/misc/user"

export default {
    name: 'pp',
    description: 'pp size',
    callback: async ({ client, message, args }: Callback) => {
        const Target = await (new UserClass().fetch(client, args[0] ?? message.author.id, message)) || message.author   
        let size: string[] = [
            
            '=',
            '==',
            '===',
            '====',
            '=====',
            '======',
            '=======',
            '========',
            '=========',
            '==========',
            '===========',
            '============',
            '=============',
            '==============',
            '===============',
            '================',
            '=================',
            '==================',
            '===================',
            '====================',
            '=====================',
            '======================',
            '=======================',
            '========================',
            '=========================',
            '==========================',
            '==========================='
        ]
        let result = size[Math.floor(Math.random() * size.length)]
        const UserNotFound = new EmbedBuilder()
        .setDescription("Please mention a valid user")   

        if(!Target) {
            return UserNotFound
        }

        message.channel.send({
            content: `# PP Generator 🎯\n${Target}'s PP Size is estimated to be: \n> 8${result}D`,
            allowedMentions: {
                roles: [],
                users: []
            }
        })
    }
} as Command