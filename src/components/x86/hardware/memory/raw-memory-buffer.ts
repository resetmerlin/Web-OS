import { IS_LITTLE_ENDIAN } from "../constants";

export class RawMemoryBuffer extends DataView<ArrayBuffer> {
  private byteUnit: number;

  constructor({ wordSize, buffer }: { wordSize: number; buffer: ArrayBuffer }) {
    super(buffer);
    this.byteUnit = wordSize;
  }

  public storeValue({ address, value }: { address: number; value: bigint }) {
    switch (this.byteUnit) {
      case 1:
        super.setUint8(address, Number(value));
        break;
      case 2:
        super.setUint16(address, Number(value));
        break;
      case 4:
        super.setUint32(address, Number(value));
        break;
    }
  }

  public getValue(address: number) {
    switch (this.byteUnit) {
      case 1:
        return BigInt(super.getUint8(address));
      case 2:
        return BigInt(super.getUint16(address, IS_LITTLE_ENDIAN));
      case 4:
        return BigInt(super.getUint32(address, IS_LITTLE_ENDIAN));
    }
  }
}
