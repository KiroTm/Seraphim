import { Collection } from "discord.js";

export enum automodtype {
    BannedWords = 'bannedwords',
    ServerInvites = 'serverinvites',
    PhishingLinks = 'phishinglinks',
    MassMention = 'messagemention'
}

export interface AutomodSetupInterface {
    type: automodtype,
    enabled: boolean,
    query?: string
}

export class AutomodClass {
    private static instance: AutomodClass;
    public AutomodCollection: Collection<string, AutomodSetupInterface> = new Collection()
    private constructor() {
        this.startUp()
    }

    public static getInstance(): AutomodClass {
        return this.instance || (this.instance = new AutomodClass());
    }

    public addRule(type: automodtype, query: string) {
        if (type === 'bannedwords') {

        } else {

        }
    }

    public removeRule(type: automodtype) {
        
    }

    public addBannedWords() {

    }

    public removeBannedWord() {

    }

    private async initializeData() {
        
    }

    private async uploadData() {
        
    }

    private startUp() {
        this.initializeData().then(() => {
            setInterval(() => {
                this.uploadData()
            }, 1000 * 10);
        })
    }

}