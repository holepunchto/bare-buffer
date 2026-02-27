const test = require('brittle')
const Buffer = require('..')

test('isASCII', (t) => {
  t.is(Buffer.isASCII(Buffer.from('a')), true)
  t.is(Buffer.isASCII(Buffer.from('ã')), false)
})
