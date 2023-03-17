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

  copy (target, targetStart = 0, sourceStart = 0, sourceEnd = this.byteLength) {
    let source = this

    if (targetStart < 0) targetStart = 0
    if (targetStart >= target.byteLength) return 0

    const targetLength = target.byteLength - targetStart

    if (sourceStart < 0) sourceStart = 0
    if (sourceStart >= source.byteLength) return 0

    if (sourceEnd <= sourceStart) return 0
    if (sourceEnd > source.byteLength) sourceEnd = source.byteLength

    if (sourceEnd - sourceStart > targetLength) sourceEnd = sourceStart + targetLength

    const sourceLength = sourceEnd - sourceStart

    if (source === target) {
      target.copyWithin(targetStart, sourceStart, sourceEnd)
    } else {
      if (sourceStart !== 0 || sourceEnd !== source.byteLength) source = source.subarray(sourceStart, sourceEnd)

      target.set(source, targetStart)
    }

    return sourceLength
  }

  equals (target) {
    const source = this

    if (source === target) return true

    if (source.byteLength !== target.byteLength) return false

    return binding.compare(source, target) === 0
  }

  compare (target, targetStart = 0, targetEnd = target.byteLength, sourceStart = 0, sourceEnd = this.byteLength) {
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

    if (sourceStart !== 0 || sourceEnd !== source.byteLength) source = source.subarray(sourceStart, sourceEnd)

    if (targetStart !== 0 || targetEnd !== target.byteLength) target = target.subarray(targetStart, targetEnd)

    return binding.compare(source, target)
  }

  fill (value, offset = 0, end = this.byteLength, encoding = 'utf8') {
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

    value = exports.isBuffer(value) ? value : exports.from(value, encoding)

    const length = value.byteLength

    for (let i = 0, n = end - offset; i < n; ++i) {
      this[i + offset] = value[i % length]
    }

    return this
  }

  includes (value, offset, encoding) {
    return this.indexOf(value, offset, encoding) !== -1
  }

  indexOf (value, offset = 0, encoding) {
    if (typeof value === 'number') {
      return super.indexOf(value & 0xff, offset)
    }

    return bidirectionalIndexOf(this, value, offset, encoding, true /* first */)
  }

  lastIndexOf (value, offset = this.byteLength - 1, encoding) {
    if (typeof value === 'number') {
      return super.lastIndexOf(value & 0xff, offset)
    }

    return bidirectionalIndexOf(this, value, offset, encoding, false /* last */)
  }

  swap16 () {
    const length = this.byteLength

    if (length % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits')

    for (let i = 0; i < length; i += 2) swap(this, i, i + 1)

    return this
  }

  swap32 () {
    const length = this.byteLength

    if (length % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits')

    for (let i = 0; i < length; i += 4) {
      swap(this, i, i + 3)
      swap(this, i + 1, i + 2)
    }

    return this
  }

  swap64 () {
    const length = this.byteLength

    if (length % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits')

    for (let i = 0; i < length; i += 8) {
      swap(this, i, i + 7)
      swap(this, i + 1, i + 6)
      swap(this, i + 2, i + 5)
      swap(this, i + 3, i + 4)
    }

    return this
  }

  toString (encoding, start = 0, end = this.byteLength) {
    if (start < 0) start = 0
    if (start >= this.byteLength) return ''

    if (end <= start) return ''
    if (end > this.byteLength) end = this.byteLength

    let buffer = this

    if (start !== 0 || end !== this.byteLength) buffer = buffer.subarray(start, end)

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
    if (start < 0) start = 0
    if (start >= this.byteLength) return 0

    let end = offset + length
    if (end <= start) return 0
    if (end > this.byteLength) end = this.byteLength

    let buffer = this

    if (start !== 0 || end !== this.byteLength) buffer = buffer.subarray(start, end)

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
  return binding.compare(a, b)
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

  // from(arrayBuffer[, offset[, length]])
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

function fromArrayBuffer (arrayBuffer, offset, length) {
  return new Buffer(arrayBuffer, offset, length)
}

function bidirectionalIndexOf (buffer, value, offset, encoding, first) {
  if (buffer.byteLength === 0) return -1

  if (typeof offset === 'string') {
    encoding = offset
    offset = 0
  } else if (offset === undefined) {
    offset = first ? 0 : (buffer.byteLength - 1)
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

  if (typeof value === 'string') {
    value = exports.from(value, encoding)
  }

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

function swap (buffer, n, m) {
  const i = buffer[n]
  buffer[n] = buffer[m]
  buffer[m] = i
}
