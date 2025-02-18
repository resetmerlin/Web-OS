import { BinaryType } from "./types";
import {
  coordinateBinaryLength,
  convertToBinary,
  getNumberOfBinaryValues,
} from "./utils";

export const LOGIC_GATE = {
  NOT(input: BinaryType) {
    if (input === 0) {
      return 1;
    }

    return 0 as BinaryType;
  },

  AND(a: BinaryType, b: BinaryType) {
    if (a === 1) {
      if (b === 1) {
        return 1;
      }
    }

    return 0 as BinaryType;
  },

  OR(a: BinaryType, b: BinaryType) {
    if (a === 1) {
      return 1;
    }

    if (b === 1) {
      return 1;
    }

    return 0 as BinaryType;
  },

  CASCADE_AND(inputs: BinaryType[]) {
    if (inputs.length < 2) {
      throw new Error("AND operation requires at least two inputs");
    }

    let result = LOGIC_GATE.AND(inputs[0], inputs[1]);

    for (let i = 2; i < inputs.length; i++) {
      result = LOGIC_GATE.AND(result, inputs[i]);
    }

    return result;
  },
};

export function generateTruthTable(numInputs: number) {
  const rows = getNumberOfBinaryValues(numInputs);

  const table: BinaryType[][] = [];

  for (let i = 0; i < rows; i++) {
    const binaryValue = convertToBinary(i);

    const fixedBinaryValue = coordinateBinaryLength(binaryValue, numInputs);

    const binaryLists = fixedBinaryValue
      .split("")
      .map((val) => (val === "0" ? 0 : 1));

    table.push([...binaryLists]);
  }

  return table;
}
