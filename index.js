const constants = require('./lib/constants')
const ascii = require('./lib/ascii')
const base64 = require('./lib/base64')
const hex = require('./lib/hex')
const utf8 = require('./lib/utf8')
const utf16le = require('./lib/utf16le')
const binding = require('./binding')

let poolSize = 0

module.exports = exports = class Buffer extends Uint8Array {
  static {
    binding.tag(this)
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

      if (length > constants.MAX_LENGTH) {
        throw new RangeError(
          `Buffer length must be at most ${constants.MAX_LENGTH}`
        )
      }

      arrayBuffer = uninitialized
        ? binding.allocUnsafe(length)
        : binding.alloc(length)
    } else {
      if (length > constants.MAX_LENGTH) {
        throw new RangeError(
          `Buffer length must be at most ${constants.MAX_LENGTH}`
        )
      }

      if (typeof offset === 'object' && offset !== null) {
        opts = offset
        offset = 0
        length = arrayBuffer.byteLength
      } else if (typeof length === 'length' && length !== null) {
        opts = length
        length = arrayBuffer.byteLength - offset
      }
    }

    super(arrayBuffer, offset, length)
  }

  [Symbol.species]() {
    return Buffer
  }

  copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.byteLength) {
    let source = this

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
    } else {
      if (sourceStart !== 0 || sourceEnd !== source.byteLength) {
        source = source.subarray(sourceStart, sourceEnd)
      }

      target.set(source, targetStart)
    }

    return sourceLength
  }

  equals(target) {
    const source = this

    if (source === target) return true

    if (source.byteLength !== target.byteLength) return false

    return binding.compare(source, target) === 0
  }

  compare(
    target,
    targetStart = 0,
    targetEnd = target.byteLength,
    sourceStart = 0,
    sourceEnd = this.byteLength
  ) {
    let source = this

    if (source === target) return 0

    if (arguments.length === 1) return binding.compare(source, target)

    if (targetStart < 0) targetStart = 0
    if (targetStart > target.byteLength) targetStart = target.byteLength

    if (targetEnd < targetStart) targetEnd = targetStart
    if (targetEnd > target.byteLength) targetEnd = target.byteLength

    if (sourceStart < 0) sourceStart = 0
    if (sourceStart > source.byteLength) sourceStart = source.byteLength

    if (sourceEnd < sourceStart) sourceEnd = sourceStart
    if (sourceEnd > source.byteLength) sourceEnd = source.byteLength

    if (sourceStart !== 0 || sourceEnd !== source.byteLength) {
      source = source.subarray(sourceStart, sourceEnd)
    }

    if (targetStart !== 0 || targetEnd !== target.byteLength) {
      target = target.subarray(targetStart, targetEnd)
    }

    return binding.compare(source, target)
  }

  fill(value, offset = 0, end = this.byteLength, encoding = 'utf8') {
    if (typeof value === 'string') {
      // fill(string, encoding)
      if (typeof offset === 'string') {
        encoding = offset
        offset = 0
        end = this.byteLength

        // fill(string, offset, encoding)
      } else if (typeof end === 'string') {
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

    for (let i = 0, n = end - offset; i < n; ++i) {
      this[i + offset] = value[i % length]
    }

    return this
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

    for (let i = 0; i < length; i += 2) swap(this, i, i + 1)

    return this
  }

  swap32() {
    const length = this.byteLength

    if (length % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }

    for (let i = 0; i < length; i += 4) {
      swap(this, i, i + 3)
      swap(this, i + 1, i + 2)
    }

    return this
  }

  swap64() {
    const length = this.byteLength

    if (length % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }

    for (let i = 0; i < length; i += 8) {
      swap(this, i, i + 7)
      swap(this, i + 1, i + 6)
      swap(this, i + 2, i + 5)
      swap(this, i + 3, i + 4)
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

    let buffer = this

    if (start !== 0 || end !== this.byteLength) {
      buffer = buffer.subarray(start, end)
    }

    return codecFor(encoding).toString(buffer)
  }

  write(
    string,
    offset = 0,
    length = this.byteLength - offset,
    encoding = 'utf8'
  ) {
    // write(string)
    if (arguments.length === 1) return utf8.write(this, string)

    // write(string, encoding)
    if (typeof offset === 'string') {
      encoding = offset
      offset = 0
      length = this.byteLength

      // write(string, offset, encoding)
    } else if (typeof length === 'string') {
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

    let buffer = this

    if (start !== 0 || end !== this.byteLength) {
      buffer = buffer.subarray(start, end)
    }

    return codecFor(encoding).write(buffer, string)
  }

  readBigInt64BE(offset = 0) {
    return viewOf(this).getBigInt64(offset, false)
  }
  readBigInt64LE(offset = 0) {
    return viewOf(this).getBigInt64(offset, true)
  }

  readBigUint64BE(offset = 0) {
    return viewOf(this).getBigUint64(offset, false)
  }
  readBigUint64LE(offset = 0) {
    return viewOf(this).getBigUint64(offset, true)
  }

  readDoubleBE(offset = 0) {
    return viewOf(this).getFloat64(offset, false)
  }
  readDoubleLE(offset = 0) {
    return viewOf(this).getFloat64(offset, true)
  }

  readFloatBE(offset = 0) {
    return viewOf(this).getFloat32(offset, false)
  }
  readFloatLE(offset = 0) {
    return viewOf(this).getFloat32(offset, true)
  }

  readInt8(offset = 0) {
    return viewOf(this).getInt8(offset)
  }

  readInt16BE(offset = 0) {
    return viewOf(this).getInt16(offset, false)
  }
  readInt16LE(offset = 0) {
    return viewOf(this).getInt16(offset, true)
  }

  readInt32BE(offset = 0) {
    return viewOf(this).getInt32(offset, false)
  }
  readInt32LE(offset = 0) {
    return viewOf(this).getInt32(offset, true)
  }

  readUint8(offset = 0) {
    return viewOf(this).getUint8(offset)
  }

  readUint16BE(offset = 0) {
    return viewOf(this).getUint16(offset, false)
  }
  readUint16LE(offset = 0) {
    return viewOf(this).getUint16(offset, true)
  }

  readUint32BE(offset = 0) {
    return viewOf(this).getUint32(offset, false)
  }
  readUint32LE(offset = 0) {
    return viewOf(this).getUint32(offset, true)
  }

  readBigUInt64BE(...args) {
    return this.readBigUint64BE(...args)
  }
  readBigUInt64LE(...args) {
    return this.readBigUint64LE(...args)
  }

  readUInt8(...args) {
    return this.readUint8(...args)
  }

  readUInt16BE(...args) {
    return this.readUint16BE(...args)
  }
  readUInt16LE(...args) {
    return this.readUint16LE(...args)
  }

  readUInt32BE(...args) {
    return this.readUint32BE(...args)
  }
  readUInt32LE(...args) {
    return this.readUint32LE(...args)
  }

  writeBigInt64BE(value, offset = 0) {
    viewOf(this).setBigInt64(offset, value, false)
    return offset + 8
  }
  writeBigInt64LE(value, offset = 0) {
    viewOf(this).setBigInt64(offset, value, true)
    return offset + 8
  }

  writeBigUint64BE(value, offset = 0) {
    viewOf(this).setBigUint64(offset, value, false)
    return offset + 8
  }
  writeBigUint64LE(value, offset = 0) {
    viewOf(this).setBigUint64(offset, value, true)
    return offset + 8
  }

  writeDoubleBE(value, offset = 0) {
    viewOf(this).setFloat64(offset, value, false)
    return offset + 8
  }
  writeDoubleLE(value, offset = 0) {
    viewOf(this).setFloat64(offset, value, true)
    return offset + 8
  }

  writeFloatBE(value, offset = 0) {
    viewOf(this).setFloat32(offset, value, false)
    return offset + 4
  }
  writeFloatLE(value, offset = 0) {
    viewOf(this).setFloat32(offset, value, true)
    return offset + 4
  }

  writeInt8(value, offset = 0) {
    viewOf(this).setInt8(offset, value)
    return offset + 1
  }

  writeInt16BE(value, offset = 0) {
    viewOf(this).setInt16(offset, value, false)
    return offset + 2
  }
  writeInt16LE(value, offset = 0) {
    viewOf(this).setInt16(offset, value, true)
    return offset + 2
  }

  writeInt32BE(value, offset = 0) {
    viewOf(this).setInt32(offset, value, false)
    return offset + 4
  }
  writeInt32LE(value, offset = 0) {
    viewOf(this).setInt32(offset, value, true)
    return offset + 4
  }

  writeUint8(value, offset = 0) {
    viewOf(this).setUint8(offset, value, true)
    return offset + 1
  }

  writeUint16BE(value, offset = 0) {
    viewOf(this).setUint16(offset, value, false)
    return offset + 2
  }
  writeUint16LE(value, offset = 0) {
    viewOf(this).setUint16(offset, value, true)
    return offset + 2
  }

  writeUint32LE(value, offset = 0) {
    viewOf(this).setUint32(offset, value, true)
    return offset + 4
  }
  writeUint32BE(value, offset = 0) {
    viewOf(this).setUint32(offset, value, false)
    return offset + 4
  }

  writeBigUInt64BE(...args) {
    return this.writeBigUint64BE(...args)
  }
  writeBigUInt64LE(...args) {
    return this.writeBigUint64LE(...args)
  }

  writeUInt8(...args) {
    return this.writeUint8(...args)
  }

  writeUInt16BE(...args) {
    return this.writeUint16BE(...args)
  }
  writeUInt16LE(...args) {
    return this.writeUint16LE(...args)
  }

  writeUInt32BE(...args) {
    return this.writeUint32BE(...args)
  }
  writeUInt32LE(...args) {
    return this.writeUint32LE(...args)
  }
}

const Buffer = exports

exports.Buffer = Buffer // For Node.js compatibility

exports.constants = constants

const codecs = Object.create(null)

codecs.ascii = ascii
codecs.base64 = base64
codecs.hex = hex
codecs.utf8 = codecs['utf-8'] = utf8
codecs.utf16le = codecs.ucs2 = codecs['utf-16le'] = codecs['ucs-2'] = utf16le

function codecFor(encoding = 'utf8') {
  if (encoding in codecs) return codecs[encoding]

  encoding = encoding.toLowerCase()

  if (encoding in codecs) return codecs[encoding]

  throw new Error(`Unknown encoding: ${encoding}`)
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
  if (typeof value !== 'object' || value === null) return false

  let constructor = value.constructor

  while (typeof constructor === 'function') {
    if (binding.isTagged(constructor)) return true

    constructor = Reflect.getPrototypeOf(constructor)
  }

  return false
}

exports.isEncoding = function isEncoding(encoding) {
  try {
    codecFor(encoding)
    return true
  } catch {
    return false
  }
}

exports.alloc = function alloc(size, fill, encoding) {
  const buffer = new Buffer(size)
  if (fill !== undefined) buffer.fill(fill, 0, buffer.byteLength, encoding)
  return buffer
}

exports.allocUnsafe = function allocUnsafe(size) {
  return new Buffer(size, { uninitialized: true })
}

exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  return exports.allocUnsafe(size)
}

exports.byteLength = function byteLength(string, encoding) {
  if (typeof string === 'string') {
    return codecFor(encoding).byteLength(string)
  }

  return string.byteLength
}

exports.compare = function compare(a, b) {
  return binding.compare(a, b)
}

exports.concat = function concat(buffers, length) {
  if (length === undefined) {
    length = buffers.reduce((length, buffer) => length + buffer.byteLength, 0)
  }

  const result = new Buffer(length)

  for (let i = 0, n = buffers.length, offset = 0; i < n; i++) {
    const buffer = buffers[i]

    if (offset + buffer.byteLength > result.byteLength) {
      result.set(buffer.subarray(0, result.byteLength - offset), offset)
      return result
    }

    result.set(buffer, offset)

    offset += buffer.byteLength
  }

  return result
}

exports.coerce = function coerce(buffer) {
  if (exports.isBuffer(buffer)) return buffer
  return new Buffer(buffer.buffer, buffer.byteOffset, buffer.byteLength)
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
  const buffer = new Buffer(codec.byteLength(string))
  codec.write(buffer, string)
  return buffer
}

function fromArray(array) {
  const buffer = new Buffer(array.length)
  buffer.set(array)
  return buffer
}

function fromBuffer(buffer) {
  const copy = new Buffer(buffer.byteLength)
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

  if (value.byteLength === 0) return -1

  if (first) {
    let foundIndex = -1

    for (let i = offset; i < buffer.byteLength; i++) {
      if (buffer[i] === value[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === value.byteLength) return foundIndex
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (offset + value.byteLength > buffer.byteLength) {
      offset = buffer.byteLength - value.byteLength
    }

    for (let i = offset; i >= 0; i--) {
      let found = true

      for (let j = 0; j < value.byteLength; j++) {
        if (buffer[i + j] !== value[j]) {
          found = false
          break
        }
      }

      if (found) return i
    }
  }

  return -1
}

function swap(buffer, n, m) {
  const i = buffer[n]
  buffer[n] = buffer[m]
  buffer[m] = i
}
