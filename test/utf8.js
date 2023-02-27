const test = require('brittle')
const Buffer = require('..')

test('byteLength', (t) => {
  t.is(Buffer.byteLength('hello world'), 11)
})

test('toString', (t) => {
  t.is(Buffer.from('hello world').toString(), 'hello world')
})
