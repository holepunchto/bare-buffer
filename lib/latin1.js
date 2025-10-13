const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length
}

exports.toString = function toString(buffer) {
  return binding.toStringLatin1(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

exports.write = function write(buffer, string) {
  return binding.writeLatin1(buffer.buffer, buffer.byteOffset, buffer.byteLength, string)
}
