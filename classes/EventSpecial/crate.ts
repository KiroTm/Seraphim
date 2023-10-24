import { dropTypes } from "./drops";
export class CrateClass {
    public openCrate(inventory: {name: string, amount: number}[], name: string) {
        const crate = inventory.find((item) => item.name.toLowerCase() === name);
        if (!crate || crate?.amount == 0) return 'CrateNotFound'
        return crate
    }
}