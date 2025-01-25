import { VGAHardware } from "../hardware/graphics-card/vga-hardware";
import { vgaHardware } from "./BIOS";
import { DEFAULT_VGA_HARDWARE_SPEC } from "./constants";

export function printlf(str: string) {
  let _columnPosition = 0;
  let _rowPosition = 0;

  const colorCode = VGAHardware.convertIntoColorCode({
    foreground: "white",
    background: "black",
  });

  for (let index = 0; index < str.length; index++) {
    writeString({ char: str[index] });
  }

  function writeString({ char }: { char: string }) {
    if (char == "\n") {
      newLine();
      return;
    }

    if (_columnPosition >= DEFAULT_VGA_HARDWARE_SPEC.COLUMNS) {
      return;
    }

    vgaHardware.write({
      row: _rowPosition,
      col: _columnPosition,
      asciiCharacter: char,
      colorCode,
    });

    _columnPosition += 1;
  }

  function newLine() {
    clearRow({ row: _rowPosition, col: _columnPosition });

    _columnPosition = 0;
    _rowPosition += 1;
  }

  function clearRow({ row, col = 0 }: { row: number; col: number }) {
    const blank = { asciiCharacter: " ", colorCode } as const;

    for (let c = col; c < DEFAULT_VGA_HARDWARE_SPEC.COLUMNS; c++) {
      vgaHardware.write({
        row,
        col: c,
        asciiCharacter: blank.asciiCharacter,
        colorCode: blank.colorCode,
      });
    }
  }
}
