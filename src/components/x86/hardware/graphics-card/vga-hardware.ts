type ForegroundColorType = keyof typeof VGAHardware.ForegroundColor;
type BackgroundColorType = keyof typeof VGAHardware.BackgroundColor;
type BlinkType = keyof typeof VGAHardware.Blink;

// TODO: To sends it to utils if it needs
const ASCII_BIT_MASK = 0xff;
const FIRST_ASCII = 0x20;
const LAST_ASCII = 0x7e;

export class VGAHardware {
  static ForegroundColor = {
    black: 0x0,
    blue: 0x1,
    green: 0x2,
    cyan: 0x3,
    red: 0x4,
    magenta: 0x5,
    brown: 0x6,
    lightgray: 0x7,
    darkgray: 0x8,
    lightblue: 0x9,
    lightgreen: 0xa,
    lightcyan: 0xb,
    lightred: 0xc,
    pink: 0xd,
    yellow: 0xe,
    white: 0xf,
  } as const;

  static BackgroundColor = {
    black: 0x0,
    blue: 0x1,
    green: 0x2,
    cyan: 0x3,
    red: 0x4,
    magenta: 0x5,
    brown: 0x6,
    lightgray: 0x7,
  } as const;

  static Blink = {
    off: 0x0,
    on: 0x1,
  } as const;

  static BaseAddress = 0xb8000;

  static BlinkBitPosition = 7;
  static BackgroundColorPosition = [4, 5, 6] as const;
  static ForegroundColorPosition = [0, 1, 2, 3] as const;

  static BlinkBitMask = 0b10000000;
  static BackgroundBitMask = 0b01110000;
  static ForegroundBitMask = 0b00001111;

  /**
   * VGA text buffer cell size is 2byte
   * 1. A character (ASCII code, 1 byte).
   * 2. A color code (foreground, background, and optional blink, 1 byte).
   */
  static CellSize = 2;
  static CellBufferSize = 16;

  private vgaBuffer: Uint16Array;
  private _rows: number;
  private _columns: number;

  constructor({ rows, columns }: { rows: number; columns: number }) {
    this.vgaBuffer = new Uint16Array(
      VGAHardware.calculateVgaBufferSize({ rows, columns }) /
        VGAHardware.CellSize
    );

    this._rows = rows;
    this._columns = columns;
  }

  public getBuffer() {
    return this.vgaBuffer;
  }

  public write({
    col,
    row,
    asciiCharacter,
    colorCode,
  }: {
    col: number;
    row: number;
    asciiCharacter: string;
    colorCode: number;
  }) {
    const ascii = VGAHardware.convertCharIntoASCII(asciiCharacter);

    const index = VGAHardware.convert2dPostionTo1dIndex({
      row,
      col,
      totalColumns: this._columns,
    });

    this.vgaBuffer[index] =
      (colorCode << (VGAHardware.CellBufferSize / 2)) | ascii;
  }

  public read({ row, col }: { row: number; col: number }) {
    if (row >= this._rows || col >= this._columns) {
      throw new Error("Index out of bounds");
    }

    const index = VGAHardware.convert2dPostionTo1dIndex({
      row,
      col,
      totalColumns: this._columns,
    });

    const value = this.vgaBuffer[index];

    return {
      address: VGAHardware.BaseAddress + index * VGAHardware.CellSize,
      asciiCharacter: String.fromCharCode(value & ASCII_BIT_MASK),
      colorCode: (value >> (VGAHardware.CellBufferSize / 2)) & ASCII_BIT_MASK,
    };
  }

  static convertCharIntoASCII(char: string) {
    const ascii = char.charCodeAt(0);
    if (ascii < FIRST_ASCII || ascii > LAST_ASCII) {
      return 0xfe; // Replace with '■' for unsupported characters
    }
    return ascii;
  }

  static calculateVgaBufferSize({
    rows,
    columns,
  }: {
    rows: number;
    columns: number;
  }) {
    return rows * columns * VGAHardware.CellSize;
  }

  static convert2dPostionTo1dIndex({
    row,
    col,
    totalColumns,
  }: {
    row: number;
    col: number;
    totalColumns: number;
  }) {
    return row * totalColumns + col;
  }

  static convertIntoColorCode({
    foreground,
    background,
    blink = "off",
  }: {
    foreground: ForegroundColorType;
    background: BackgroundColorType;
    blink?: BlinkType;
  }) {
    return (
      (VGAHardware.Blink[blink] << VGAHardware.BlinkBitPosition) |
      (VGAHardware.BackgroundColor[background] <<
        VGAHardware.BackgroundColorPosition[0]) |
      (VGAHardware.ForegroundColor[foreground] <<
        VGAHardware.ForegroundColorPosition[0])
    );
  }

  static invertIntoColorCode(colorCode: number) {
    // Extract blink bit (bit 7)
    const blink =
      (colorCode & VGAHardware.BlinkBitMask) >> VGAHardware.BlinkBitPosition;

    // Extract background color bits (bits 4-6)
    const background =
      (colorCode & VGAHardware.BackgroundBitMask) >>
      VGAHardware.BackgroundColorPosition[0];

    // Extract foreground color bits (bits 0-3)
    const foreground =
      (colorCode & VGAHardware.ForegroundBitMask) >>
      VGAHardware.ForegroundColorPosition[0];

    const blinkName = Object.keys(VGAHardware.Blink).find(
      (key) => VGAHardware.Blink[key as BlinkType] === blink
    ) as BlinkType;

    const backgroundName = Object.keys(VGAHardware.BackgroundColor).find(
      (key) =>
        VGAHardware.BackgroundColor[key as BackgroundColorType] === background
    ) as BackgroundColorType;

    const foregroundName = Object.keys(VGAHardware.ForegroundColor).find(
      (key) =>
        VGAHardware.ForegroundColor[key as ForegroundColorType] === foreground
    ) as ForegroundColorType;

    return {
      blink: blinkName,
      background: backgroundName,
      foreground: foregroundName,
    };
  }
}
