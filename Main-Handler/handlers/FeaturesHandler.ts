import { Client } from "discord.js";
import getAllFiles from "../utils/getAllFiles";
import path from "path";
import { ConfigInstance } from "../ConfigHandler";

export class FeaturesHandler {
  constructor(instance: ConfigInstance, featuresDir: string, client: Client, chalk: any) {
    this.readFiles(instance, featuresDir, client, chalk);
  }

  async readFiles(ConfigInstance: ConfigInstance, path1: string, client: Client, chalk: any) {
    console.log(`${chalk.bold.white("➙ Loading events...")}`);
    const DefaulteventFolders = getAllFiles(path.join(__dirname, "../", 'events'), true) as any[];
    let eventFolders = getAllFiles(path1, true) as any[];

    for (const DefaulteventFolder of DefaulteventFolders) {
      eventFolders.push(DefaulteventFolder);
    }

    for (let eventFolder of eventFolders) {
      const eventFiles = getAllFiles(eventFolder) as string[];

      eventFiles.sort();

      const eventname = eventFolder.replace(/\\/g, "/").split('/').pop() as string;
      const eventPromises = eventFiles.map(async (eventFile) => {
        const eventFunction = require(eventFile);
        client.on(eventname, async (...args) => {
          try {
            await eventFunction.default(ConfigInstance, ...args);
          } catch (err) {
            console.error(err);
          }
        });
      });
      await Promise.all(eventPromises);
    }
  }
}
