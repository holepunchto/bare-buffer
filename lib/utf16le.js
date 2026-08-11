const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length * 2
}

exports.toString = function toString(buffer, start = 0, end = buffer.byteLength) {
  return binding.toStringUTF16LE(buffer.buffer, buffer.byteOffset + start, end - start)
}

exports.write = function write(buffer, string, start = 0, end = buffer.byteLength) {
  return binding.writeUTF16LE(buffer.buffer, buffer.byteOffset + start, end - start, string)
}
