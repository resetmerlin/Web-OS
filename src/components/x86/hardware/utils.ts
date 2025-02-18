import { ONE_BIT, ONE_BYTE } from "./constants";

export function mergeInto16bits(arr1: Uint8Array, arr2: Uint8Array) {
  const totalLength = arr1.length + arr2.length;

  const mergedUint8Array = new Uint8Array(totalLength);

  mergedUint8Array.set(arr1, 0);

  mergedUint8Array.set(arr2, arr1.length);

  if (totalLength % 2 !== 0) {
    throw new Error(
      "The total length of the merged Uint8Arrays must be even to form a valid Uint16Array."
    );
  }

  return new Uint16Array(mergedUint8Array.buffer);
}

export function convertToHex(val: number | bigint) {
  return val.toString(16);
}

export function convertToBinary(val: number | bigint) {
  return val.toString(ONE_BIT);
}

export function getNumberOfBinaryValues(inputs: number) {
  return Math.pow(ONE_BIT, inputs);
}

export function coordinateBinaryLength(val: string, length: number) {
  return val.padStart(length, "0");
}

export function convertBitToByte(val: number) {
  return val / ONE_BYTE;
}

export function convertByteToBit(val: number) {
  return val * ONE_BYTE;
}

export function makeBuffer(size: number, currForamt: "bit" | "byte" = "byte") {
  if (currForamt === "bit") {
    return new ArrayBuffer(convertBitToByte(size));
  }

  return new ArrayBuffer(size);
}
