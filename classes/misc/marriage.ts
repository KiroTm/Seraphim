import { Collection, GuildMember, Snowflake } from "discord.js";
import MarriageSchema from "../../models/Marriage-Schema";

export class MarriageClass {
    private static instance: MarriageClass;
    private MarriageCollection: Collection<Snowflake, Array<string>> = new Collection();

    private constructor() {
        this.startUp();
    }

    public static getInstance(): MarriageClass {
        return this.instance || (this.instance = new MarriageClass());
    }

    public Ship(f: string, s: string) {
        let percent = this.p(f, s);
        return {
            name: `${f.slice(0, f.length / 2)}${s.slice(s.length / 2)}`,
            bar: this.barGenerator(percent),
            percent,
        };
    }

    public marry(a: GuildMember, b: GuildMember): boolean | string {
        const canMarry = this.canMarry(a, b);
        if (typeof canMarry === 'string') return canMarry;
    
        const marriage = `${a.id}-${b.id}-${Date.now()}`;
        const existingMarriages = this.MarriageCollection.get(a.guild.id) ?? [];
        this.MarriageCollection.set(a.guild.id, [...existingMarriages, marriage]);
    
        return true;
    }
    
    
    public divorce(userA: GuildMember, userB: GuildMember): boolean | string {
        const canDivorceResult = this.canDivorce(userA, userB);
        if (typeof canDivorceResult === 'string') {
            console.log(`Cannot divorce: ${canDivorceResult}`);
            return canDivorceResult;
        }
    
        const marriages = this.MarriageCollection.get(userA.guild.id);
        if (!marriages) {
            console.log('Cannot divorce: No marriages found.');
            return 'CannotDivorce';
        }
    
        const updatedMarriages = marriages.filter((m) => !this.areSameMarriage(m, userA, userB));
        this.MarriageCollection.set(userA.guild.id, updatedMarriages);
    
        console.log('Divorce successful. Updated marriages:', updatedMarriages);
    
        return true;
    }
    

    private async startUp() {
        await this.initializeData();
        setInterval(() => {this.uploadDataToMongoose(); console.log(this.MarriageCollection)}, 30000);
    }

    private async initializeData() {
        const datas = await MarriageSchema.find();
        datas.forEach((data) => {
            if (Array.isArray(data.Marriages)) {
                const formattedMarriages = data.Marriages.map((entry: any) => `${entry.Members[0]}-${entry.Members[1]}-${entry.Date.getTime()}`);
                this.MarriageCollection.set(data.GuildID, formattedMarriages);
            } else {
                console.error(`Unexpected data format for GuildID ${data.GuildID}`);
            }
        });
    }    

    private async uploadDataToMongoose() {
        const bulkOps: any[] = [];
    
        this.MarriageCollection.forEach((marriages, guildID) => {
            const formattedMarriages = marriages.map((m) => {
                if (typeof m === 'string') {
                    const [firstID, secondID, date] = m.split('-');
                    return { Members: [firstID, secondID], Date: new Date(Number(date)) };
                }
                return null;
            });
            
    
            bulkOps.push({
                updateOne: {
                    filter: { GuildID: guildID },
                    update: { $set: { Marriages: formattedMarriages } },
                    upsert: true,
                },
            });
        });
    
        if (bulkOps.length > 0) {
            await MarriageSchema.bulkWrite(bulkOps);
        }
    }

    public getPartnerInfo(member: GuildMember): { partnerId: string; time: string } | 'NotMarried' {
        const marriages = this.MarriageCollection.get(member.guild.id);
        const memberId = member.id
        if (marriages) {
            for (const marriage of marriages) {
                const [firstID, secondID, time] = marriage.split('-');
    
                if (firstID === memberId) {
                    return { partnerId: secondID, time };
                } else if (secondID === memberId) {
                    return { partnerId: firstID, time };
                }
            }
        }
        return 'NotMarried'
    }
    
    
    

    public canDivorce(a: GuildMember, b: GuildMember) { if (!a || !b || a.user.bot || a.id === b.id) { return 'Invalid members provided.';}if (!this.areMarriedToEachOther(a,b)) {return `You're not married with ${b} to be able to divorce`}}
    public canMarry(a: GuildMember, b: GuildMember) {if (!a || !b || a.user.bot || a.id === b.id) {return 'Invalid members provided.';}if (this.isMarried(a)) {return `You're already married.`;}if (this.isMarried(b)) {return `${this.getMemberName(b)} is already married.`;}}
    private barGenerator(Percentage: number) { const l = 10; const f = Math.round((Percentage / 100) * l); const e = l - f; return `[${'█'.repeat(f)}${'░'.repeat(e)}]` }
    private h(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h = (h << 5) - h + c; h = h & h } return h }
    private p(a1: string, a2: string) { const h1 = this.h(a1); const h2 = this.h(a2); return Math.abs(h1 + h2) % 101 }
    private getMemberName(member: GuildMember): string { return member.displayName || member.user.username }
    private areSameMarriage(m: string, a: GuildMember, b: GuildMember): boolean {const [c, d] = m.split('-');return (c === a.id && d === b.id) || (c === b.id && d === a.id);}    
    private areMarriedToEachOther(a: GuildMember, b: GuildMember): boolean {const marriages = this.MarriageCollection.get(a.guild.id);return (marriages?.some((m) => this.areSameMarriage(m, a, b)) || false);}
    private isMarried(member: GuildMember): boolean {const marriages = this.MarriageCollection.get(member.guild.id);return !!marriages && marriages.some((m) => m.includes(member.id));}
    
}
