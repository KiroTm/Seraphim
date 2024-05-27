import { Core } from "../Core/Core";

/**
 * Represents the context in which options are applied.
 * @property {any} global - The global context, typically the client instance.
 * @property {any} context - Additional context or options passed during initialization.
 */
interface Context {
  global?: any;
  context: any;
}

/**
 * A decorator function that applies options to a class constructor.
 * @template T - The type of options.
 * @param {T | ((params: Context) => T)} optionsOrFn - Either a plain options object or a function that returns options based on context.
 * @returns {ClassDecorator} A class decorator function.
 */
export function ApplyOptions<T extends Core.Options>(
  optionsOrFn: T | ((params: Context) => T)
): ClassDecorator {
  /**
   * Applies options to the target class constructor.
   * @param {any} target - The target class constructor.
   * @returns {void} This function does not return anything.
   */
  return function (target: any): void {
    const originalConstructor = target;

    /**
     * Decorated class constructor that applies options.
     * @param {any[]} args - Arguments passed to the constructor.
     * @returns {void} This function does not return anything.
     */
    function DecoratedConstructor(...args: any[]): void {
      const [_, baseOptions] = args;
      const options = typeof optionsOrFn === 'function' ? optionsOrFn({ context: baseOptions }) : optionsOrFn;
      return new originalConstructor({ ...baseOptions, ...options });
    }

    DecoratedConstructor.prototype = Object.create(originalConstructor.prototype);
    DecoratedConstructor.prototype.constructor = DecoratedConstructor;

    return DecoratedConstructor(optionsOrFn)
  };
}
