const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return binding.byteLengthUTF8(string)
}

exports.toString = function toString(buffer) {
  return binding.toStringUTF8(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

exports.write = function write(buffer, string) {
  return binding.writeUTF8(buffer.buffer, buffer.byteOffset, buffer.byteLength, string)
}
