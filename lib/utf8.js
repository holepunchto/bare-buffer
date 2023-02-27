const binding = require('../binding')

function byteLength (string) {
  return binding.byteLengthUTF8(string)
}

function toString (buffer) {
  return binding.toStringUTF8(buffer)
}

function write (buffer, string, offset = 0, length = byteLength(string)) {
  const len = Math.min(length, buffer.byteLength - offset)

  buffer = buffer.subarray(offset, offset + len)

  return binding.writeUTF8(buffer, string)
}

module.exports = {
  byteLength,
  toString,
  write
}
