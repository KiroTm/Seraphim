import path from 'path'
import fs from 'fs'

const getAllFiles = (path1: any, foldersOnly: boolean = false) => {
    const files = fs.readdirSync(path1, {
        withFileTypes: true,
    });
    let filesFound: any[] = [];
    for (const file of files) {
        const filePath = path.join(path1, file.name);
        if (file.isDirectory()) {
            if (foldersOnly) {
                filesFound.push(filePath);
            }
            else {
                filesFound = [...filesFound, ...getAllFiles(filePath)];
            }
            continue;
        }
        filesFound.push(filePath);
    }
    return filesFound;
};
export default getAllFiles