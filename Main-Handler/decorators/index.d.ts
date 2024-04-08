// Define the interface for options objects
interface Options {
    /** Custom options */
}

// Define the interface for ApplyOptions callback parameters
interface ApplyOptionsCallbackParameters {
    name: string;
}

// Define the ApplyOptions decorator for functions
function ApplyOptionsForFunction<T extends Options>(
    optionsOrFn: T | ((parameters: ApplyOptionsCallbackParameters) => T)
): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // Apply options to the function descriptor
        // For example:
        // descriptor.value.options = optionsOrFn instanceof Function ? optionsOrFn({ name: propertyKey.toString() }) : optionsOrFn;
        return descriptor;
    };
}

// Define the ApplyOptions decorator for classes
function ApplyOptionsForClass<T extends Options>(
    optionsOrFn: T | ((parameters: ApplyOptionsCallbackParameters) => T)
): ClassDecorator {
    return function (target: any) {
        // Apply options to the class
        // For example:
        // target.prototype.options = optionsOrFn instanceof Function ? optionsOrFn({ name: target.name }) : optionsOrFn;
    };
}