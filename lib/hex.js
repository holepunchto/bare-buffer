const binding = require('../binding')

exports.byteLength = function byteLength (string) {
  return string.length >>> 1
}

exports.toString = function toString (buffer) {
  return binding.toStringHex(buffer)
}

exports.write = function write (buffer, string) {
  return binding.writeHex(buffer, string)
}
