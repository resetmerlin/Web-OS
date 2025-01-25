import { useEffect, useRef } from "react";
import { DEFAULT_VGA_HARDWARE_SPEC } from "../components/x86/software/constants";
import { vgaHardware } from "../components/x86/software/BIOS";
import { VGAHardware } from "../components/x86/hardware/graphics-card/vga-hardware";

export function useIniateVideoGraphics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawCharacter = (
      ctx: CanvasRenderingContext2D,
      char: string,
      row: number,
      col: number,
      color: string = "black",
      background: string
    ) => {
      ctx.fillStyle = color;
      const x = col * cellWidth + cellWidth / 4;
      const y = row * cellHeight + cellHeight * 0.75;
      ctx.fillText(char, x, y);
      ctx.fillStyle = background;
    };

    const rows = DEFAULT_VGA_HARDWARE_SPEC.ROWS;
    const columns = DEFAULT_VGA_HARDWARE_SPEC.COLUMNS;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const cellWidth = viewportWidth / columns;
    const cellHeight = viewportHeight / rows;

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const { asciiCharacter, colorCode } = vgaHardware.read({
          col: c,
          row: r,
        });
        const colorDefinition = VGAHardware.invertIntoColorCode(colorCode);

        drawCharacter(
          ctx,
          asciiCharacter,
          r,
          c,
          colorDefinition.foreground,
          colorDefinition.background
        );
      }
    }
  }, []);

  return { ref: canvasRef };
}
