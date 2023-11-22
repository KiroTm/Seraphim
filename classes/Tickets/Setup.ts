import { Collection } from "discord.js";
import TicketSetup from "../../models/TicketSetup";
interface TicketSetupInterface {
    GuildID: string,
    Type: string, Category?: string,
    Transcripts: string,
    Handlers: string[],
    Description: string,
    Button: string,
    Emoji: string,
    SetupDone: boolean
}
export class TicketSetupClass {
    private static instance: TicketSetupClass;
    public TicketSetupCollection: Collection<string, Collection<string, TicketSetupInterface>> = new Collection()
    private constructor() {
        this.startUp()
    }

    public static getInstance(): TicketSetupClass {
        return this.instance || (this.instance = new TicketSetupClass());
    }

    private async initializeData() {
        try {
            const dataFromMongo = await TicketSetup.find();
            dataFromMongo.forEach((document) => {
                let setup = this.TicketSetupCollection.get(document.GuildID)
                if (setup) return setup.set(document._id.toString(), document)
                this.TicketSetupCollection.set(document.GuildID, new Collection<string, TicketSetupInterface>().set(document._id.toString(), document))
            });
        } catch (error) {
            console.log("Error initializing data from MongoDB:", error);
        }
    }

    private async uploadData() {
        try {
            this.TicketSetupCollection.forEach((document, guildid) => {
                
            })
        } catch (error) {
            console.log("Error initializing data from MongoDB:", error)
        }
    }

    private startUp() {
        this.initializeData().then(() => {
            setInterval(() => {
                this.uploadData()
            }, 1000 * 10);
        })
    }

}