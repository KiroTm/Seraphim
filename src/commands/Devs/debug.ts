import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Callback, Command } from "../../typings";

export default {
    name: 'debug',
    description: 'Debug Tool',
    ownersOnly: true,
    callback: async ({ message, args }: Callback) => {
        const subCommand = args[0];
        switch (subCommand) {
            case 'button': {
                const buttonArgs = args.slice(1).join(' ').split(/ +/);
                if (!args[1]) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription('Missing Arguments')]})
                const buttonConfig: Record<string, any> = {};
                for (let i = 0, len = buttonArgs.length; i < len; i += 2) {
                    const [key, value] = [buttonArgs[i].replace(':', ''), buttonArgs[i + 1]];
                    buttonConfig[key] = eval(value);
                }
                const button = new ButtonBuilder()
                .setLabel(buttonConfig['label'] ?? 'debug_label')
                .setStyle(buttonConfig['style'] ?? ButtonStyle.Primary)
                .setCustomId(buttonConfig['customId'] ?? 'debug_customId')
                .setDisabled(buttonConfig['disabled'] ?? false);

                if ('emoji' in buttonConfig) button.setEmoji(buttonConfig['emoji']);
        
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                message.channel.send({ content: "Button created:", components: [row] });
            }
            break;
        
            case 'embed': {
                const embed = new EmbedBuilder();
                const embedArgs = args.slice(1).join(' ').split(/ +/);
        
                embedArgs.forEach(arg => {
                    const [key, ...value] = arg.split(' ');
                    if (key && value.length) {
                        const evaluatedValue = eval(value.join(' '));
                        if (key === 'fields') {
                            evaluatedValue.forEach((field: any) => {
                                embed.addFields({ name: field.name, value: field.value, inline: field.inline });
                            });
                        } else if (key === 'setColor' && 'color' in embedArgs) {
                            embed.setColor(evaluatedValue);
                        } else {
                            // Handle other dynamic properties here
                            if (key === 'setTitle' && 'title' in embedArgs) {
                                embed.setTitle(evaluatedValue);
                            }
                            // Add other dynamic properties in a similar manner
                        }
                    }
                });
        
                message.channel.send({ embeds: [embed] });
                break;
            }
        
            default: {
                message.channel.send('Invalid debug subcommand.');
                break;
            }
        }
        
    }
} as Command;
