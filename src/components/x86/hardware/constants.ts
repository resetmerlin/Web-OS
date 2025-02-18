export const Mode = {
  /**
   * Real mode, also called real address mode, is an operating mode of all x86-compatible CPUs.
   * @link https://en.wikipedia.org/wiki/Real_mode
   */
  REAL: {
    BITS: 16,
    MIN: 0x000,
    MAX: 0xffff,
  },
  /**
   * In computing, protected mode, also called protected virtual address mode,
   * [1] is an operational mode of x86-compatible central processing units (CPUs).
   * @link https://en.wikipedia.org/wiki/Protected_mode
   */
  PROTECTED: {
    BITS: 32,
    MIN: 0x00000000,
    MAX: 0xffffffff,
  },
  /**
   * In the x86-64 computer architecture, long mode is the mode where a 64-bit operating system
   * can access 64-bit instructions and registers.
   * @link https://en.wikipedia.org/wiki/Long_mode
   */
  LONG: {
    BITS: 64,
    MIN: 0x0000000000000000,
    MAX: 0xffffffffffffffffn,
  },
} as const;

/**
 * x86 is a little-endian system. This means that when storing a word in memory,
 * the least significant byte is stored at the lowest address,
 * and the most significant byte is stored at the highest address.
 * @link https://textbook.cs161.org/memory-safety/x86.html#24-little-endian-words
 */
export const IS_LITTLE_ENDIAN = true;

export const ONE_BIT = 2;

export const ONE_BYTE = 8;
export const TWO_BYTE = 16;
export const FOUR_BYTE = 32;

export const X86_CONTROL_SIGNALS = {
  READ: "RD",
  WRITE: "WR",
  MEMORY_IO: "IO/M",
} as const;

export const CPU_BUS = {
  ADDRESS: "ADDRESS",
  DATA: "DATA",
  CONTROL_SIGNALS: {
    X86: X86_CONTROL_SIGNALS,
  },
} as const;
