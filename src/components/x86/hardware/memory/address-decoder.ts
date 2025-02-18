import { BinaryType } from "../types";
import { generateTruthTable, LOGIC_GATE } from "../logicGates";

/**
 * A decoder is a digital circuit that takes an N-bit binary input and activates exactly one of 2^N outputs.
 * If there are 3 address lines (A2, A1, A0), there are 8 possible input combinations (2^3 = 8).
 * or each unique combination, only one output is 1, while all others remain 0.
 */
export class FullAddressDecoding {
  private _numberOfChips: number;
  private _chipSelectBits: number;
  private decodedLists: BinaryType[];

  constructor({
    numberOfChips,
    chipSelectBits,
  }: {
    numberOfChips: number;
    chipSelectBits: number;
  }) {
    this._numberOfChips = numberOfChips;
    this._chipSelectBits = chipSelectBits;
    this.decodedLists = this.decoder() ?? [];
  }

  public getChipSelectionValue(value: number) {
    if (value < 0 || value >= this.decodedLists.length) {
      throw new Error("Target chip was not selected based on the input value");
    }

    return this.decodedLists[value] === 1 ? value : null;
  }

  private decoder() {
    const table = generateTruthTable(this._chipSelectBits);
    const decodedValues: BinaryType[] = new Array(this._numberOfChips).fill(0);

    table.forEach((inputs, index) => {
      const invertedInputs = inputs.map((bit) => LOGIC_GATE.NOT(bit));

      const andInputs = inputs.map((bit, i) => (bit ? bit : invertedInputs[i]));

      decodedValues[index] = LOGIC_GATE.CASCADE_AND(andInputs);
    });

    return decodedValues;
  }
}
