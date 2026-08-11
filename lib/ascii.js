const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length
}

exports.toString = function toString(buffer) {
  const offset = buffer.byteOffset
  const len = buffer.byteLength

  // ASCII is Latin-1 with the high bit unset, so as long as no high bits are set
  // the native Latin-1 decoder produces the same string.
  if (binding.validateAscii(buffer.buffer, offset, len)) {
    return binding.toStringLatin1(buffer.buffer, offset, len)
  }

  let result = ''

  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buffer[i] & 0x7f)
  }

  return result
}

// Encoding ASCII is equivalent to encoding Latin-1, both truncating each code
// unit to its low byte.
exports.write = function write(buffer, string) {
  return binding.writeLatin1(buffer.buffer, buffer.byteOffset, buffer.byteLength, string)
}

exports.validate = function validate(buffer) {
  return binding.validateAscii(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}
