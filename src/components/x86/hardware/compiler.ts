import basex from "base-x";
import { Buffer } from "buffer";
import { convertToHex } from "./utils";

const BASE = {
  8: "01234567",
  16: "0123456789abcdef",
  32: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
} as const;

export function compile({
  value,
  wordSize,
}: {
  value: string;
  wordSize: keyof typeof BASE;
}) {
  const encodedHex = basex(BASE[wordSize]).encode(Buffer.from(value));

  return BigInt(`0x${encodedHex}`);
}

export function decompile({
  value,
  wordSize,
}: {
  value: bigint;
  wordSize: keyof typeof BASE;
}) {
  const hexString = convertToHex(value);

  return Buffer.from(basex(BASE[wordSize]).decode(hexString)).toString();
}
