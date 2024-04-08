import { Client, Collection, Events } from "discord.js";
import { ConfigInstance } from "../ConfigHandler";
import getAllFiles from "../utils/getAllFiles";
import path from "path";

/**
 * Class responsible for managing bot features.
 */
export class FeaturesHandler {
  /** 
   * Collection to store the count of files for each feature. 
   */
  private filesCollection: Collection<string, number> = new Collection<string, number>();

  /**
   * Reads feature files and sets up event listeners.
   * @param {ConfigInstance} instance - The configuration instance for the bot.
   * @param {string} path1 - The path to the feature files.
   * @param {Client} client - The Discord client instance.
   */
  public async readFiles(instance: ConfigInstance, path1: string, client: Client) {
    // Retrieve all files from the specified path and subdirectories
    const DefaulteventFolders = await getAllFiles(path.join(__dirname, "../", 'events'), true) as any[];
    let eventFolders = [...DefaulteventFolders, ...(await getAllFiles(path1, true))]

    // Iterate through each event folder
    for (let eventFolder of eventFolders) {
      // Retrieve event files within the folder and sort them
      const eventFiles = (await getAllFiles(eventFolder) as string[]).sort();

      // Extract the event name from the folder path
      const eventname = eventFolder.replace(/\\/g, "/").split('/').pop();

      // Store the count of event files in the collection
      this.filesCollection.set(eventname, eventFiles.length);

      // Process each event file
      const eventPromises = eventFiles.map(async (eventFile) => {
        // Dynamically load the event function from the file
        const eventFunction = require(eventFile);

        if (Object.values(Events).includes(eventname)) {
          // Attach event listener to the client
          client.on(eventname, async (...args) => {
            try {
              // Execute the event function passing the instance and other arguments
              await eventFunction.default(instance, ...args);
            } catch (error) {
              return;
            }
          });
        } else {
          const config = eventFunction.config
          if (!config) console.log(instance._chalk.red(`Custom event ${eventname} does not have a config object!`))
          const { prerequisiteEvents } = config
          prerequisiteEvents.forEach((event: string) => {
            client.on(event, async (...args) => {
              try {
                await eventFunction.default(instance, ...args)
              } catch (error) {

              }
            })
          });
        }
      });
      // Wait for all event promises to resolve
      await Promise.all(eventPromises);
    }
  }

  /**
   * Retrieves the collection of feature files and their counts.
   * @returns {Collection<string, number>} - The collection of feature files.
   */
  public getLocalFiles(): Collection<string, number> {
    return this.filesCollection;
  }

  private getCustomEventClass(eventName: string, eventModule: any): any {
    try {
      const CustomEventClass = Reflect.get(eventModule, Object.keys(eventModule)[0]);
      return CustomEventClass;
    } catch (error) {
      console.error(`Error loading custom event class for ${eventName}: ${error}`);
      return null;
    }
  }
}
