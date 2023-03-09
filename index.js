const ascii = require('./lib/ascii')
const base64 = require('./lib/base64')
const hex = require('./lib/hex')
const utf8 = require('./lib/utf8')
const utf16le = require('./lib/utf16le')
const binding = require('./binding')

const Buffer = module.exports = exports = class Buffer extends Uint8Array {
  [Symbol.species] () {
    return Buffer
  }

  copy (target, targetStart = 0, start = 0, end = this.byteLength) {
    const source = this

    if (end > 0 && end < start) return 0
    if (end === start) return 0
    if (source.byteLength === 0 || target.byteLength === 0) return 0

    if (targetStart < 0) throw new RangeError('targetStart is out of range')
    if (start < 0 || start >= source.byteLength) throw new RangeError('sourceStart is out of range')
    if (end < 0) throw new RangeError('sourceEnd is out of range')

    if (targetStart >= target.byteLength) targetStart = target.byteLength
    if (end > source.byteLength) end = source.byteLength
    if (target.byteLength - targetStart < end - start) {
      end = target.byteLength - targetStart + start
    }

    const len = end - start

    if (source === target) {
      target.copyWithin(targetStart, start, end)
    } else {
      target.set(source.subarray(start, end), targetStart)
    }

    return len
  }

  equals (target) {
    const a = this
    const b = target

    if (a === b) return true
    if (a.byteLength !== b.byteLength) return false

    return a.compare(b) === 0
  }

  compare (target, targetStart = 0, targetEnd = target.byteLength, sourceStart = 0, sourceEnd = this.byteLength) {
    let a = this
    let b = target

    if (a === b) return 0

    if (targetStart !== 0 || targetEnd !== target.byteLength) {
      b = b.subarray(targetStart, targetEnd)
    }

    if (sourceStart !== 0 || targetEnd !== target.byteLength) {
      a = a.subarray(sourceStart, sourceEnd)
    }

    return binding.compare(a, b)
  }

  fill (value, offset = 0, end = this.byteLength, encoding = 'utf8') {
    if (typeof value === 'string') {
      // fill(buffer, string, encoding)
      if (typeof offset === 'string') {
        encoding = offset
        offset = 0
        end = this.byteLength

      // fill(buffer, string, offset, encoding)
      } else if (typeof end === 'string') {
        encoding = end
        end = this.byteLength
      }
    } else if (typeof val === 'number') {
      value = value & 0xff
    } else if (typeof val === 'boolean') {
      value = +value
    }

    if (offset < 0 || this.byteLength < offset || this.byteLength < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= offset) return this

    if (!value) value = 0

    if (typeof value === 'number') {
      for (let i = offset; i < end; ++i) {
        this[i] = value
      }
    } else {
      value = exports.isBuffer(value) ? value : exports.from(value, encoding)

      const len = value.byteLength

      for (let i = 0; i < end - offset; ++i) {
        this[i + offset] = value[i % len]
      }
    }

    return this
  }

  includes (value, byteOffset, encoding) {
    return this.indexOf(value, byteOffset, encoding) !== -1
  }

  indexOf (value, byteOffset = 0, encoding) {
    if (typeof value === 'number') {
      return super.indexOf(value & 0xff, byteOffset)
    }

    return bidirectionalIndexOf(this, value, byteOffset, encoding, true /* first */)
  }

  lastIndexOf (value, byteOffset = this.byteLength - 1, encoding) {
    if (typeof value === 'number') {
      return super.lastIndexOf(value & 0xff, byteOffset)
    }

    return bidirectionalIndexOf(this, value, byteOffset, encoding, false /* last */)
  }

  swap16 () {
    const len = this.byteLength

    if (len % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits')

    for (let i = 0; i < len; i += 2) swap(this, i, i + 1)

    return this
  }

  swap32 () {
    const len = this.byteLength

    if (len % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits')

    for (let i = 0; i < len; i += 4) {
      swap(this, i, i + 3)
      swap(this, i + 1, i + 2)
    }

    return this
  }

  swap64 () {
    const len = this.byteLength

    if (len % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits')

    for (let i = 0; i < len; i += 8) {
      swap(this, i, i + 7)
      swap(this, i + 1, i + 6)
      swap(this, i + 2, i + 5)
      swap(this, i + 3, i + 4)
    }

    return this
  }

  toString (encoding, start = 0, end = this.byteLength) {
    if (start >= this.byteLength) return ''
    if (end <= start) return ''
    if (start < 0) start = 0
    if (end > this.byteLength) end = this.byteLength

    let buffer = this

    if (start !== 0 || end < this.byteLength) buffer = buffer.subarray(start, end)

    return codecFor(encoding).toString(buffer)
  }

  write (string, offset = 0, length = this.byteLength - offset, encoding = 'utf8') {
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
    if (start >= this.byteLength) return 0
    if (start < 0) start = 0

    let end = offset + length
    if (end <= start) return 0
    if (end > this.byteLength) end = this.byteLength

    let buffer = this

    if (start !== 0 || end < this.byteLength) buffer = buffer.subarray(start, end)

    return codecFor(encoding).write(buffer, string)
  }

  writeDoubleLE (value, offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)
    view.setFloat64(offset, value, true)

    return offset + 8
  }

  writeFloatLE (value, offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)
    view.setFloat32(offset, value, true)

    return offset + 4
  }

  writeUInt32LE (value, offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)
    view.setUint32(offset, value, true)

    return offset + 4
  }

  writeInt32LE (value, offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)
    view.setInt32(offset, value, true)

    return offset + 4
  }

  readDoubleLE (offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)

    return view.getFloat64(offset, true)
  }

  readFloatLE (offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)

    return view.getFloat32(offset, true)
  }

  readUInt32LE (offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)

    return view.getUint32(offset, true)
  }

  readInt32LE (offset = 0) {
    const view = new DataView(this.buffer, this.byteOffset, this.byteLength)

    return view.getInt32(offset, true)
  }
}

function codecFor (encoding) {
  if (encoding) encoding = encoding.toLowerCase()

  switch (encoding) {
    case 'ascii':
      return ascii
    case 'base64':
      return base64
    case 'hex':
      return hex
    case 'utf8':
    case 'utf-8':
    case undefined:
      return utf8
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return utf16le
    default:
      throw new Error(`Unknown encoding: ${encoding}`)
  }
}

exports.isBuffer = function isBuffer (value) {
  return value instanceof Buffer
}

exports.isEncoding = function isEncoding (encoding) {
  try {
    codecFor(encoding)
    return true
  } catch {
    return false
  }
}

exports.alloc = function alloc (size, fill, encoding) {
  const buffer = new Buffer(size)
  if (fill !== undefined) buffer.fill(fill, 0, buffer.byteLength, encoding)
  return buffer
}

exports.allocUnsafe = function allocUnsafe (size) {
  binding.setZeroFillEnabled(0)
  try {
    return new Buffer(size)
  } finally {
    binding.setZeroFillEnabled(1)
  }
}

exports.allocUnsafeSlow = function allocUnsafeSlow (size) {
  return exports.allocUnsafe(size)
}

exports.byteLength = function byteLength (string, encoding) {
  return codecFor(encoding).byteLength(string)
}

exports.compare = function compare (a, b) {
  return a.compare(b)
}

exports.concat = function concat (buffers, totalLength) {
  if (totalLength === undefined) {
    totalLength = buffers.reduce((len, buffer) => len + buffer.byteLength, 0)
  }

  const result = new Buffer(totalLength)

  buffers.reduce((offset, buffer) => {
    result.set(buffer, offset)
    return offset + buffer.byteLength
  }, 0)

  return result
}

exports.coerce = function coerce (buffer) {
  if (exports.isBuffer(buffer)) return buffer
  return new Buffer(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

exports.from = function from (value, encodingOrOffset, length) {
  // from(string, encoding)
  if (typeof value === 'string') return fromString(value, encodingOrOffset)

  // from(array)
  if (Array.isArray(value)) return fromArray(value)

  // from(buffer)
  if (ArrayBuffer.isView(value)) return fromBuffer(value)

  // from(arrayBuffer[, byteOffset[, length]])
  return fromArrayBuffer(value, encodingOrOffset, length)
}

function fromString (string, encoding) {
  const codec = codecFor(encoding)
  const buffer = new Buffer(codec.byteLength(string))
  codec.write(buffer, string, 0, buffer.byteLength)
  return buffer
}

function fromArray (array) {
  const buffer = new Buffer(array.length)
  buffer.set(array)
  return buffer
}

function fromBuffer (buffer) {
  const copy = new Buffer(buffer.byteLength)
  copy.set(buffer)
  return copy
}

function fromArrayBuffer (arrayBuffer, byteOffset, length) {
  return new Buffer(arrayBuffer, byteOffset, length)
}

function bidirectionalIndexOf (buffer, value, byteOffset, encoding, first) {
  if (buffer.byteLength === 0) return -1

  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset === undefined) {
    byteOffset = first ? 0 : (buffer.byteLength - 1)
  } else if (byteOffset < 0) {
    byteOffset += buffer.byteLength
  }

  if (byteOffset >= buffer.byteLength) {
    if (first) return -1
    else byteOffset = buffer.byteLength - 1
  } else if (byteOffset < 0) {
    if (first) byteOffset = 0
    else return -1
  }

  if (typeof value === 'string') {
    value = exports.from(value, encoding)
  }

  if (value.byteLength === 0) return -1

  if (first) {
    let foundIndex = -1

    for (let i = byteOffset; i < buffer.byteLength; i++) {
      if (buffer[i] === value[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === value.byteLength) return foundIndex
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + value.byteLength > buffer.byteLength) {
      byteOffset = buffer.byteLength - value.byteLength
    }

    for (let i = byteOffset; i >= 0; i--) {
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

function swap (buffer, n, m) {
  const i = buffer[n]
  buffer[n] = buffer[m]
  buffer[m] = i
}
