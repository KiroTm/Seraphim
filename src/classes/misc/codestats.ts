import { promises as fs } from 'fs';
import * as path from 'path';
export class CodeStatistics {
    constructor() {}

    async count() {
        let totalLines = 0;
        let totalFiles = 0;

        const processFile = async (file: string) => {
            const data = await fs.readFile(file, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().endsWith('*/'));
            totalLines += lines.length;
            totalFiles++;
        };

        const processDirectory = async (directory: string) => {
            const files = await fs.readdir(directory);
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                if (stats.isDirectory()) {
                    await processDirectory(filePath);
                } else if (stats.isFile()) {
                    await processFile(filePath);
                }
            }
        };

        await processDirectory('src');
        return { linesOfCode: totalLines, numOfFiles: totalFiles };
    }
}
