//  16-bit Arithmetic Logic Unit
//  16-bit data bus
//  20-bit address bus – 1,048,576 = 1 meg
//  16 I/O lines so it can access 64K I/O ports
//  16 bit flag
//  It has 14 -16 bit registers
//  Clock frequency range is 5-10 MHZ
//  Designed by Intel
//  Rich set of instructions
//  40 Pin DIP, Operates in two modes

import { Bus, ControlBus } from "./bus";
import { decompile } from "./compiler";
import { Mode } from "./constants";
import { PrefetchInputQueue } from "./data-structures";
import {
  AccumulatorRegister,
  BaseRegister,
  CountRegister,
  DataRegister,
  DataSegmentRegister,
  ExecutionUnitRegister,
  InstructionPointerRegister,
  PointerRegister,
} from "./registers";

class BIU {
  private IP = new InstructionPointerRegister({ mode: "REAL" });
  private CS = new ExecutionUnitRegister({ mode: "REAL" });
  private DS = new DataSegmentRegister({ mode: "REAL" });
  private SS = new ExecutionUnitRegister({ mode: "REAL" });
  private ES = new ExecutionUnitRegister({ mode: "REAL" });

  /**
   *
   * Intel 8086 lacked an instruction cache but had a Prefetch Input Queue (PIQ),
   * which read up to six bytes ahead of current instruction
   *
   * @link https://safari.ethz.ch/architecture/fall2019/lib/exe/fetch.php?media=prefetching_lecture_eth_22-11-2019_copy.pdf
   */
  private prefetchQueue = new PrefetchInputQueue({ maxSize: 6 });
  private _mode: keyof typeof Mode;
  private _addressBus: Bus;
  private _dataBus: Bus;
  private _controlBus: ControlBus;

  constructor({
    mode,
    addressBus,
    dataBus,
    controlBus,
  }: {
    mode: keyof typeof Mode;
    addressBus: Bus;
    dataBus: Bus;
    controlBus: ControlBus;
  }) {
    this._mode = mode;
    this._addressBus = addressBus;
    this._dataBus = dataBus;
    this._controlBus = controlBus;
  }

  public fetch() {
    const codeSegmentRegister = this.CS;
    const instructionPointerRegister = this.IP;

    let physicalAddress: number | null = null;

    if (this._mode === "REAL") {
      /**
       * ## Compute Physical Address
       * In real mode, there is no hardware-based memory protection (GDT), nor virtual memory.
       * Segments and Offsets are related to physical addresses by the equation.
       * formula: Physical Address = Segment * 16 + Offset
       * @link https://wiki.osdev.org/Real_Mode#:~:text=Segments%20and%20Offsets,Segment%20*%2016%20%2B%20Offset
       */
      physicalAddress =
        codeSegmentRegister.getBaseAddress() * Mode.REAL.BITS +
        instructionPointerRegister.getOffsetValue();
    }

    if (physicalAddress === null) {
      throw new Error("❌ Physical address computation failed!");
    }

    /**
     *  Step 1: Place address on Address Bus, this is one-way directional
     *  flow from CPU
     */
    this._addressBus.sends({ detail: { address: physicalAddress } });

    console.log(`🚀 [BIU] Sending Address: ${physicalAddress.toString(16)}`);

    // Step 2: Signal Read Operation via Control Bus
    this._controlBus.sends({
      event: "READ",
      detail: true,
    });

    console.log("📡 [BIU] Sending Read Signal (RD)");

    // Step 3: Listen for Memory Response on Data Bus
    this._dataBus.receives({
      handler: (data) => {
        console.log(`📈 [BIU] Received value: ${data}`);
        this.prefetchQueue.enqueue(data as bigint);
      },
    });

    console.log("🕐 [BIU] Waiting for instruction...");

    instructionPointerRegister.increment();

    console.log(
      `📈 [BIU] Incremented IP: ${instructionPointerRegister
        .getOffsetValue()
        .toString(16)}`
    );
  }

  public getNextInstruction() {
    return this.prefetchQueue.dequeue();
  }
}

class EU {
  // 16-bit registers (2 bytes each)
  private registers = {
    AX: new AccumulatorRegister(),
    BX: new BaseRegister(), // the Base Register
    CX: new CountRegister(), // the Count Register
    DX: new DataRegister(), // the Data Register
    SP: new PointerRegister({ mode: "REAL" }),
    BP: new Uint16Array(1),
    SI: new Uint16Array(1), // the Source Index Register
    DI: new Uint16Array(1), // the Destination Register
  };

  private _mode: keyof typeof Mode;

  constructor({ mode }: { mode: keyof typeof Mode }) {
    this._mode = mode;
    console.log("BIU initialized with segment registers and prefetch queue.");
  }

  public decode(ecodedValue: bigint) {
    const instruction = decompile({ value: ecodedValue, wordSize: 8 });

    console.log(`Received ${instruction}`);
  }
}

export const MEMORY_CHIPS = {
  addresses: 128,
  wordSizeBitsFormat: 8,
} as const;

export class Microprocessor {
  private busInterfaceUnit: BIU;
  private executionUnit: EU;

  private _mode: keyof typeof Mode;

  private _addressLines: number;

  private _addressBus: Bus;
  private _dataBus: Bus;
  private _controlBus: ControlBus;

  constructor({
    addressLines,
    mode,
    addressBus,
    dataBus,
    controlBus,
  }: {
    addressLines: number;
    mode: keyof typeof Mode;
    addressBus: Bus;
    dataBus: Bus;
    controlBus: ControlBus;
  }) {
    this._addressLines = addressLines;
    this._mode = mode;
    this._addressBus = addressBus;
    this._dataBus = dataBus;
    this._controlBus = controlBus;

    this.busInterfaceUnit = new BIU({
      mode,
      addressBus: this._addressBus,
      dataBus: this._dataBus,
      controlBus: this._controlBus,
    });

    this.executionUnit = new EU({ mode });
  }

  public getAddressLines() {
    return this._addressLines;
  }

  public fetch() {
    this.busInterfaceUnit.fetch();
  }

  public decode() {
    const instruction = this.busInterfaceUnit.getNextInstruction();

    if (instruction == null) {
      return;
    }

    this.executionUnit.decode(instruction);
  }
}
