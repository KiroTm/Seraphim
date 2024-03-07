import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_ServerInvites`)) return;

}
