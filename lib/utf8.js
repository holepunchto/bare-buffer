const binding = require('../binding')

function byteLength (string) {
  return binding.byteLength(string)
}

function toString (buffer) {
  const len = buffer.byteLength

  let output = ''
  let i = 0

  while (i < len) {
    let byte = buffer[i]

    if (byte <= 0x7f) {
      output += String.fromCharCode(byte)
      i++
      continue
    }

    let bytesNeeded = 0
    let codePoint = 0

    if (byte <= 0xdf) {
      bytesNeeded = 1
      codePoint = byte & 0x1f
    } else if (byte <= 0xef) {
      bytesNeeded = 2
      codePoint = byte & 0x0f
    } else if (byte <= 0xf4) {
      bytesNeeded = 3
      codePoint = byte & 0x07
    }

    if (len - i - bytesNeeded > 0) {
      let k = 0

      while (k < bytesNeeded) {
        byte = buffer[i + k + 1]
        codePoint = (codePoint << 6) | (byte & 0x3f)
        k += 1
      }
    } else {
      codePoint = 0xfffd
      bytesNeeded = len - i
    }

    output += String.fromCodePoint(codePoint)
    i += bytesNeeded + 1
  }

  return output
}

function write (buffer, string, offset = 0, length = byteLength(string)) {
  const len = Math.min(length, buffer.byteLength - offset)

  buffer = buffer.subarray(offset, offset + len)

  return binding.write(buffer, string)
}

module.exports = {
  byteLength,
  toString,
  write
}
