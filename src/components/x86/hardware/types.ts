import { CPU_BUS, X86_CONTROL_SIGNALS } from "./constants";

export type BinaryType = 0 | 1;

/**
 * 1. RD(Read)
 *  - Active-low output signal. Indicates that the data on the data bus is being
 *    read from the memory or I/O. Used along with pin 28 for read operations.
 *
 * 2. WR(Write)
 *  - Active-low output signal. Indicates that the data on the data bus is
 *    being written to memory or I/O. Used along with pin 28 for write operations.
 *
 * 3. IO/M(Memory or Input/Output)
 *  - Indicates whether the address bus is accessing memory or I/O device.
 *    In 8086, when it is high, it is accessing the memory and when it is low ,
 *    it is accessing the I/O.
 *
 * @link https://faraday.emu.edu.tr/eeng410/lectures/eee410_Lecture15.pdf
 */
export type X86ControlSignalsType = keyof typeof X86_CONTROL_SIGNALS;

export type BusType = keyof typeof CPU_BUS;

export type MicroprosseorType = keyof typeof CPU_BUS.CONTROL_SIGNALS;

export type ControlSignalsType =
  keyof (typeof CPU_BUS.CONTROL_SIGNALS)[keyof typeof CPU_BUS.CONTROL_SIGNALS];
