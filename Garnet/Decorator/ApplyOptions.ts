/**
 * Interface representing a flexible set of options.
 * This can contain any number of key-value pairs.
 */
interface Options { 
  [key: string]: any; 
}

/**
* Interface representing the context passed to the options function.
* Contains global context (like the client instance) and specific context (like base options).
*/
interface Context { 
  global: any; 
  context: any; 
}

/**
* A decorator function that applies additional options to a class constructor.
* @template T - Type extending the generic Options interface.
* @param {T | ((params: Context) => T)} optionsOrFn - An object of options or a function that returns an options object.
* If a function is provided, it receives a context object containing `global` and `context` properties.
* @returns {ClassDecorator} - A class decorator function that modifies the class constructor to include the additional options.
* @example
* ```typescript
* interface MyOptions extends Options {
*     additionalSetting?: string;
* }
* 
* const options: MyOptions = { additionalSetting: 'value' };
* 
* @ApplyOptions(options)
* class MyClass {
*     constructor(client: any, options: MyOptions) {
*         // constructor logic
*     }
* }
* 
* // Or using a function
* @ApplyOptions((params: Context) => ({ additionalSetting: params.global.someValue }))
* class MyClass {
*     constructor(client: any, options: MyOptions) {
*         // constructor logic
*     }
* }
* ```
*/
export function ApplyOptions<T extends Options>(
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
      const [client, baseOptions] = args;
      const options = typeof optionsOrFn === 'function' ? optionsOrFn({ global: client, context: baseOptions }) : optionsOrFn;
      return new originalConstructor(client, { ...baseOptions, ...options });
    }

    DecoratedConstructor.prototype = Object.create(originalConstructor.prototype);
    DecoratedConstructor.prototype.constructor = DecoratedConstructor;

    return DecoratedConstructor as any;
  };
}