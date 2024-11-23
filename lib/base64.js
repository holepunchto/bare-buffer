const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  let len = string.length

  if (string.charCodeAt(len - 1) === 0x3d) len--
  if (len > 1 && string.charCodeAt(len - 1) === 0x3d) len--

  return (len * 3) >>> 2
}

exports.toString = binding.toStringBase64

exports.write = binding.writeBase64
