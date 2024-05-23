import { GarnetClient } from "../../GarnetHandler/Framework/src/GarnetClient";
import { Core } from "../../GarnetHandler/Core/src/Core";

export interface EventOptions extends Core.Options {
  event: string;
  prerequisite?: {
    events: Array<string>,
    method?: (args: any) => void;
  };
}

export abstract class Event extends Core {
  public readonly event!: string | symbol;

  constructor(client: GarnetClient, options: EventOptions) {
    super(client, options);
  }

  abstract run(...args: any[]): void;
}
