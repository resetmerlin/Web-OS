import { IS_LITTLE_ENDIAN, Mode } from "./constants";
import { convertBitToByte, mergeInto16bits } from "./utils";

export class BusInterfaceUnitRegister {
  private _size = new Uint16Array(1); // Register size is 16 bits
  private _startingAddress = new ArrayBuffer(65536); // 64 KB

  constructor() {}

  public getSize() {
    return this._size;
  }

  public getStartingAddress() {
    return this._startingAddress;
  }
}

export class ExecutionUnitRegisterd {
  private hightByte = new Uint8Array(1); // 8bits
  private lowByte = new Uint8Array(1);

  constructor() {}

  public getSize() {
    return mergeInto16bits(this.hightByte, this.lowByte);
  }
}

export class DataSegmentRegister {
  private _baseAddress = 0x0000;
  private buffer: DataView;
  private _mode: keyof typeof Mode;

  constructor({ mode }: { mode: keyof typeof Mode }) {
    this._mode = mode;

    const currentModeByte = convertBitToByte(Mode[mode].BITS);

    this.buffer = new DataView(new ArrayBuffer(currentModeByte));

    this.setBaseAddress(this._baseAddress);
  }

  public setBaseAddress(baseAddress: number) {
    this.buffer.setUint16(0, baseAddress, IS_LITTLE_ENDIAN);
  }

  public getBaseAddress() {
    return this.buffer.getUint16(0, IS_LITTLE_ENDIAN);
  }
}

export class AccumulatorRegister extends ExecutionUnitRegisterd {
  constructor() {
    super();
  }
}

export class BaseRegister extends ExecutionUnitRegisterd {
  constructor() {
    super();
  }
}

export class CountRegister extends ExecutionUnitRegisterd {
  constructor() {
    super();
  }
}

export class DataRegister extends ExecutionUnitRegisterd {
  constructor() {
    super();
  }
}

export class FlagRegister {
  private buffer = new Uint16Array(1);
  /**
   * CarryFlag
   * - Set by carry out of MSB
   */
  private CF = this.buffer[0];
  /**
   * ParityFlag
   * - Set if result has even parity
   */
  private PF = this.buffer[2];
  /**
   * Auxiliary Flag
   * - for BCD arithmetic
   */
  private AF = this.buffer[4];
  /**
   * Zero Flag
   * - Set if result is zero
   */
  private ZF = this.buffer[6];
  /**
   * SF Sign Flag
   * - MSB of result
   */
  private SF = this.buffer[7];
  /**
   * Single Step Trap Flag
   */
  private TF = this.buffer[8];
  /**
   * Interrupt Enable Flag
   */
  private IF = this.buffer[9];
  /**
   * String Instruction Direction Flag
   */
  private DF = this.buffer[10];
  /**
   * Overflow Flag
   */
  private OF = this.buffer[11];
}

export class ExecutionUnitRegister {
  private _baseAddress = 0x0000;
  private buffer: DataView;
  private _mode: keyof typeof Mode;

  constructor({ mode }: { mode: keyof typeof Mode }) {
    this._mode = mode;

    const currentModeByte = convertBitToByte(Mode[mode].BITS);

    this.buffer = new DataView(new ArrayBuffer(currentModeByte));

    this.setBaseAddress(this._baseAddress);
  }

  public setBaseAddress(baseAddress: number) {
    this.buffer.setUint16(0, baseAddress, IS_LITTLE_ENDIAN);
  }

  public getBaseAddress() {
    return this.buffer.getUint16(0, IS_LITTLE_ENDIAN);
  }
}

export class PointerRegister {
  private _offset = 0x0000;
  private _mode: keyof typeof Mode;
  private buffer: DataView;

  constructor({ mode }: { mode: keyof typeof Mode }) {
    this._mode = mode;

    const currentModeByte = convertBitToByte(Mode[mode].BITS);

    this.buffer = new DataView(new ArrayBuffer(currentModeByte));

    this.setOffset(this._offset);
  }

  public setOffset(offset: number) {
    if (this.isOffsetSizeValid(offset) === false) {
      throw new Error("Offset size is too big or small");
    }

    switch (this._mode) {
      case "REAL":
        this.buffer.setUint16(0, offset, IS_LITTLE_ENDIAN);
        break;
      case "PROTECTED":
        this.buffer.setUint32(0, offset, IS_LITTLE_ENDIAN);
        break;
      case "LONG":
        this.buffer.setBigUint64(0, BigInt(offset), IS_LITTLE_ENDIAN);
        break;
    }
  }

  public getOffsetValue() {
    switch (this._mode) {
      case "REAL":
        return this.buffer.getUint16(0, IS_LITTLE_ENDIAN);
      case "PROTECTED":
        return this.buffer.getUint32(0, IS_LITTLE_ENDIAN);
      case "LONG":
        return Number(this.buffer.getBigUint64(0, IS_LITTLE_ENDIAN));
    }
  }

  private isOffsetSizeValid(offset: number): boolean {
    return offset >= Mode[this._mode].MIN && offset <= Mode[this._mode].MAX;
  }
}

export class InstructionPointerRegister extends PointerRegister {
  constructor({ mode }: { mode: keyof typeof Mode }) {
    super({ mode });
  }

  /**
   * @description Increments the Instruction Pointer (IP) by the given instruction size (default: 1 byte).
   *
   * When the processor fetches an instruction, it decodes the instruction and increments the offset
   * based on the **size of the decoded instruction** (which can be variable in x86).
   *
   * In **8086 real mode**, the IP is a 16-bit register that keeps track of the **next instruction**
   * to be executed within the currently selected code segment (CS:IP).
   *
   * @todo However getting the size of instructions requires compiler so it's kind of over-engneering.
   *       ## So we just fixed the instruction size into just a byte
   *
   * @param {number} size - The size of the decoded instruction in bytes.
   */
  public increment(size: number = 1) {
    const incrementedOffset = this.getOffsetValue() + size;
    this.setOffset(incrementedOffset);
  }

  /**
   * Resets the instruction pointer back to zero (for new programs).
   */
  public reset() {
    this.setOffset(0x0000);
  }
}
