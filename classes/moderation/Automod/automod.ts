import { Collection, ButtonInteraction, AnySelectMenuInteraction, ModalSubmitInteraction, ChatInputCommandInteraction } from "discord.js";

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
  Ban: { id: "Ban", emoji: "<:ban:1211754347797422100>" },
  Kick: { id: "Kick", emoji: "<:kick:1211757211215208469>" },
  Mute: { id: "Mute", emoji: "<:mute:1211755876977872958>" }
};

export class AutomodClass {
  private static instance: AutomodClass;
  public AutomodCollection: Collection<string, { rules: Collection<automodtype, AutomodSetupInterface>, defaultAdvancedSettings?: AdvancedSettingFields }> = new Collection();

  private constructor() {
    setInterval(() => {
      console.log(this.AutomodCollection)
    }, 10000);
  }

  public static getInstance(): AutomodClass {
    return this.instance || (this.instance = new AutomodClass());
  }

  public addOrUpdateRuleType(guildId: string, data: AutomodSetupInterface) {
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    const ruleData = guildAutomodData.rules.get(data.type);

    if (ruleData) {
      guildAutomodData.rules.set(data.type, { ...ruleData, ...data });
    } else {
      guildAutomodData.rules.set(data.type, data);
    }

    if (!data.advancedSettings) {
      data.advancedSettings = guildAutomodData.defaultAdvancedSettings;
    }

    this.AutomodCollection.set(guildId, guildAutomodData);
  }

  public addAdvancedSettings(guildId: string, advancedSettings: AdvancedSettingFields, ruleType?: automodtype) {
    const guildAutomodData = this.getOrCreateGuildAutomodData(guildId);
    if (ruleType) {
      const existingRule = guildAutomodData?.rules?.get(ruleType);
      if (!existingRule) return;
      existingRule.advancedSettings = advancedSettings
      guildAutomodData.rules.set(ruleType, existingRule);
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

  public enableRuleType(guildId: string, type: automodtype) {
    const existingRule = this.getOrCreateRuleTypeCollection(guildId, type);
    if (!existingRule) return;

    existingRule.enabled = true;
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
}
