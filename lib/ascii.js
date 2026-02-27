const binding = require('../binding')

exports.byteLength = function byteLength(string) {
  return string.length
}

exports.toString = function toString(buffer) {
  const len = buffer.byteLength

  let result = ''

  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buffer[i] & 0x7f)
  }

  return result
}

exports.write = function write(buffer, string) {
  const len = buffer.byteLength

  for (let i = 0; i < len; i++) {
    buffer[i] = string.charCodeAt(i)
  }

  return len
}

exports.validate = function validate(buffer) {
  return binding.validateAscii(buffer.buffer, buffer.byteLength)
}
