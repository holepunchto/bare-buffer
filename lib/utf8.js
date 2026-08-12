const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return binding.byteLengthUTF8(string)
}

exports.toString = function toString(buffer, start = 0, end = buffer.byteLength) {
  return binding.toStringUTF8(buffer.buffer, buffer.byteOffset + start, end - start)
}

exports.write = function write(buffer, string, start = 0, end = buffer.byteLength) {
  return binding.writeUTF8(buffer.buffer, buffer.byteOffset + start, end - start, string)
}

exports.validate = function validate(buffer) {
  return binding.validateUTF8(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}
