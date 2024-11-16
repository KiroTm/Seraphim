import { Command, Args } from '@sapphire/framework';
import { Message, GuildMember, EmbedBuilder, AttachmentBuilder, MessageCreateOptions } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';

interface ShipReturnData {
    username: string;
    memberData?: GuildMember | undefined;
    input?: any
}

const CANVAS_WIDTH = 292; // Canvas width for the ship image
const CANVAS_HEIGHT = 128; // Canvas height for the ship image
const AVATAR_RADIUS = 60; // Increased radius of circular avatars

// Paths to your images
const BACKGROUND_IMAGE_PATH = "./assets/images/shipping/background.png"  // Normal Background image path

const HEART_IMAGES = {
    "high": "./assets/images/shipping/heart.png", // Medium compatibility heart image
    "low": "./assets/images/shipping/heart_broken.png" // Low compatibility heart image
};

// Cache for preloaded images
let preloadedImages: Record<string, any> = {};

const remarks = [
    { range: [0, 10], remark: "Terrible 😞" },
    { range: [11, 20], remark: "Bad 🙁" },
    { range: [21, 30], remark: "Poor 🤦‍♂️" },
    { range: [31, 40], remark: "Mediocre 😬" },
    { range: [41, 50], remark: "Okay 🤔" },
    { range: [51, 60], remark: "Decent 🙂" },
    { range: [61, 70], remark: "Good 👍" },
    { range: [71, 80], remark: "Very good 😍" },
    { range: [81, 90], remark: "Amazing 🤩" },
    { range: [91, 99], remark: "Perfect ❤️" },
    { range: [100, 100], remark: "CRAZY! 🥰" },
    { range: [69, 69], remark: "NICE ( ͡° ͜ʖ ͡°)" },
];

export class ShipCommand extends Command {
    constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ship',
            aliases: ['shipper'],
            description: 'Calculate and display a compatibility score between two users or names.',
        });

        this.preloadImages();
    }

    // Preload images when the bot starts up to reduce delay later
    private async preloadImages() {
        preloadedImages["background"] = await loadImage(BACKGROUND_IMAGE_PATH);
        preloadedImages["high"] = await loadImage(HEART_IMAGES.high);
        preloadedImages["low"] = await loadImage(HEART_IMAGES.low);
    }

    public async messageRun(message: Message, args: Args) {
        const { UserOne: { username: firstUsername, memberData: firstMemberData }, UserTwo: { username: secondUsername, memberData: secondMemberData }, areBothMembers } = await this.getUserData(message, args);

        console.log(firstUsername, secondUsername)

        const { compatibilityScore, progressBar, shipName, remark } = this.calculateShipCompatibility(firstUsername, secondUsername);

        const messagePayload: MessageCreateOptions = {
            content: `💝 Matchmaking 💝\n🔺 \`${firstUsername}\`\n🔻 \`${secondUsername}\``,
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setImage("attachment://ship.png")
                    .addFields({ name: `🔀 ${shipName}`, value: `**${compatibilityScore}%** ${progressBar} ${remark}` })
            ]
        };

        if (areBothMembers) {
            const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            // Use preloaded background image
            const background = preloadedImages["background"];
            ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw the first avatar
            const firstAvatarUrl = firstMemberData.user.displayAvatarURL({ extension: 'png' });
            await this.drawAvatarOnCanvas(ctx, firstAvatarUrl, 10, 9);  // Increased position to make it closer

            // Draw the second avatar
            const secondAvatarUrl = secondMemberData.user.displayAvatarURL({ extension: 'png' });
            await this.drawAvatarOnCanvas(ctx, secondAvatarUrl, 156, 9); // Adjusted position to bring avatars closer

            // Use preloaded heart image based on compatibility score
            const heart = compatibilityScore >= 50 ? preloadedImages["high"] :
                preloadedImages["low"];

            // Scale the heart image to a smaller size (0.60 or 0.55 scale)
            const heartWidth = heart.width * 0.60;  // Scale the heart to 60% of its original size
            const heartHeight = heart.height * 0.60;

            // Calculate the center of the canvas
            const centerX = (CANVAS_WIDTH - heartWidth) / 2;
            const centerY = (CANVAS_HEIGHT - heartHeight) / 2;

            // Draw the scaled heart in the center
            ctx.drawImage(heart, centerX, centerY, heartWidth, heartHeight);

            const imageBuffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(imageBuffer, { name: "ship.png" });
            messagePayload.files = [attachment];
        }

        message.channel.send(messagePayload);
    }

    private async drawAvatarOnCanvas(ctx: any, url: string, x: number, y: number) {
        const tempCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const tempCtx = tempCanvas.getContext('2d');

        const avatar = await loadImage(url);
        tempCtx.beginPath();
        tempCtx.arc(x + AVATAR_RADIUS, y + AVATAR_RADIUS, AVATAR_RADIUS, 0, Math.PI * 2);
        tempCtx.closePath();
        tempCtx.clip();
        tempCtx.drawImage(avatar, x, y, AVATAR_RADIUS * 2, AVATAR_RADIUS * 2);

        ctx.drawImage(tempCanvas, 0, 0);
    }

    private getRemarkForCompatibility(score: number): string {
        const specialRemark = remarks.find(r => r.range[0] <= score && r.range[1] >= score);
        return specialRemark ? specialRemark.remark : 'No remark available for this score.';
    }

    private calculateShipCompatibility(name1: string, name2: string) {
        const name1Hash = this.hashString(name1);
        const name2Hash = this.hashString(name2);
        const compatibilityScore = Math.abs((name1Hash + name2Hash) % 101);
        const shipName = `${name1.slice(0, Math.floor(name1.length / 2))}${name2.slice(Math.floor(name2.length / 2))}`
        const progressBar = this.createProgressBar(compatibilityScore);
        const remark = this.getRemarkForCompatibility(compatibilityScore);

        return {
            compatibilityScore,
            shipName,
            progressBar,
            remark
        };
    }

    public createProgressBar(compatibilityScore: number): string {
        const filledBars = Math.floor(compatibilityScore / 20);  // Divides into 5 sections
        const halfFilled = compatibilityScore % 20 >= 10 ? 1 : 0;
        const emptyBars = 5 - filledBars - halfFilled;

        return `<:bar_begin_filled:1306259920949215233>` +
            `${"<:bar_full_filled:1306259924132691968>".repeat(filledBars)}` +
            `${halfFilled ? "<:bar_half_filled:1306259927400185917>" : ""}` +
            `${"<:bar_empty:1306258495582240821>".repeat(emptyBars)}` +
            `<:bar_end:1306257974934765760>`;
    }


    private hashString(input: string): number {
        return [...input].reduce((hash, char) => {
            hash = (hash << 5) - hash + char.charCodeAt(0);
            return hash >>> 0; // Ensure unsigned 32-bit result
        }, 0);
    }

    private async getUserData(message: Message, args: Args): Promise<{ UserOne: ShipReturnData, UserTwo: ShipReturnData, areBothMembers: boolean }> {
        const isMention = (input: string) => /^<@!?(\d{17,19})>$/.test(input);

        const fetchMember = async (input: string | null): Promise<string | GuildMember | null> => {
            if (!input || !isMention(input)) return input;
            const memberId = input.match(/\d{17,19}/)?.[0];
            return memberId ? await message.guild?.members.fetch(memberId).catch(() => input) : input;
        };

        let firstInput = await args.pick('string').catch(() => null);
        let secondInput = await args.pick('string').catch(() => null);

        let firstMember;
        let secondMember;

        if (!firstInput) {
            // Case 1: No arguments provided
            firstMember = message.member!;
            secondMember = message.guild?.members.cache.random() || firstMember;
        } else if (!secondInput) {
            // Case 2: One argument provided
            secondMember = await fetchMember(firstInput);
            firstMember = message.member!;
        } else {
            // Case 3: Two arguments provided
            firstMember = await fetchMember(firstInput);
            secondMember = await fetchMember(secondInput);
        }

        const data = {
            UserOne: {
                username: firstMember?.user ? firstMember?.nickname ?? firstMember?.user?.globalName ?? firstMember?.user?.username : firstMember,
                memberData: firstMember,
                input: firstInput
            },
            UserTwo: {
                username: secondMember?.user ? secondMember?.nickname ?? secondMember?.user?.globalName ?? secondMember?.user?.username : secondMember,
                memberData: secondMember,
                input: secondInput
            },
            areBothMembers: !!firstMember.user && !!secondMember.user
        };

        console.log(data)

        return data

    }
}
