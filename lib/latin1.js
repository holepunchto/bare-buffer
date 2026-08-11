const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length
}

exports.toString = function toString(buffer, start = 0, end = buffer.byteLength) {
  return binding.toStringLatin1(buffer.buffer, buffer.byteOffset + start, end - start)
}

exports.write = function write(buffer, string, start = 0, end = buffer.byteLength) {
  return binding.writeLatin1(buffer.buffer, buffer.byteOffset + start, end - start, string)
}
