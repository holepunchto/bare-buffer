const test = require('brittle')
const Buffer = require('..')

test('byteLength', (t) => {
  t.is(Buffer.byteLength('hello world'), 11)
})

test('toString', (t) => {
  t.is(Buffer.from('hello world').toString(), 'hello world')
})

test('write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('hello world'))

  buffer.write('hello world')

  t.alike(buffer, Buffer.from('hello world'))
})
