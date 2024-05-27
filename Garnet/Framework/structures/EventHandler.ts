import { GarnetClient } from "../GarnetClient";
import { Core } from "../../Core/Core";

/**
 * Interface representing the options for an Event.
 * @extends {Core.Options}
 * @property {string} event - The name of the event.
 * @property {Object} [prerequisite] - Prerequisite conditions for the event.
 * @property {Array<string>} prerequisite.events - A list of prerequisite events.
 * @property {(args: any) => void} [prerequisite.method] - A method to check prerequisite conditions.
 */
export interface EventOptions extends Core.Options {
  event: string;
  prerequisite?: {
    events: Array<string>;
    method?: (args: any) => void;
  };
}

/**
 * Abstract class representing an event, extending the Core class.
 * @abstract
 * @extends {Core}
 */
export abstract class Event extends Core {
  /** The name or symbol of the event. */
  public readonly event!: string | symbol;

  /**
   * Constructs a new Event instance.
   * @param {GarnetClient} client - The client instance associated with this event.
   * @param {EventOptions} options - Options to configure the event.
   * @example
   * ```typescript
   * class MessageEvent extends Event {
   *     constructor(client: GarnetClient) {
   *         super(client, { event: 'messageCreate', name: 'MessageEvent' });
   *     }
   *
   *     run(...args: any[]): void {
   *         console.log('Message received:', args);
   *     }
   * }
   *
   * const messageEvent = new MessageEvent(client);
   * console.log(messageEvent.event); // 'messageCreate'
   * ```
   */
  constructor(options: EventOptions) {
    super(options);
    this.event = options?.event ?? options?.name
    const { prerequisite } = options
    this?.global?.client?.on(this.event, (...args: any[]) => this.run(...args))
    prerequisite?.events?.forEach((event) => {
      this?.global?.client?.on(event, (...args: any[]) => this.run(...args))
    })
  }

  /**
   * Abstract method to be implemented by subclasses to handle the event.
   * @abstract
   * @param {...any} args - Arguments passed to the event handler.
   */
  abstract run(...args: any[]): void;
}
