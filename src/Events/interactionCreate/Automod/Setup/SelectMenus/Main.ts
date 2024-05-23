import { Interaction, } from "discord.js";
import { ConfigInstance } from "../../../../../../Old-Handler/ConfigHandler";
import { automodtype } from "../../../../../Classes/moderation/Automod/automod";
import { utils } from "../../../../../Classes/moderation/Automod/utils";

export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  const customId = interaction.customId;

  if (!customId.startsWith(`${interaction.guildId}Automod_Setup`)) return;

  switch (customId) {
    case `${interaction.guildId}Automod_Setup_RuleType_SelectMenu`: {
      switch (interaction.values[0]) {
        case automodtype.BannedWords: {
          interaction.update(utils(interaction).constants.BannedWords.Main);
          break;
        }
        case automodtype.PhishingLinks: {
          interaction.update(utils(interaction).constants.PhishingLinks.Main);
          break;
        }
        case automodtype.MassMention: {
          interaction.update(utils(interaction).constants.MassMention.Main);
          break;
        }
        case automodtype.ServerInvites: {
          interaction.update(utils(interaction).constants.ServerLinks.Main);
          break;
        }
        case automodtype.MassEmoji: {
          interaction.update(utils(interaction).constants.MassEmoji.Main);
          break;
        }
        case automodtype.LinkCooldown: {
          interaction.update(utils(interaction).constants.LinkCooldown.Main);
          break;
        }
        case automodtype.NewLines: {
          interaction.update(utils(interaction).constants.NewLines.Main);
          break;
        }
        case automodtype.ChatFlood: {
          interaction.update(utils(interaction).constants.ChatFlood.Main);
          break;
        }
        case automodtype.FastMessage: {
          interaction.update(utils(interaction).constants.FastMessage.Main);
          break;
        }
        case automodtype.AllCaps: {
          interaction.update(utils(interaction).constants.AllCaps.Main);
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
    }
      break;

    case `${interaction.guildId}Automod_Setup_BannedWords_TypeSelectMenu`: {
      const type = interaction.values[0]
      const { embeds, components } = utils(interaction).constants.BannedWords.AddWord
      interaction.update({
        embeds: [embeds[0].setTitle(`${type}`)],
        components
      })
    }
      break;
  }
};
