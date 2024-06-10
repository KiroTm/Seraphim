import axios from 'axios';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js'
export const SmashOrPassEmbed_Main = new EmbedBuilder()
    .setColor('Blue')
    .setTitle("Smash OR Pass")
    .setDescription("Welcome to the **Smash or Pass** game! Use this command to start a fun and interactive session where you can quickly decide if something is a 'Smash' or a 'Pass'.")
    .setThumbnail("https://media.discordapp.net/attachments/1153223171072348172/1247616713860583505/P70Upzn.png");

export const SmashOrPassActionRow_Buttons = new ActionRowBuilder<ButtonBuilder>({
    components: [
        new ButtonBuilder()
            .setCustomId("SmashOrPassButton_Smash")
            .setLabel("Smash")
            .setEmoji("<:smash:1247618887856685066>")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("SmashOrPassButton_Pass")
            .setLabel("Pass")
            .setEmoji("<:pass:1247618940117454980>")
            .setStyle(ButtonStyle.Secondary)
    ]
});

export enum SmashOrPassThemes {
    AnimeWomen = "aw",
    AnimeMen = "am",
    RealMen = "rm",
    RealWomen = "rw"
};

export const urls = {
    AnimeWomen: [
        "https://api.waifu.pics/sfw/waifu",
        "https://api.waifu.pics/sfw/neko",
        "https://api.waifu.pics/sfw/shinobu",
    ]
}

export const SmashOrPassThemesMap = Object.keys(SmashOrPassThemes).map((val) => {
    return {
        label: val,
        value: SmashOrPassThemes[val]
    }
});

export const SmashOrPassActionRow_Dropdown = new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
        new StringSelectMenuBuilder()
            .setCustomId("SmashOrPassDropdown")
            .setPlaceholder("Set theme")
            .setMaxValues(4)
            .setMinValues(1)
            .addOptions(SmashOrPassThemesMap)
    ]
});


export async function get(randomTheme: string): Promise<string> {

    // Get the URLs for the chosen theme
    const themeUrls = urls[randomTheme as keyof typeof urls];

    // Pick a random URL from the theme URLs
    const randomUrl = themeUrls[Math.floor(Math.random() * themeUrls.length)];

    // Hit an axios request
    const response = await axios.get(randomUrl);

    // Retrieve url from the data
    const images = response.data.url;
    
    // Return the url
    return images ?? undefined
}
