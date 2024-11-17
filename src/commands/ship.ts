import { Message, GuildMember, EmbedBuilder, AttachmentBuilder, MessageCreateOptions } from 'discord.js';
import { createCanvas, Image, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { Args, Command } from '@sapphire/framework';

// Interfaces for structured data types
interface ShipReturnData {
    username: string;
    memberData?: GuildMember | undefined;
    input?: string | GuildMember | null;
}

interface CompatibilityResult {
    compatibilityScore: number;
    shipName: string;
    progressBar: string;
    remark: string;
}

interface UserData {
    UserOne: ShipReturnData;
    UserTwo: ShipReturnData;
    areBothMembers: boolean;
}

// Constants for dimensions and image paths
const CANVAS_WIDTH = 292;
const CANVAS_HEIGHT = 128;
const AVATAR_RADIUS = 60;

const BACKGROUND_IMAGE_PATH = './assets/images/shipping/background.png';
const HEART_IMAGES = {
    high: './assets/images/shipping/heart.png',
    low: './assets/images/shipping/heart_broken.png',
};

// Cache for preloaded images
const preloadedImages: Record<string, Image> = {};

// Remarks based on compatibility score ranges
const remarks: { range: [number, number]; remark: string }[] = [
    { range: [0, 10], remark: 'Terrible 😞' },
    { range: [11, 20], remark: 'Bad 🙁' },
    { range: [21, 30], remark: 'Poor 🤦‍♂️' },
    { range: [31, 40], remark: 'Mediocre 😬' },
    { range: [41, 50], remark: 'Okay 🤔' },
    { range: [51, 60], remark: 'Decent 🙂' },
    { range: [61, 70], remark: 'Good 👍' },
    { range: [71, 80], remark: 'Very good 😍' },
    { range: [81, 90], remark: 'Amazing 🤩' },
    { range: [91, 99], remark: 'Perfect ❤️' },
    { range: [100, 100], remark: 'CRAZY! 🥰' },
    { range: [69, 69], remark: 'NICE ( ͡° ͜ʖ ͡°)' },
];

export class UserCommand extends Command {
    constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ship',
            aliases: ['shipper'],
            description: 'Calculate and display a compatibility score between two users or names.',
            cooldownDelay: 10000,
            cooldownFilteredUsers: ['1203054172686254081']
        });

        this.preloadImages();
    }

    private async preloadImages(): Promise<void> {
        preloadedImages['background'] = await loadImage(BACKGROUND_IMAGE_PATH);
        preloadedImages['high'] = await loadImage(HEART_IMAGES.high);
        preloadedImages['low'] = await loadImage(HEART_IMAGES.low);
    }

    public async messageRun(message: Message, args: Args): Promise<void> {
        const { UserOne, UserTwo, areBothMembers } = await this.getUserData(message, args);

        const { compatibilityScore, progressBar, shipName, remark } = this.calculateShipCompatibility(
            UserOne.username,
            UserTwo.username
        );

        const messagePayload: MessageCreateOptions = {
            content: `💝 Matchmaking 💝\n🔺 \`${UserOne.username}\`\n🔻 \`${UserTwo.username}\``,
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setImage('attachment://ship.png')
                    .addFields({
                        name: `🔀 ${shipName}`,
                        value: `**${compatibilityScore}%** ${progressBar} ${remark}`,
                    }),
            ],
        };

        if (areBothMembers) {
            const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            const background = preloadedImages['background'];
            ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const firstAvatarUrl = UserOne.memberData!.user.displayAvatarURL({ extension: 'png' });
            await this.drawAvatarOnCanvas(ctx, firstAvatarUrl, 10, 9);

            const secondAvatarUrl = UserTwo.memberData!.user.displayAvatarURL({ extension: 'png' });
            await this.drawAvatarOnCanvas(ctx, secondAvatarUrl, 156, 9);

            const heart = compatibilityScore >= 50 ? preloadedImages['high'] : preloadedImages['low'];
            const heartWidth = heart.width * 0.6;
            const heartHeight = heart.height * 0.6;
            ctx.drawImage(heart, (CANVAS_WIDTH - heartWidth) / 2, (CANVAS_HEIGHT - heartHeight) / 2, heartWidth, heartHeight);

            const imageBuffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'ship.png' });
            messagePayload.files = [attachment];
        }

        await message.channel.send(messagePayload);
    }

    private async drawAvatarOnCanvas(
        ctx: SKRSContext2D,
        url: string,
        x: number,
        y: number
    ): Promise<void> {
        const avatar = await loadImage(url);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + AVATAR_RADIUS, y + AVATAR_RADIUS, AVATAR_RADIUS, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, AVATAR_RADIUS * 2, AVATAR_RADIUS * 2);
        ctx.restore();
    }

    private getRemarkForCompatibility(score: number): string {
        const specialRemark = remarks.find((r) => r.range[0] <= score && r.range[1] >= score);
        return specialRemark ? specialRemark.remark : 'No remark available.';
    }

    private calculateShipCompatibility(name1: string, name2: string): CompatibilityResult {
        const name1Hash = this.hashString(name1);
        const name2Hash = this.hashString(name2);
        const compatibilityScore = Math.abs((name1Hash + name2Hash) % 101);
        const shipName = `${name1.slice(0, Math.floor(name1.length / 2))}${name2.slice(Math.floor(name2.length / 2))}`;
        const progressBar = this.createProgressBar(compatibilityScore);
        const remark = this.getRemarkForCompatibility(compatibilityScore);

        return { compatibilityScore, shipName, progressBar, remark };
    }

    private createProgressBar(compatibilityScore: number): string {
        const filledBars = Math.floor(compatibilityScore / 20);
        const halfFilled = compatibilityScore % 20 >= 10 ? 1 : 0;
        const emptyBars = 5 - filledBars - halfFilled;

        return (
            `<:bar_begin_filled:1306259920949215233>` +
            `${'<:bar_full_filled:1306259924132691968>'.repeat(filledBars)}` +
            `${halfFilled ? '<:bar_half_filled:1306259927400185917>' : ''}` +
            `${'<:bar_empty:1306258495582240821>'.repeat(emptyBars)}` +
            `<:bar_end:1306257974934765760>`
        );
    }

    private hashString(input: string): number {
        return [...input].reduce((hash, char) => {
            hash = (hash << 5) - hash + char.charCodeAt(0);
            return hash >>> 0;
        }, 0);
    }

    private async getUserData(message: Message, args: Args): Promise<UserData> {
        const isMention = (input: string): boolean => /^<@!?(\d{17,19})>$/.test(input);

        const fetchMember = async (input: string | null): Promise<string | GuildMember | null> => {
            if (!input || !isMention(input)) return input;
            const memberId = input.match(/\d{17,19}/)?.[0];
            return memberId ? await message.guild?.members.fetch(memberId).catch(() => input) as GuildMember : input;
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

        return {
            UserOne: {
                username:
                    firstMember instanceof GuildMember
                        ? firstMember.nickname ?? firstMember.user.globalName ?? firstMember.user.username
                        : (firstMember as string),
                memberData: firstMember instanceof GuildMember ? firstMember : undefined,
                input: firstInput,
            },
            UserTwo: {
                username:
                    secondMember instanceof GuildMember
                        ? secondMember.nickname ?? secondMember.user.globalName ?? secondMember.user.username
                        : (secondMember as string),
                memberData: secondMember instanceof GuildMember ? secondMember : undefined,
                input: secondInput,
            },
            areBothMembers: firstMember instanceof GuildMember && secondMember instanceof GuildMember,
        };
    }
}