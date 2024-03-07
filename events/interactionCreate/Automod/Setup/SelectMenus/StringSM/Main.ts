import { Interaction, } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../../classes/moderation/automod";

const automodClass = AutomodClass.getInstance();

export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  const customId = interaction.customId;

  if (!customId.startsWith(`${interaction.guildId}Automod_Setup`)) return;

  switch (customId) {
    case `${interaction.guildId}Automod_Setup_RuleType_SelectMenu`: {
      switch (interaction.values[0]) {
        case automodtype.BannedWords: {
          interaction.update(automodClass.utils(interaction).constants.BannedWords.Main);
          break;
        }
        case automodtype.PhishingLinks: {
          interaction.update(automodClass.utils(interaction).constants.PhishingLinks.Main);
          break;
        }
        case automodtype.MassMention: {
          interaction.update(automodClass.utils(interaction).constants.MassMention.Main);
          break;
        }
        case automodtype.ServerInvites: {
          interaction.update(automodClass.utils(interaction).constants.ServerLinks.Main);
          break;
        }
        case automodtype.MassEmoji: {
          interaction.update(automodClass.utils(interaction).constants.MassEmoji.Main);
          break;
        }
        case automodtype.LinkCooldown: {
          interaction.update(automodClass.utils(interaction).constants.LinkCooldown.Main);
          break;
        }
        case automodtype.NewLines: {
          interaction.update(automodClass.utils(interaction).constants.NewLines.Main);
          break;
        }
        case automodtype.ChatFlood: {
          interaction.update(automodClass.utils(interaction).constants.ChatFlood.Main);
          break;
        }
        case automodtype.FastMessage: {
          interaction.update(automodClass.utils(interaction).constants.FastMessage.Main);
          break;
        }
        case automodtype.AllCaps: {
          interaction.update(automodClass.utils(interaction).constants.AllCaps.Main);
          break;
        }
        case automodtype.TextLimit: {
          interaction.update(automodClass.utils(interaction).constants.TextLimit.Main);
          break;
        }
        default: {
          interaction.update({
            embeds: [],
            components: [],
            content: "We're working on this!"
          });
        }
      }
      break;
    }
  }
};
