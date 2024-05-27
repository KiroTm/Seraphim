import { GarnetClient } from "../Framework/GarnetClient";
import { global } from "./shared/global";

/**
 * Interface representing the options for the Core class.
 * @property {string} [name] - The name of the core module.
 * @property {boolean} [enabled] - Indicates whether the core module is enabled.
 */
export interface CoreOptions {
  name?: string;
  enabled?: boolean;
}

/**
* Abstract class representing a core module with common properties and methods.
* @abstract
*/
export abstract class Core {
  /** The client instance associated with this core module. */
  protected readonly client: GarnetClient;
  /** The name of the core module. */
  public readonly name: string;
  /** Indicates whether the core module is enabled. */
  public enabled: boolean;

  /**
   * Constructs a new Core instance.
   * @param {any} client - The client instance associated with this core module.
   * @param {CoreOptions} [options={}] - Options to configure the core module.
   * @example
   * ```typescript
   * class MyCore extends Core {
   *     constructor(client) {
   *         super(client, { name: 'MyCoreModule', enabled: true });
   *     }
   * }
   * const myCore = new MyCore(client);
   * console.log(myCore.name); // 'MyCoreModule'
   * console.log(myCore.enabled); // true
   * ```
   */
  constructor(client: any, options: CoreOptions = {}) {
    this.client = client;
    this.name = options.name ?? 'default';
    this.enabled = options.enabled ?? true;
  }

  public get global() {
    return global;
  }
}

/**
* Namespace for the Core class containing additional types.
*/
export namespace Core {
  /** Type alias for CoreOptions interface. */
  export type Options = CoreOptions;
}
