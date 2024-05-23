import { Message } from "discord.js";
import { ConfigInstance } from "../../../Old-Handler/ConfigHandler";
import { StatsClass } from "../../Classes/Misc/stats";

export default (_: ConfigInstance, message: Message) => {
    StatsClass.getInstance().add(message)
}