import { VGAHardware } from "../hardware/graphics-card/vga-hardware";
import { HardDisk } from "../hardware/hard-disk";
import { DEFAULT_HARD_DISK_SPEC, DEFAULT_VGA_HARDWARE_SPEC } from "./constants";

export const hardDisk = new HardDisk({
  heads: DEFAULT_HARD_DISK_SPEC.HEADS,
  tracksPerSurface: DEFAULT_HARD_DISK_SPEC.TRACKS_PER_SURFACE,
  sectorsPerTrack: DEFAULT_HARD_DISK_SPEC.SECTORS_PER_TRACK,
  bytesPerSector: DEFAULT_HARD_DISK_SPEC.BYTES_PER_SECTOR,
  rpm: DEFAULT_HARD_DISK_SPEC.RPM,
});

export const vgaHardware = new VGAHardware({
  rows: DEFAULT_VGA_HARDWARE_SPEC.ROWS,
  columns: DEFAULT_VGA_HARDWARE_SPEC.COLUMNS,
});
