import { EmbedBuilder } from "discord.js";
import { ItemClass } from "../../Classes/item";
import { Messagepagination } from "../../../../../functions/utility/pagination";
import { Callback, Command } from "../../../../../OldHandler/typings";
export default {
    name: "shop",
    description: "Shop",
    callback: async ({message, args}: Callback) => {
        const items = new ItemClass().AllItems().filter((v) => v.price)
        function chunkify(arr: Array<any>, len: number) {
            let chunks = [];
            let i = 0;
            let n = arr.length;

            while (i < n) {
                chunks.push(arr.slice(i, (i += len)));
            }

            return chunks;
        }
        const max_description = 6
        const fields = items.map(value => `${value.emoji} ${value.name} - [⏣ ${value.price?.purchasePrice}](https://youtu.be/ETxmCCsMoD0)\n${value.description}`) as string[]
        const chunks = chunkify(fields, max_description);
        const pages = [] as EmbedBuilder[];
        chunks.forEach((chunk) => {
            pages.push(
                new EmbedBuilder()
                    .setTitle("Shawn, we're Open! Get ya goodies")
                    .setColor('#c9f4ff')
                    .setDescription(chunk.join("\n\n"))
            );
        });
        Messagepagination(message, pages, 1000 * 60 * 1)

    }
} as Command