export const DEFAULT_HARD_DISK_SPEC = {
  HEADS: 4,
  TRACKS_PER_SURFACE: 64,
  SECTORS_PER_TRACK: 128,
  BYTES_PER_SECTOR: 512,
  RPM: 3600,
};

export class HardDisk {
  private _diskBuffer: ArrayBuffer;
  private _diskView: Uint8Array<ArrayBuffer>;
  private _hardDiskSpec: {
    heads: number;
    tracksPerSurface: number;
    sectorsPerTrack: number;
    bytesPerSector: number;
    rpm: number;
  };

  constructor({
    heads,
    tracksPerSurface,
    sectorsPerTrack,
    bytesPerSector,
    rpm,
  }: {
    heads: number;
    tracksPerSurface: number;
    sectorsPerTrack: number;
    bytesPerSector: number;
    rpm: number;
  }) {
    this._hardDiskSpec = {
      heads,
      tracksPerSurface,
      sectorsPerTrack,
      bytesPerSector,
      rpm,
    };

    // Allocate disk memory based on calculated disk capacity
    this._diskBuffer = this.getDiskCapacity({
      heads: this._hardDiskSpec.heads,
      tracksPerSurface: this._hardDiskSpec.tracksPerSurface,
      sectorsPerTrack: this._hardDiskSpec.sectorsPerTrack,
      bytesPerSector: this._hardDiskSpec.bytesPerSector,
    });

    // Create a byte-level view of the disk buffer
    this._diskView = new Uint8Array(this._diskBuffer);
  }

  /**
   * Calculates the total capacity of the hard disk in bytes.
   */
  private getDiskCapacity({
    heads,
    tracksPerSurface,
    sectorsPerTrack,
    bytesPerSector,
  }: {
    heads: number;
    tracksPerSurface: number;
    sectorsPerTrack: number;
    bytesPerSector: number;
  }) {
    return new ArrayBuffer(
      heads * tracksPerSurface * sectorsPerTrack * bytesPerSector
    );
  }

  /**
   * Calculates the average rotational latency in milliseconds.
   * Average rotational latency is half the time of one full rotation.
   */
  private getAverageRotationalLatency() {
    const rps = this._hardDiskSpec.rpm / 60;
    const rotationalLatency = 1 / rps;
    return rotationalLatency / 2;
  }

  /**
   * Simulates the time cost of accessing the hard disk due to rotational latency.
   * Returns a Promise that resolves after the latency duration.
   */
  private async timeCostToOperate(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.getAverageRotationalLatency())
    );
  }

  /**
   * Calculates the byte offset for a specific sector in the disk buffer.
   */
  private getSectorOffect({
    head,
    track,
    sector,
  }: {
    head: number;
    track: number;
    sector: number;
  }): number {
    const sectorsPerSurface =
      this._hardDiskSpec.tracksPerSurface * this._hardDiskSpec.sectorsPerTrack;

    const totalSectorsBefore =
      head * sectorsPerSurface +
      track * this._hardDiskSpec.sectorsPerTrack +
      sector;

    // Convert the sector number into a byte offset
    return totalSectorsBefore * this._hardDiskSpec.bytesPerSector;
  }

  /**
   * Reads data from a specific sector in the hard disk.
   * Simulates rotational latency before returning the data.
   */
  private async readFromSector({
    head,
    track,
    sector,
  }: {
    head: number;
    track: number;
    sector: number;
  }): Promise<Uint8Array> {
    await this.timeCostToOperate(); // Simulate latency

    const offset = this.getSectorOffect({ head, track, sector });

    // Extract and return the data for the specific sector
    return this._diskView.slice(
      offset,
      offset + this._hardDiskSpec.bytesPerSector
    );
  }

  /**
   * Writes data to a specific sector in the hard disk.
   * Simulates rotational latency before performing the operation.
   */
  private async writeToSector({
    head,
    track,
    sector,
    data,
  }: {
    head: number;
    track: number;
    sector: number;
    data: Uint8Array;
  }): Promise<void> {
    await this.timeCostToOperate();

    const offset = this.getSectorOffect({ head, track, sector });

    // Ensure the data fits within the sector size
    if (data.length > this._hardDiskSpec.bytesPerSector) {
      throw new Error("Data exceeds sector size!");
    }

    // Write each byte to the specified sector
    for (let i = 0; i < data.length; i++) {
      this._diskView[offset + i] = data[i];
    }
  }

  /**
   * Decodes an ArrayBuffer to a UTF-8 string.
   */
  static decoder(data: ArrayBuffer): string {
    return new TextDecoder().decode(data);
  }
}
