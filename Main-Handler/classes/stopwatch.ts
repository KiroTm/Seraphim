interface LapTime {
    index: number;
    time: number;
}

export class Stopwatch {
    private startTime: number | null;
    private lapTimes: LapTime[];
    private running: boolean;

    constructor() {
        this.startTime = null;
        this.lapTimes = [];
        this.running = false;
    }

    start() {
        // Method to start the stopwatch
        if (!this.running) {
            this.startTime = Date.now();
            this.running = true;
        }
    }

    stop(setLap = false): number {
        // Method to stop the stopwatch
        if (this.running) {
            const elapsedTime = Date.now() - this.startTime!;
            if (setLap) {
                this.lap();
            }
            this.running = false;
            return elapsedTime;
        }
        return 0;
    }

    reset() {
        this.startTime = null;
        this.lapTimes = [];
        this.running = false;
    }

    lap() {
        if (this.running && this.startTime !== null) {
            const elapsedTime = Date.now() - this.startTime;
            this.lapTimes.push({ index: this.lapTimes.length + 1, time: elapsedTime });
        }
    }

    getElapsedTime(): number {
        if (this.running && this.startTime !== null) {
            return Date.now() - this.startTime;
        }
        return 0;
    }

    getLapTimes(): LapTime[] {
        // Method to get the lap times
        return this.lapTimes;
    }

    formatTime(timeInMilliseconds: number): string {
        const timeUnits = [
            { label: 'day', divisor: 86400000 },
            { label: 'hour', divisor: 3600000 },
            { label: 'minute', divisor: 60000 },
            { label: 'second', divisor: 1000 },
            { label: 'millisecond', divisor: 1 }
        ];
    
        return timeUnits
            .map(({ label, divisor }) => {
                const value = Math.floor(timeInMilliseconds / divisor);
                timeInMilliseconds %= divisor;
                return value ? `${value} ${label}${value !== 1 ? 's' : ''}` : '';
            })
            .filter(Boolean)
            .join(', ');
    }    
}
