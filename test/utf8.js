const test = require('brittle')
const Buffer = require('..')

test('utf8 byteLength', (t) => {
  t.is(Buffer.byteLength('hello world'), 11)
})

test('utf8 toString', (t) => {
  t.is(Buffer.from('hello world').toString(), 'hello world')
})

test('utf8 write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('hello world'))

  buffer.write('hello world')

  t.alike(buffer, Buffer.from('hello world'))
})
