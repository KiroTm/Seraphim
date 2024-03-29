import { Callback, Command } from "../../../Main-Handler/typings";
import { EmbedBuilder } from "discord.js";
import { CpuInfo, cpus } from "os";
import { CodeStatistics } from "../../Classes/Misc/codestats";
import { Timestamp } from "../../Classes/Utility/Timestamp";

export default {
    name: "botinfo",
    description: "Displays bot's information",
    callback: async ({ message, instance, client }: Callback) => {
        try {
            const codeStats = await new CodeStatistics().count();
            const stats = generalStatistics(instance);
            const uptimeStats = uptimeStatistics(instance);
            const usageStats = usageStatistics();

            const embedFields = [
                { name: "Latency", value: `Bot Ping: \`${client.ws.ping}\`ms`, inline: true },
                { name: "Statistics", value: `Users: \`${stats.users}\`\nServers: \`${stats.guilds}\`\nChannels: \`${stats.channels}\``, inline: true },
                { name: "Misc", value: `Lines of code: \`${codeStats.linesOfCode}\`\nFiles: \`${codeStats.numOfFiles}\``, inline: true },
                { name: "Uptime", value: `Client: ${uptimeStats.client}`, inline: true },
                { name: "CPU usage", value: `Heap: \`${usageStats.ramUsed}MB\` (Total: \`${usageStats.ramTotal}MB\`)\nCPU Load: ${usageStats.cpuLoad}`, inline: true },
            ];

            await message.channel.send({
                embeds: [new EmbedBuilder().setColor("#2B2D32").addFields(embedFields)],
            });
        } catch (error) {}
    },
} as Command;

function generalStatistics(instance: any) {
    const { client } = instance;
    return {
        channels: client.channels.cache.size.toLocaleString(),
        guilds: client.guilds.cache.size.toLocaleString(),
        nodeJs: process.version,
        users: client.guilds.cache.reduce((acc: any, val: any) => acc + (val.memberCount ?? 0), 0).toLocaleString(),
    };
}

function uptimeStatistics(instance: any) {
    const now = Date.now();
    return { client: new Timestamp(now - instance._client.uptime!).getRelativeTime() };
}

function usageStatistics() {
    const usage = process.memoryUsage();
    return {
        cpuLoad: `\`${cpus().map(formatCpuInfo).join("` `")}\``,
        ramTotal: `${(usage.heapTotal / 1048576).toFixed(2)}`,
        ramUsed: `${(usage.heapUsed / 1048576).toFixed(2)}`,
    };
}

function formatCpuInfo({ times }: CpuInfo) {
    return `${Math.round(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
}
