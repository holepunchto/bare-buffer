const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  let len = string.length

  if (string.charCodeAt(len - 1) === 0x3d) len--
  if (len > 1 && string.charCodeAt(len - 1) === 0x3d) len--

  return (len * 3) >>> 2
}

exports.toString = function toString(buffer) {
  return binding.toStringBase64URL(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

exports.write = function write(buffer, string) {
  return binding.writeBase64(buffer.buffer, buffer.byteOffset, buffer.byteLength, string)
}
