type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

export class Buffer extends Uint8Array {
  static poolSize: number

  compare(
    target: Buffer,
    targetStart?: number,
    targetEnd?: number,
    sourceStart?: number,
    sourceEnd?: number
  ): number

  copy(
    target: Buffer,
    targetStart?: number,
    sourceStart?: number,
    sourceEnd?: number
  ): number

  equals(target: Buffer): boolean

  fill(
    value: Buffer | string | number | boolean,
    offset?: number,
    end?: number,
    encoding?: string
  ): Buffer

  includes(
    value: Buffer | string | number,
    offset?: number,
    enconding?: string
  ): boolean

  indexOf(
    value: Buffer | string | number,
    offset?: number,
    encoding?: string
  ): number

  lastIndexOf(
    value: Buffer | string | number,
    offset?: number,
    encoding?: string
  ): number

  swap16(): Buffer
  swap32(): Buffer
  swap64(): Buffer

  readDoubleBE(offset?: number): number
  readDoubleLE(offset?: number): number

  readFloatBE(offset?: number): number
  readFloatLE(offset?: number): number

  readInt8(offset?: number): number

  readInt16BE(offset?: number): number
  readInt16LE(offset?: number): number

  readInt32BE(offset?: number): number
  readInt32LE(offset?: number): number

  readBigInt64BE(offset?: number): bigint
  readBigInt64LE(offset?: number): bigint

  readUInt8(offset?: number): number
  readUint8(offset?: number): number

  readUInt16BE(offset?: number): number
  readUint16BE(offset?: number): number
  readUInt16LE(offset?: number): number
  readUint16LE(offset?: number): number

  readUInt32BE(offset?: number): number
  readUint32BE(offset?: number): number
  readUInt32LE(offset?: number): number
  readUint32LE(offset?: number): number

  readBigUInt64BE(offset?: number): bigint
  readBigUint64BE(offset?: number): bigint
  readBigUInt64LE(offset?: number): bigint
  readBigUint64LE(offset?: number): bigint

  write(
    string: string,
    offset?: number,
    length?: number,
    encoding?: string
  ): number

  writeDoubleBE(value: number, offset?: number): number
  writeDoubleLE(value: number, offset?: number): number

  writeFloatBE(value: number, offset?: number): number
  writeFloatLE(value: number, offset?: number): number

  writeInt8(value: number, offset?: number): number

  writeInt16BE(value: number, offset?: number): number
  writeInt16LE(value: number, offset?: number): number

  writeInt32BE(value: number, offset?: number): number
  writeInt32LE(value: number, offset?: number): number

  writeBigInt64BE(value: bigint, offset?: number): number
  writeBigInt64LE(value: bigint, offset?: number): number

  writeUInt8(value: number, offset?: number): number
  writeUint8(value: number, offset?: number): number

  writeUInt16BE(value: number, offset?: number): number
  writeUint16BE(value: number, offset?: number): number
  writeUInt16LE(value: number, offset?: number): number
  writeUint16LE(value: number, offset?: number): number

  writeUInt32BE(value: number, offset?: number): number
  writeUint32BE(value: number, offset?: number): number
  writeUInt32LE(value: number, offset?: number): number
  writeUint32LE(value: number, offset?: number): number

  writeBigUint64BE(value: bigint, offset?: number): number
  writeBigUInt64BE(value: bigint, offset?: number): number
  writeBigUint64LE(value: bigint, offset?: number): number
  writeBigUInt64LE(value: bigint, offset?: number): number

  toString(encoding?: string, start?: number, end?: number): void
}

export function isBuffer(value: any): boolean

export function isEncoding(encoding: string): boolean

export function alloc(
  size: number,
  fill?: Buffer | string | number | boolean,
  encoding?: string
): Buffer

export function allocUnsafe(size: number): Buffer

export function allocUnsafeSlow(size: number): Buffer

export function byteLength(
  string:
    | Buffer
    | TypedArray
    | DataView
    | ArrayBuffer
    | SharedArrayBuffer
    | string,
  encoding?: string
): number

export function compare(a: Buffer, b: Buffer): number

export function concat(buffers: Buffer[], length?: number): Buffer

export function coerce(buffer: Buffer): Buffer

export function from(buffer: Buffer | TypedArray | DataView | number[]): Buffer
export function from(string: string, encoding?: string): Buffer
export function from(
  arrayBuffer: ArrayBuffer | SharedArrayBuffer,
  offset?: number,
  length?: number
): Buffer

export const constants: { MAX_LENGTH: number; MAX_STRING_LENGTH: number }

export = Buffer
