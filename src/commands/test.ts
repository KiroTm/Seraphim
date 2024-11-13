import { Args, Command } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'test',
      description: 'Testings',
    });
  }

  public async messageRun(message: Message, args: Args) {
    return message.channel.send(`nothing to test.`);
  }
}