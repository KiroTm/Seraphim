import { Client, Collection } from "discord.js";
import getAllFiles from "../utils/getAllFiles";
import path from "path";
import { ConfigInstance } from "../ConfigHandler";

export class FeaturesHandler {
  private filesCollection: Collection<string, number> = new Collection<string, number>();

  constructor(instance: ConfigInstance, featuresDir: string, client: Client, chalk: any) {
    this.readFiles(instance, featuresDir, client, chalk);
  }

  private async readFiles(ConfigInstance: ConfigInstance, path1: string, client: Client, chalk: any) {
    console.log(`${chalk.bold.white("➙ Loading events...")}`);
    const DefaulteventFolders = getAllFiles(path.join(__dirname, "../", 'events'), true) as any[];
    let eventFolders = [...DefaulteventFolders, ...getAllFiles(path1, true)]

    for (let eventFolder of eventFolders) {

      const eventFiles = (getAllFiles(eventFolder) as string[]).sort();

      const eventname = eventFolder.replace(/\\/g, "/").split('/').pop() as string;

      this.filesCollection.set(eventname, eventFiles.length);

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
      await Promise.allSettled(eventPromises);
    }
  }

  public getLocalFiles(): Collection<string, number> {
    return this.filesCollection;
  }
}
