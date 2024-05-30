interface LapTime {
    index: number;
    time: number;
}

/**
 * Class representing a stopwatch for measuring elapsed time and lap times.
 */
export class Stopwatch {
    private startTime: number | null; // The start time of the stopwatch.
    private lapTimes: LapTime[]; // Array to store lap times.
    private running: boolean; // Flag to indicate whether the stopwatch is running.

    /**
     * Constructor to initialize the stopwatch.
     */
    constructor() {
        this.startTime = null; // Initialize start time to null.
        this.lapTimes = []; // Initialize lap times array.
        this.running = false; // Initialize running flag to false.
    }

    /**
     * Method to start the stopwatch.
     */
    start() {
        if (!this.running) {
            this.startTime = Date.now(); // Set the start time to the current time.
            this.running = true; // Set running flag to true.
        }
    }

    /**
     * Method to stop the stopwatch.
     * @param {boolean} setLap - Whether to record a lap time.
     * @returns {number} - The elapsed time in milliseconds.
     */
    stop(setLap = false): number {
        if (this.running) {
            const elapsedTime = Date.now() - this.startTime!; // Calculate elapsed time.
            if (setLap) {
                this.lap(); // Record a lap time if setLap is true.
            }
            this.running = false; // Set running flag to false.
            return elapsedTime; // Return elapsed time.
        }
        return 0; // If stopwatch is not running, return 0.
    }

    /**
     * Method to reset the stopwatch.
     */
    reset() {
        this.startTime = null; // Reset start time to null.
        this.lapTimes = []; // Clear lap times array.
        this.running = false; // Set running flag to false.
    }

    /**
     * Method to record a lap time.
     */
    lap() {
        if (this.running && this.startTime !== null) {
            const elapsedTime = Date.now() - this.startTime; // Calculate elapsed time.
            this.lapTimes.push({ index: this.lapTimes.length + 1, time: elapsedTime }); // Add lap time to lap times array.
        }
    }

    /**
     * Method to get the elapsed time since the stopwatch started.
     * @returns {number} - The elapsed time in milliseconds.
     */
    getElapsedTime(): number {
        if (this.running && this.startTime !== null) {
            return Date.now() - this.startTime; // Calculate and return elapsed time.
        }
        return 0; // If stopwatch is not running, return 0.
    }

    /**
     * Method to get the lap times recorded by the stopwatch.
     * @returns {LapTime[]} - Array of lap times.
     */
    getLapTimes(): LapTime[] {
        return this.lapTimes; // Return the array of lap times.
    }

    /**
     * Method to format time in milliseconds into a human-readable string.
     * @param {number} timeInMilliseconds - Time in milliseconds to format.
     * @returns {string} - Formatted time string.
     */
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
