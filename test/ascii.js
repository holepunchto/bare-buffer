const test = require('brittle')
const Buffer = require('..')

test('isASCII', (t) => {
  t.is(Buffer.isASCII(Buffer.from('a')), true)
  t.is(Buffer.isASCII(Buffer.from('ã')), false)
})

test('isASCII with byte offset', (t) => {
  t.is(Buffer.isASCII(Buffer.from('ãa').subarray(2)), true)
  t.is(Buffer.isASCII(Buffer.from('aã').subarray(1)), false)
})
