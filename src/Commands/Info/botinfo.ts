import { Callback, Command } from "../../../Main-Handler/typings";
import { EmbedBuilder } from "discord.js";
import { CpuInfo, cpus } from "os";
import { CodeStatistics } from "../../Classes/Misc/codestats";
import { Timestamp } from "../../Classes/Utility/Timestamp";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";

export default {
    name: "botinfo",
    description: "Displays bot's information",
    callback: async ({ message, instance, client }: Callback) => {
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
    },
    extraInfo: {
        command_usage: "{PREFIX}botinfo",
        command_example: "{PREFIX}botinfo",
        command_detailedExplaination: "This command provides information about the bot, including its latency, statistics (number of users, servers, and channels), code statistics (lines of code and number of files), uptime, and CPU usage. Here's how to use the command:\n\n- `{PREFIX}botinfo`: Displays information about the bot.",
    }

} as Command;

function generalStatistics(instance: ConfigInstance) {
    const { _client } = instance;
    return {
        channels: _client.channels.cache.size.toLocaleString(),
        guilds: _client.guilds.cache.size.toLocaleString(),
        nodeJs: process.version,
        users: _client.guilds.cache.reduce((acc: any, val: any) => acc + (val.memberCount ?? 0), 0).toLocaleString(),
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
