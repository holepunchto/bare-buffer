const test = require('brittle')
const Buffer = require('..')

test('isAscii', (t) => {
  t.is(Buffer.isAscii(Buffer.from('a')), true)
  t.is(Buffer.isAscii(Buffer.from('ã')), false)
})
