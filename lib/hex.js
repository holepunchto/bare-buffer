const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length >>> 1
}

exports.toString = binding.toStringHex

exports.write = binding.writeHex
