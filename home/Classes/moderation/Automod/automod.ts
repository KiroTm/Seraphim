import { Collection, ButtonInteraction, AnySelectMenuInteraction, ModalSubmitInteraction, ChatInputCommandInteraction } from "discord.js";
import { utils } from "./utils";

export enum automodtype {
  BannedWords = "bannedwords",
  ServerInvites = "serverinvites",
  PhishingLinks = "phishinglinks",
  MassMention = "massmention",
  MassEmoji = "massemoji",
  LinkCooldown = "linkcooldown",
  NewLines = "newlines",
  ChatFlood = "chatflood",
  FastMessage = "fastmessage",
  AllCaps = "allcaps",
}

export interface AutomodSetupInterface {
  type: automodtype;
  name?: string;
  enabled?: boolean;
  customResponse?: string;
  config?: RuleConfig[];
  advancedSettings?: AdvancedSettingFields;
}

export interface RuleConfig {
  Query?: number;
  words?: string[];
  filterType?: string;
}

export interface AdvancedSettingFields {
  Channel: string[];
  Role: string[];
  Action: "Kick" | "Warn" | "Mute" | "Ban" | "Delete";
  Threshold: number;
  Duration: number;
}

export const AdvancedSettingCustomActions = {
  Warn: { id: "Warn", emoji: "<:Warn:1211758195220160512>" },
  Ban: { id: "Ban", emoji: "<:Ban:1217489469398061056>" },
  Kick: { id: "Kick", emoji: "<:Kick:1217489435231256678>" },
  Mute: { id: "Mute", emoji: "<:Mute:1211755876977872958>" }
};

export class AutomodClass {
  private static instance: AutomodClass;
  public AutomodCollection: Collection<string, { rules: Collection<automodtype, AutomodSetupInterface>, defaultAdvancedSettings?: AdvancedSettingFields }> = new Collection();

  private constructor() { }

  public static getInstance(): AutomodClass {
    return this.instance || (this.instance = new AutomodClass());
  }

  public addOrUpdateRuleType = (g: string, d: AutomodSetupInterface, r?: boolean) => { const { type: t, config: c } = d; const e = this.getOrCreateRuleTypeCollection(g, t); if (c && c.length > 0) { c.forEach((n) => { if (e.config) { const o = e.config; const u = o && o.findIndex((a) => a.filterType === n.filterType); if (u !== -1) {if (t === automodtype.BannedWords) {const w = (o && o[u].words) || [];if (r) return e.config[u].words = n.words;const m = n.words || [];for (const a of m) w.includes(a) || w.push(a);e.config[u].words = w;} else e.config[u] = { ...e.config[u], ...n };} else e.config.push(n);} else {e.config = [n];}})}}



  public addAdvancedSettings(guildId: string, advancedSettings: AdvancedSettingFields, ruleType?: automodtype) {
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    if (ruleType) {
      const existingRule = guildAutomodData?.rules?.get(ruleType);
      if (!existingRule) return;
      existingRule.advancedSettings = advancedSettings
      return guildAutomodData.rules.set(ruleType, existingRule)
    }
    guildAutomodData.defaultAdvancedSettings = advancedSettings;
    this.AutomodCollection.set(guildId, guildAutomodData);
  }

  private getOrCreateGuildAutomodData(guildId: string): { rules: Collection<automodtype, AutomodSetupInterface>, defaultAdvancedSettings?: AdvancedSettingFields } {
    const existingGuildData = this.AutomodCollection.get(guildId);
    if (existingGuildData) return existingGuildData;

    const newGuildData = { rules: new Collection<automodtype, AutomodSetupInterface>() };
    this.AutomodCollection.set(guildId, newGuildData);
    return newGuildData;
  }

  public enableorDisableRuleType(guildId: string, type: automodtype, disable?: boolean) {
    const existingRule = this.getOrCreateRuleTypeCollection(guildId, type);
    if (!existingRule) return;

    existingRule.enabled = disable ? false : true
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    guildAutomodData.rules.set(type, existingRule);
    this.AutomodCollection.set(guildId, guildAutomodData);
  }

  private getOrCreateRuleTypeCollection(guildId: string, type: automodtype): AutomodSetupInterface {
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    let existingRule = guildAutomodData.rules.get(type);

    if (!existingRule) {
      existingRule = { type, enabled: false };
      guildAutomodData.rules.set(type, existingRule);
    }

    return existingRule;
  }

  public updateQueryField(guildId: string, type: automodtype, newQuery: number) {
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    let existingRule = this.getOrCreateRuleTypeCollection(guildId, type);
    if (!existingRule.config) existingRule.config = []
    const configIndex = existingRule.config.findIndex(config => config.Query !== undefined);
    configIndex === -1 ? existingRule.config.push({ Query: newQuery }) : existingRule.config[configIndex].Query = newQuery
    guildAutomodData.rules.set(type, existingRule);
    this.AutomodCollection.set(guildId, guildAutomodData);
  }


}
