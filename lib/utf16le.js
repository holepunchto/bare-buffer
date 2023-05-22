const binding = require('../binding')

exports.byteLength = function byteLength (string) {
  return string.length * 2
}

exports.toString = function toString (buffer) {
  return binding.toStringUTF16LE(buffer)
}

exports.write = function write (buffer, string) {
  return binding.writeUTF16LE(buffer, string)
}
