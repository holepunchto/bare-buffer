const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length
}

exports.toString = binding.toStringLatin1

exports.write = binding.writeLatin1
