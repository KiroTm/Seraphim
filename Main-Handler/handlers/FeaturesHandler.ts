  import { Client, Collection } from "discord.js";
  import getAllFiles from "../utils/getAllFiles";
  import path from "path";
  import { ConfigInstance } from "../ConfigHandler";

  export class FeaturesHandler {
    private filesCollection: Collection<string, number> = new Collection<string, number>();

    public async readFiles(instance: ConfigInstance, path1: string, client: Client) {
      const DefaulteventFolders = await getAllFiles(path.join(__dirname, "../", 'events'), true) as any[];
      let eventFolders = [...DefaulteventFolders, ...(await getAllFiles(path1, true))]

      for (let eventFolder of eventFolders) {

        const eventFiles = (await getAllFiles(eventFolder) as string[]).sort();

        const eventname = eventFolder.replace(/\\/g, "/").split('/').pop() as string;

        this.filesCollection.set(eventname, eventFiles.length);

        const eventPromises = eventFiles.map(async (eventFile) => {
          const eventFunction = require(eventFile);
          client.on(eventname, async (...args) => {
            try {
              await eventFunction.default(instance, ...args);
            } catch (err) {
              console.error(err);
            }
          });
        });
        await Promise.all(eventPromises);
      }
    }

    public getLocalFiles(): Collection<string, number> {
      return this.filesCollection;
    }
  }
