const constants = require('./lib/constants')
const ascii = require('./lib/ascii')
const base64 = require('./lib/base64')
const base64url = require('./lib/base64url')
const hex = require('./lib/hex')
const utf8 = require('./lib/utf8')
const utf16le = require('./lib/utf16le')
const latin1 = require('./lib/latin1')
const binding = require('./binding')

const kind = Symbol.for('bare.buffer.kind')

const SWAP_MIN_LENGTH = 128

let poolSize = 65536
let pool = null
let poolLength = 0
let poolOffset = 0

class Buffer extends Uint8Array {
  static get [kind]() {
    return 0 // Compatibility version
  }

  static get poolSize() {
    return poolSize
  }

  static set poolSize(value) {
    poolSize = Math.max(0, value)
  }

  constructor(arrayBuffer, offset, length, opts = {}) {
    if (typeof arrayBuffer === 'number') {
      opts = offset || {}

      const { uninitialized = false } = opts

      offset = 0
      length = arrayBuffer

      if (Number.isNaN(length) || length < 0 || length > constants.MAX_LENGTH) {
        throw new RangeError(`Buffer length must be between 0 and ${constants.MAX_LENGTH}`)
      }

      arrayBuffer = uninitialized ? binding.allocUnsafe(length) : binding.alloc(length)
    } else {
      if (length > constants.MAX_LENGTH) {
        throw new RangeError(`Buffer length must be at most ${constants.MAX_LENGTH}`)
      }

      if (typeof offset === 'object' && offset !== null) {
        opts = offset
        offset = 0
        length = arrayBuffer.byteLength
      } else if (typeof length === 'object' && length !== null) {
        opts = length
        length = arrayBuffer.byteLength - offset
      }
    }

    super(arrayBuffer, offset, length)
  }

  get [kind]() {
    return Buffer[kind]
  }

  copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.byteLength) {
    const source = this

    if (targetStart < 0) targetStart = 0
    if (targetStart >= target.byteLength) return 0

    const targetLength = target.byteLength - targetStart

    if (sourceStart < 0) sourceStart = 0
    if (sourceStart >= source.byteLength) return 0

    if (sourceEnd <= sourceStart) return 0
    if (sourceEnd > source.byteLength) sourceEnd = source.byteLength

    if (sourceEnd - sourceStart > targetLength) {
      sourceEnd = sourceStart + targetLength
    }

    const sourceLength = sourceEnd - sourceStart

    if (source === target) {
      target.copyWithin(targetStart, sourceStart, sourceEnd)
    } else if (sourceStart === 0 && sourceEnd === source.byteLength) {
      target.set(source, targetStart)
    } else {
      target.set(
        new Uint8Array(source.buffer, source.byteOffset + sourceStart, sourceLength),
        targetStart
      )
    }

    return sourceLength
  }

  equals(target) {
    const source = this

    if (source === target) return true
    if (source.byteLength !== target.byteLength) return false

    return (
      binding.compare(
        source.buffer,
        source.byteOffset,
        source.byteLength,
        target.buffer,
        target.byteOffset,
        target.byteLength
      ) === 0
    )
  }

  compare(
    target,
    targetStart = 0,
    targetEnd = target.byteLength,
    sourceStart = 0,
    sourceEnd = this.byteLength
  ) {
    const source = this

    if (source === target) return 0

    if (arguments.length === 1) {
      targetStart = 0
      targetEnd = target.byteLength
      sourceStart = 0
      sourceEnd = source.byteLength
    } else {
      if (targetStart < 0) targetStart = 0
      if (targetStart > target.byteLength) targetStart = target.byteLength

      if (targetEnd < targetStart) targetEnd = targetStart
      if (targetEnd > target.byteLength) targetEnd = target.byteLength

      if (sourceStart < 0) sourceStart = 0
      if (sourceStart > source.byteLength) sourceStart = source.byteLength

      if (sourceEnd < sourceStart) sourceEnd = sourceStart
      if (sourceEnd > source.byteLength) sourceEnd = source.byteLength
    }

    return binding.compare(
      source.buffer,
      source.byteOffset + sourceStart,
      sourceEnd - sourceStart,
      target.buffer,
      target.byteOffset + targetStart,
      targetEnd - targetStart
    )
  }

  fill(value, offset = 0, end = this.byteLength, encoding = 'utf8') {
    if (typeof value === 'string') {
      if (typeof offset === 'string') {
        // fill(string, encoding)
        encoding = offset
        offset = 0
        end = this.byteLength
      } else if (typeof end === 'string') {
        // fill(string, offset, encoding)
        encoding = end
        end = this.byteLength
      }
    } else if (typeof value === 'number') {
      value = value & 0xff
    } else if (typeof value === 'boolean') {
      value = +value
    }

    if (offset < 0) offset = 0
    if (offset >= this.byteLength) return this

    if (end <= offset) return this
    if (end > this.byteLength) end = this.byteLength

    if (typeof value === 'number') return super.fill(value, offset, end)

    if (typeof value === 'string') value = exports.from(value, encoding)

    const length = value.byteLength

    if (length === 0) return super.fill(0, offset, end)
    if (length === 1) return super.fill(value[0], offset, end)

    return fillPattern(this, value, length, offset, end)
  }

  includes(value, offset, encoding) {
    return this.indexOf(value, offset, encoding) !== -1
  }

  indexOf(value, offset = 0, encoding) {
    if (typeof value === 'boolean') value = +value

    if (typeof value === 'number') {
      return super.indexOf(value & 0xff, offset)
    }

    return bidirectionalIndexOf(this, value, offset, encoding, true /* first */)
  }

  lastIndexOf(value, offset = this.byteLength - 1, encoding) {
    if (typeof value === 'boolean') value = +value

    if (typeof value === 'number') {
      return super.lastIndexOf(value & 0xff, offset)
    }

    return bidirectionalIndexOf(this, value, offset, encoding, false /* last */)
  }

  swap16() {
    const length = this.byteLength

    if (length % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }

    if (length < SWAP_MIN_LENGTH) {
      for (let i = 0; i < length; i += 2) swap(this, i, i + 1)
    } else {
      binding.swap16(this.buffer, this.byteOffset, length)
    }

    return this
  }

  swap32() {
    const length = this.byteLength

    if (length % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }

    if (length < SWAP_MIN_LENGTH) {
      for (let i = 0; i < length; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
    } else {
      binding.swap32(this.buffer, this.byteOffset, length)
    }

    return this
  }

  swap64() {
    const length = this.byteLength

    if (length % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }

    if (length < SWAP_MIN_LENGTH) {
      for (let i = 0; i < length; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
    } else {
      binding.swap64(this.buffer, this.byteOffset, length)
    }

    return this
  }

  toString(encoding = 'utf8', start = 0, end = this.byteLength) {
    // toString()
    if (arguments.length === 0) return utf8.toString(this)

    // toString(encoding)
    if (arguments.length === 1) return codecFor(encoding).toString(this)

    if (start < 0) start = 0
    if (start >= this.byteLength) return ''

    if (end <= start) return ''
    if (end > this.byteLength) end = this.byteLength

    return codecFor(encoding).toString(this, start, end)
  }

  toJSON() {
    const length = this.byteLength
    const data = new Array(length)

    for (let i = 0; i < length; i++) data[i] = this[i]

    return data
  }

  write(string, offset = 0, length = this.byteLength - offset, encoding = 'utf8') {
    // write(string)
    if (arguments.length === 1) return utf8.write(this, string)

    if (typeof offset === 'string') {
      // write(string, encoding)
      encoding = offset
      offset = 0
      length = this.byteLength
    } else if (typeof length === 'string') {
      // write(string, offset, encoding)
      encoding = length
      length = this.byteLength - offset
    }

    length = Math.min(length, exports.byteLength(string, encoding))

    let start = offset
    if (start < 0) start = 0
    if (start >= this.byteLength) return 0

    let end = offset + length
    if (end <= start) return 0
    if (end > this.byteLength) end = this.byteLength

    return codecFor(encoding).write(this, string, start, end)
  }

  readBigInt64BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getBigInt64(offset, false)
  }
  readBigInt64LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getBigInt64(offset, true)
  }

  readBigUint64BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getBigUint64(offset, false)
  }
  readBigUint64LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getBigUint64(offset, true)
  }

  readDoubleBE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getFloat64(offset, false)
  }
  readDoubleLE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getFloat64(offset, true)
  }

  readFloatBE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getFloat32(offset, false)
  }
  readFloatLE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    return viewOf(this).getFloat32(offset, true)
  }

  readInt8(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const value = this[offset]
    if (value === undefined) boundsError()
    return (value << 24) >> 24
  }

  readInt16BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 1]
    if (first === undefined || last === undefined) boundsError()
    return (((first << 8) | last) << 16) >> 16
  }
  readInt16LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 1]
    if (first === undefined || last === undefined) boundsError()
    return (((last << 8) | first) << 16) >> 16
  }

  readInt32BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 3]
    if (first === undefined || last === undefined) boundsError()
    return (first << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | last
  }
  readInt32LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 3]
    if (first === undefined || last === undefined) boundsError()
    return first | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (last << 24)
  }

  readIntBE(offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return readInt48BE(this, offset)
    if (byteLength === 5) return readInt40BE(this, offset)
    if (byteLength === 3) return readInt24BE(this, offset)
    if (byteLength === 4) return this.readInt32BE(offset)
    if (byteLength === 2) return this.readInt16BE(offset)
    if (byteLength === 1) return this.readInt8(offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  readIntLE(offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return readInt48LE(this, offset)
    if (byteLength === 5) return readInt40LE(this, offset)
    if (byteLength === 3) return readInt24LE(this, offset)
    if (byteLength === 4) return this.readInt32LE(offset)
    if (byteLength === 2) return this.readInt16LE(offset)
    if (byteLength === 1) return this.readInt8(offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  readUint8(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const value = this[offset]
    if (value === undefined) boundsError()
    return value
  }

  readUint16BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 1]
    if (first === undefined || last === undefined) boundsError()
    return (first << 8) | last
  }
  readUint16LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 1]
    if (first === undefined || last === undefined) boundsError()
    return (last << 8) | first
  }

  readUint32BE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 3]
    if (first === undefined || last === undefined) boundsError()
    return first * 0x1000000 + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | last)
  }
  readUint32LE(offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    const first = this[offset]
    const last = this[offset + 3]
    if (first === undefined || last === undefined) boundsError()
    return last * 0x1000000 + ((this[offset + 2] << 16) | (this[offset + 1] << 8) | first)
  }

  readUintBE(offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return readUint48BE(this, offset)
    if (byteLength === 5) return readUint40BE(this, offset)
    if (byteLength === 3) return readUint24BE(this, offset)
    if (byteLength === 4) return this.readUint32BE(offset)
    if (byteLength === 2) return this.readUint16BE(offset)
    if (byteLength === 1) return this.readUint8(offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  readUintLE(offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return readUint48LE(this, offset)
    if (byteLength === 5) return readUint40LE(this, offset)
    if (byteLength === 3) return readUint24LE(this, offset)
    if (byteLength === 4) return this.readUint32LE(offset)
    if (byteLength === 2) return this.readUint16LE(offset)
    if (byteLength === 1) return this.readUint8(offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  writeBigInt64BE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setBigInt64(offset, value, false)
    return offset + 8
  }
  writeBigInt64LE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setBigInt64(offset, value, true)
    return offset + 8
  }

  writeBigUint64BE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setBigUint64(offset, value, false)
    return offset + 8
  }
  writeBigUint64LE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setBigUint64(offset, value, true)
    return offset + 8
  }

  writeDoubleBE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setFloat64(offset, value, false)
    return offset + 8
  }
  writeDoubleLE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setFloat64(offset, value, true)
    return offset + 8
  }

  writeFloatBE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setFloat32(offset, value, false)
    return offset + 4
  }
  writeFloatLE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    viewOf(this).setFloat32(offset, value, true)
    return offset + 4
  }

  writeInt8(value, offset = 0) {
    return this.writeUint8(value, offset)
  }

  writeInt16BE(value, offset = 0) {
    return this.writeUint16BE(value, offset)
  }
  writeInt16LE(value, offset = 0) {
    return this.writeUint16LE(value, offset)
  }

  writeInt32BE(value, offset = 0) {
    return this.writeUint32BE(value, offset)
  }
  writeInt32LE(value, offset = 0) {
    return this.writeUint32LE(value, offset)
  }

  writeIntBE(value, offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return writeInt48BE(this, value, offset)
    if (byteLength === 5) return writeInt40BE(this, value, offset)
    if (byteLength === 3) return writeInt24BE(this, value, offset)
    if (byteLength === 4) return this.writeInt32BE(value, offset)
    if (byteLength === 2) return this.writeInt16BE(value, offset)
    if (byteLength === 1) return this.writeInt8(value, offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  writeIntLE(value, offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return writeInt48LE(this, value, offset)
    if (byteLength === 5) return writeInt40LE(this, value, offset)
    if (byteLength === 3) return writeInt24LE(this, value, offset)
    if (byteLength === 4) return this.writeInt32LE(value, offset)
    if (byteLength === 2) return this.writeInt16LE(value, offset)
    if (byteLength === 1) return this.writeInt8(value, offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  writeUint8(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (this[offset] === undefined) boundsError()
    this[offset] = value
    return offset + 1
  }

  writeUint16BE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (this[offset] === undefined || this[offset + 1] === undefined) boundsError()
    this[offset] = value >>> 8
    this[offset + 1] = value
    return offset + 2
  }
  writeUint16LE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (this[offset] === undefined || this[offset + 1] === undefined) boundsError()
    this[offset] = value
    this[offset + 1] = value >>> 8
    return offset + 2
  }

  writeUint32LE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (this[offset] === undefined || this[offset + 3] === undefined) boundsError()
    this[offset] = value
    this[offset + 1] = value >>> 8
    this[offset + 2] = value >>> 16
    this[offset + 3] = value >>> 24
    return offset + 4
  }
  writeUint32BE(value, offset = 0) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (this[offset] === undefined || this[offset + 3] === undefined) boundsError()
    this[offset] = value >>> 24
    this[offset + 1] = value >>> 16
    this[offset + 2] = value >>> 8
    this[offset + 3] = value
    return offset + 4
  }

  writeUintBE(value, offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return writeUint48BE(this, value, offset)
    if (byteLength === 5) return writeUint40BE(this, value, offset)
    if (byteLength === 3) return writeUint24BE(this, value, offset)
    if (byteLength === 4) return this.writeUint32BE(value, offset)
    if (byteLength === 2) return this.writeUint16BE(value, offset)
    if (byteLength === 1) return this.writeUint8(value, offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }

  writeUintLE(value, offset, byteLength) {
    if (!Number.isInteger(offset)) offsetError(offset)
    if (byteLength === 6) return writeUint48LE(this, value, offset)
    if (byteLength === 5) return writeUint40LE(this, value, offset)
    if (byteLength === 3) return writeUint24LE(this, value, offset)
    if (byteLength === 4) return this.writeUint32LE(value, offset)
    if (byteLength === 2) return this.writeUint16LE(value, offset)
    if (byteLength === 1) return this.writeUint8(value, offset)
    throw new RangeError(`Byte length must be between 1 and 6`)
  }
}

for (const [alias, name] of [
  ['readBigUInt64BE', 'readBigUint64BE'],
  ['readBigUInt64LE', 'readBigUint64LE'],
  ['readUInt8', 'readUint8'],
  ['readUInt16BE', 'readUint16BE'],
  ['readUInt16LE', 'readUint16LE'],
  ['readUInt32BE', 'readUint32BE'],
  ['readUInt32LE', 'readUint32LE'],
  ['readUIntBE', 'readUintBE'],
  ['readUIntLE', 'readUintLE'],
  ['writeBigUInt64BE', 'writeBigUint64BE'],
  ['writeBigUInt64LE', 'writeBigUint64LE'],
  ['writeUInt8', 'writeUint8'],
  ['writeUInt16BE', 'writeUint16BE'],
  ['writeUInt16LE', 'writeUint16LE'],
  ['writeUInt32BE', 'writeUint32BE'],
  ['writeUInt32LE', 'writeUint32LE'],
  ['writeUIntBE', 'writeUintBE'],
  ['writeUIntLE', 'writeUintLE']
]) {
  Object.defineProperty(Buffer.prototype, alias, {
    value: Buffer.prototype[name],
    writable: true,
    configurable: true
  })
}

module.exports = exports = Buffer

exports.Buffer = Buffer // For Node.js compatibility

exports.constants = constants

const codecs = Object.create(null)

codecs.ascii = ascii
codecs.base64 = base64
codecs.base64url = base64url
codecs.hex = hex
codecs.utf8 = codecs['utf-8'] = utf8
codecs.utf16le = codecs.ucs2 = codecs['utf-16le'] = codecs['ucs-2'] = utf16le
codecs.latin1 = codecs.binary = latin1

function codecFor(encoding) {
  if (encoding === undefined) return utf8

  let codec = codecs[encoding]
  if (codec !== undefined) return codec

  codec = codecs[encoding.toLowerCase()]
  if (codec !== undefined) return codec

  throw new Error(`Unknown encoding '${encoding}'`)
}

const views = new WeakMap()

function viewOf(buffer) {
  let view = views.get(buffer)
  if (view === undefined) {
    view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    views.set(buffer, view)
  }
  return view
}

exports.isBuffer = function isBuffer(value) {
  if (value instanceof Buffer) return true

  return typeof value === 'object' && value !== null && value[kind] === Buffer[kind]
}

exports.isEncoding = function isEncoding(encoding) {
  try {
    codecFor(encoding)
    return true
  } catch {
    return false
  }
}

exports.isASCII = function isASCII(buffer) {
  return ascii.validate(buffer)
}

// for Node.js compatibily
exports.isAscii = exports.isASCII

exports.isUTF8 = function isUTF8(buffer) {
  return utf8.validate(buffer)
}

// for Node.js compatibility
exports.isUtf8 = exports.isUTF8

exports.alloc = function alloc(size, fill, encoding) {
  if (fill !== undefined && fill !== 0) {
    const buffer = new Buffer(size, { uninitialized: true })

    return buffer.fill(fill, 0, buffer.byteLength, encoding)
  }

  return new Buffer(size)
}

exports.allocUnsafe = function allocUnsafe(size) {
  return allocate(size)
}

exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  return new Buffer(size, { uninitialized: true })
}

exports.byteLength = function byteLength(string, encoding) {
  if (typeof string === 'string') {
    return codecFor(encoding).byteLength(string)
  }

  return string.byteLength
}

exports.compare = function compare(a, b) {
  return binding.compare(a.buffer, a.byteOffset, a.byteLength, b.buffer, b.byteOffset, b.byteLength)
}

exports.concat = function concat(buffers, length) {
  const n = buffers.length

  if (length === undefined) {
    length = 0
    for (let i = 0; i < n; i++) length += buffers[i].byteLength
  }

  const result = allocate(length)

  let offset = 0

  for (let i = 0; i < n; i++) {
    const buffer = buffers[i]

    if (offset + buffer.byteLength > length) {
      result.set(new Uint8Array(buffer.buffer, buffer.byteOffset, length - offset), offset)
      return result
    }

    result.set(buffer, offset)
    offset += buffer.byteLength
  }

  // Only the bytes the inputs did not reach need initializing.
  if (offset < length) result.fill(0, offset, length)

  return result
}

exports.coerce = function coerce(buffer) {
  if (exports.isBuffer(buffer)) return buffer
  return new Buffer(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

exports.copyBytesFrom = function copyBytesFrom(view, offset = 0, length = view.length - offset) {
  if (offset + length > view.length) {
    throw new RangeError('View length is out of range')
  }

  if (offset !== 0 || length !== view.length) {
    view = view.subarray(offset, offset + length)
  }

  return new Buffer(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength))
}

exports.from = function from(value, encodingOrOffset, length) {
  // from(string, encoding)
  if (typeof value === 'string') return fromString(value, encodingOrOffset)

  // from(array)
  if (Array.isArray(value)) return fromArray(value)

  // from(buffer)
  if (ArrayBuffer.isView(value)) return fromBuffer(value)

  // from(arrayBuffer[, offset[, length]])
  return fromArrayBuffer(value, encodingOrOffset, length)
}

function fromString(string, encoding) {
  const codec = codecFor(encoding)
  const length = codec.byteLength(string)
  const buffer = allocate(length)
  const written = codec.write(buffer, string, 0, length)

  // Some codecs only know an upper bound before encoding, and the remainder is
  // uninitialized rather than zeroed.
  if (written < length) return buffer.subarray(0, written)

  return buffer
}

function fromArray(array) {
  const buffer = allocate(array.length)
  buffer.set(array)
  return buffer
}

function fromBuffer(buffer) {
  const copy = allocate(buffer.byteLength)
  copy.set(buffer)
  return copy
}

function fromArrayBuffer(arrayBuffer, offset, length) {
  return new Buffer(arrayBuffer, offset, length)
}

function bidirectionalIndexOf(buffer, value, offset, encoding, first) {
  if (buffer.byteLength === 0) return -1

  if (typeof offset === 'string') {
    encoding = offset
    offset = 0
  } else if (offset === undefined) {
    offset = first ? 0 : buffer.byteLength - 1
  } else if (offset < 0) {
    offset += buffer.byteLength
  }

  if (offset >= buffer.byteLength) {
    if (first) return -1
    else offset = buffer.byteLength - 1
  } else if (offset < 0) {
    if (first) offset = 0
    else return -1
  }

  if (typeof value === 'string') value = exports.from(value, encoding)

  const needleLength = value.byteLength

  if (needleLength === 0) return -1

  const length = buffer.byteLength
  const last = length - needleLength

  if (first) {
    if (offset > last) return -1
  } else {
    if (offset > last) offset = last
    if (offset < 0) return -1
  }

  // Confirming a match at the position the search starts from costs a handful
  // of comparisons, and keeps prefix checks off the native path entirely.
  let j = 0
  while (j < needleLength && buffer[offset + j] === value[j]) j++
  if (j === needleLength) return offset

  if (first) {
    if (offset === last) return -1

    return binding.indexOf(
      buffer.buffer,
      buffer.byteOffset,
      length,
      value.buffer,
      value.byteOffset,
      needleLength,
      offset + 1
    )
  }

  if (offset === 0) return -1

  return binding.lastIndexOf(
    buffer.buffer,
    buffer.byteOffset,
    length,
    value.buffer,
    value.byteOffset,
    needleLength,
    offset - 1
  )
}

// Writes the pattern once and then repeatedly doubles it in place, so the byte
// wise work is proportional to the pattern rather than to the range. Each block
// copied is a whole number of periods, which keeps the pattern aligned.
function fillPattern(buffer, value, length, offset, end) {
  const n = end - offset

  // Below this the copies cost more than they save.
  if (n < 64) {
    for (let i = 0; i < n; i++) buffer[offset + i] = value[i % length]
    return buffer
  }

  let filled = length < n ? length : n

  for (let i = 0; i < filled; i++) buffer[offset + i] = value[i]

  while (filled < n) {
    const copy = filled < n - filled ? filled : n - filled

    buffer.copyWithin(offset + filled, offset, offset + copy)

    filled += copy
  }

  return buffer
}

function allocate(size) {
  if (Number.isNaN(size) || size <= 0 || size >= poolSize >>> 1) {
    return new Buffer(size, { uninitialized: true })
  }

  if (pool === null || poolLength !== poolSize || poolLength - poolOffset < size) {
    pool = binding.allocUnsafe(poolSize)
    poolLength = poolSize
    poolOffset = 0
  }

  const buffer = new Buffer(pool, poolOffset, size)

  // Keep the next buffer 8 byte aligned so the wider accessors are not needlessly
  // reading across word boundaries.
  poolOffset = (poolOffset + size + 7) & ~7

  return buffer
}

function swap(buffer, n, m) {
  const i = buffer[n]
  buffer[n] = buffer[m]
  buffer[m] = i
}

exports.atob = function atob(data) {
  return Buffer.from(data, 'base64').toString('latin1')
}

exports.btoa = function btoa(data) {
  if (typeof data !== 'string') data = String(data)

  return Buffer.from(data, 'latin1').toString('base64')
}

exports.transcode = function transcode(buffer, from, to) {
  return Buffer.from(buffer.toString(from), to)
}

function boundsError() {
  throw new RangeError('Offset is outside the bounds of the buffer')
}

function offsetError(offset) {
  if (typeof offset !== 'number') {
    throw new TypeError(`Offset must be a number, received type ${typeof offset}`)
  }

  throw new RangeError('Offset is outside the bounds of the buffer')
}

function readInt48BE(buffer, offset) {
  const value = readUint48BE(buffer, offset)
  return value >= 0x800000000000 ? value - 0x1000000000000 : value
}

function readInt48LE(buffer, offset) {
  const value = readUint48LE(buffer, offset)
  return value >= 0x800000000000 ? value - 0x1000000000000 : value
}

function readInt40BE(buffer, offset) {
  const value = readUint40BE(buffer, offset)
  return value >= 0x8000000000 ? value - 0x10000000000 : value
}

function readInt40LE(buffer, offset) {
  const value = readUint40LE(buffer, offset)
  return value >= 0x8000000000 ? value - 0x10000000000 : value
}

function readInt24BE(buffer, offset) {
  const value = readUint24BE(buffer, offset)
  return value & 0x800000 ? value - 0x1000000 : value
}

function readInt24LE(buffer, offset) {
  const value = readUint24LE(buffer, offset)
  return value & 0x800000 ? value - 0x1000000 : value
}

function readUint48BE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 5]
  if (first === undefined || last === undefined) boundsError()
  return (
    (first * 0x100 + buffer[offset + 1]) * 0x100000000 +
    ((buffer[offset + 2] << 24) >>> 0) +
    (buffer[offset + 3] << 16) +
    (buffer[offset + 4] << 8) +
    last
  )
}

function readUint48LE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 5]
  if (first === undefined || last === undefined) boundsError()
  return (
    (buffer[offset + 4] + last * 0x100) * 0x100000000 +
    ((buffer[offset + 3] << 24) >>> 0) +
    (buffer[offset + 2] << 16) +
    (buffer[offset + 1] << 8) +
    first
  )
}

function readUint40BE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 4]
  if (first === undefined || last === undefined) boundsError()
  return (
    first * 0x100000000 +
    ((buffer[offset + 1] << 24) >>> 0) +
    (buffer[offset + 2] << 16) +
    (buffer[offset + 3] << 8) +
    last
  )
}

function readUint40LE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 4]
  if (first === undefined || last === undefined) boundsError()
  return (
    last * 0x100000000 +
    ((buffer[offset + 3] << 24) >>> 0) +
    (buffer[offset + 2] << 16) +
    (buffer[offset + 1] << 8) +
    first
  )
}

function readUint24BE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 2]
  if (first === undefined || last === undefined) boundsError()
  return (first << 16) | (buffer[offset + 1] << 8) | last
}

function readUint24LE(buffer, offset) {
  const first = buffer[offset]
  const last = buffer[offset + 2]
  if (first === undefined || last === undefined) boundsError()
  return (last << 16) | (buffer[offset + 1] << 8) | first
}

function writeInt48BE(buffer, value, offset) {
  if (value < 0) value += 0x1000000000000
  return writeUint48BE(buffer, value, offset)
}

function writeInt48LE(buffer, value, offset) {
  if (value < 0) value += 0x1000000000000
  return writeUint48LE(buffer, value, offset)
}

function writeInt40BE(buffer, value, offset) {
  if (value < 0) value += 0x10000000000
  return writeUint40BE(buffer, value, offset)
}

function writeInt40LE(buffer, value, offset) {
  if (value < 0) value += 0x10000000000
  return writeUint40LE(buffer, value, offset)
}

function writeInt24BE(buffer, value, offset) {
  if (value < 0) value += 0x1000000
  return writeUint24BE(buffer, value, offset)
}

function writeInt24LE(buffer, value, offset) {
  if (value < 0) value += 0x1000000
  return writeUint24LE(buffer, value, offset)
}

function writeUint48BE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 5] === undefined) boundsError()
  const hi = Math.floor(value / 0x100000000)
  const lo = value >>> 0
  buffer[offset] = hi >>> 8
  buffer[offset + 1] = hi
  buffer[offset + 2] = lo >>> 24
  buffer[offset + 3] = lo >>> 16
  buffer[offset + 4] = lo >>> 8
  buffer[offset + 5] = lo
  return offset + 6
}

function writeUint48LE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 5] === undefined) boundsError()
  const hi = Math.floor(value / 0x100000000)
  const lo = value >>> 0
  buffer[offset] = lo
  buffer[offset + 1] = lo >>> 8
  buffer[offset + 2] = lo >>> 16
  buffer[offset + 3] = lo >>> 24
  buffer[offset + 4] = hi
  buffer[offset + 5] = hi >>> 8
  return offset + 6
}

function writeUint40BE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 4] === undefined) boundsError()
  const lo = value >>> 0
  buffer[offset] = Math.floor(value / 0x100000000)
  buffer[offset + 1] = lo >>> 24
  buffer[offset + 2] = lo >>> 16
  buffer[offset + 3] = lo >>> 8
  buffer[offset + 4] = lo
  return offset + 5
}

function writeUint40LE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 4] === undefined) boundsError()
  const lo = value >>> 0
  buffer[offset] = lo
  buffer[offset + 1] = lo >>> 8
  buffer[offset + 2] = lo >>> 16
  buffer[offset + 3] = lo >>> 24
  buffer[offset + 4] = Math.floor(value / 0x100000000)
  return offset + 5
}

function writeUint24BE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 2] === undefined) boundsError()
  buffer[offset] = value >>> 16
  buffer[offset + 1] = value >>> 8
  buffer[offset + 2] = value
  return offset + 3
}

function writeUint24LE(buffer, value, offset) {
  if (buffer[offset] === undefined || buffer[offset + 2] === undefined) boundsError()
  buffer[offset] = value
  buffer[offset + 1] = value >>> 8
  buffer[offset + 2] = value >>> 16
  return offset + 3
}
