/**
 * Interface for defining options for an event.
 */
export interface EventOptions {
    /** The name of the event. */
    event: string;
    /** Prerequisite events and method to execute. */
    prerequisite?: {
        /** Array of prerequisite events. */
        events: Array<string>,
        /** Method to execute as a prerequisite. */
        method: (any)
    }
}

/**
 * Abstract class representing an event.
 */
export abstract class Event {
    /** The name of the event. */
    public readonly event!: string | symbol;

    /**
     * Constructor for the Event class.
     * @param args Arguments passed to the constructor.
     */
    constructor(...args: any[]) {
        const [] = args; // Destructure arguments if needed
        // console.log(args)
    }

    /**
     * Abstract method to be implemented by subclasses.
     * @param args Arguments passed to the run method.
     */
    abstract run(...args: any[]): void;
}
