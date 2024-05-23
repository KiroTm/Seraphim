export interface CoreOptions {
    name?: string;
    enabled?: boolean;
  }
  
  export abstract class Core {
    protected readonly client: any;
    public readonly name: string;
    public enabled: boolean;
  
    constructor(client: any, options: CoreOptions = {}) {
      this.client = client;
      this.name = options.name ?? 'default';
      this.enabled = options.enabled ?? true;
    }
  
    public get global(): any {
      return this.client;
    }
}

export namespace Core {
    export type Options = CoreOptions
}