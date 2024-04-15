import { Utils } from '../utils/Utils';

// Define interfaces for options and context
interface Options { [key: string]: any; }
interface Context { container: any; context: any; }

/**
 * Decorator function to apply options to a class.
 * @param optionsOrFn Options to be applied directly or a function that returns options based on context.
 * @returns A ClassDecorator function.
 */
export function ApplyOptions<T extends Options>(
  optionsOrFn: T | ((params: Context) => T)
): ClassDecorator {
  // Return the actual decorator function
  return function(target: any): void {
    // Assign options to the prototype of the target class
    Object.assign(target.prototype, optionsOrFn);
    
    // Get a reference to the target class
    const decoratedClass = target;

    // Constructor function for the decorated class
    function DecoratedConstructor(...args: any[]): void {
      // Extract context and base options from arguments
      const [context, baseOptions] = args;
      
      // Create an instance of the decorated class using a proxy
      Utils.createProxy(new decoratedClass(target, { ...baseOptions, ...context }), {
        // Proxy construct method to modify instance creation behavior
        construct: (T, [context, baseOptions]: [any, any]) => {
          // Compute final options based on whether optionsOrFn is a function or not
          const options = typeof optionsOrFn === 'function' ? optionsOrFn({ container: target, context }) : optionsOrFn;
          
          // Return a new instance of the decorated class with merged options
          return new T(target, { ...baseOptions, ...options });
        }
      });
    }

    // Return the constructor function
    return DecoratedConstructor(optionsOrFn);
  };
}
