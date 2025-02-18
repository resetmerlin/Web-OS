import { CPU_BUS } from "./constants";
import { BusType, ControlSignalsType, MicroprosseorType } from "./types";

/**
 * ## Bus is just a group of wires but with purposes, can be divided into address, data and control bus
 *    To make it responsible like state, we use CustomEvent web api
 * @link https://ee.usc.edu/~redekopp/cs356/slides/CS356Unit4_x86_ISA.pdf
 */
export class Bus {
  private _type: BusType;

  constructor({ type }: { type: BusType }) {
    this._type = type;
  }

  public sends({ event, detail }: { event?: string; detail: unknown }) {
    const key = this.getEventKey(event);

    if (key == null) return;

    window.dispatchEvent(new CustomEvent(key, { detail }));
  }

  public receives({
    event,
    handler,
  }: {
    event?: string;
    handler: (data: unknown) => void;
  }) {
    const key = this.getEventKey(event);

    if (key == null) return;

    window.addEventListener(key, (e) => {
      if (e instanceof CustomEvent) {
        handler(e.detail);
      }
    });
  }

  private getEventKey(event?: string) {
    if (this._type !== "CONTROL_SIGNALS") {
      return this._type;
    }

    return event;
  }
}

export class ControlBus extends Bus {
  private _specs: MicroprosseorType;
  constructor({ type, specs }: { type: BusType; specs: MicroprosseorType }) {
    super({ type });

    this._specs = specs;
  }

  public sends({
    event,
    detail,
  }: {
    event: ControlSignalsType;
    detail: unknown;
  }): void {
    if (CPU_BUS.CONTROL_SIGNALS[this._specs][event] == null) {
      throw new Error(`The event doesn't match with the specs you gave`);
    }
    super.sends({ event: event as unknown as string, detail });
  }

  public receives({
    event,
    handler,
  }: {
    event: ControlSignalsType;
    handler: (data: unknown) => void;
  }): void {
    if (CPU_BUS.CONTROL_SIGNALS[this._specs][event] == null) {
      throw new Error(`The event doesn't match with the specs you gave`);
    }

    super.receives({ event, handler });
  }
}
