import { Util } from "canvacord"
export async function isValidHex(hex: string) {
    const valid = Util.validateHex(hex)
    if (valid === true) {
        return true
    } else {
        return false
    }
}

export function isValidHttpUrl(string: string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
