export class MarriageClass {
    public Ship(f: string, s: string) {
        let percent = this.p(f, s)
        return {
            name: `${f.slice(0, f.length / 2)}${s.slice(s.length / 2)}`,
            bar: this.barGenerator(percent),
            percent
        }
    }

    public barGenerator(Percentage: number) {
        const l = 10; const f = Math.round((Percentage / 100) * l); const e = l - f; return `[${'█'.repeat(f)}${'░'.repeat(e)}]`; 
    }

    // helper functions
    private h(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h = (h << 5) - h + c; h = h & h; } return h; }
    private p(a1: string, a2: string) { const h1 = this.h(a1); const h2 = this.h(a2); return (Math.abs(h1 + h2) % 101); }
}