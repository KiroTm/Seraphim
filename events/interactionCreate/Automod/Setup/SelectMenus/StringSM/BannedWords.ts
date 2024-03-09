import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { utils } from "../../../../../../classes/moderation/Automod/utils";
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) return;
  const customId = interaction.customId

  switch (customId) {
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
}
