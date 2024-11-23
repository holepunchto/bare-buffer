const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length * 2
}

exports.toString = binding.toStringUTF16LE

exports.write = binding.writeUTF16LE
