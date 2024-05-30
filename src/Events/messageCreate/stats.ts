import { Message } from "discord.js";
import { ConfigInstance } from "../../../NeoHandler/ConfigHandler";
import { StatsClass } from "../../Classes/Misc/stats";

export default (_: ConfigInstance, message: Message) => {
    StatsClass.getInstance().add(message)
}