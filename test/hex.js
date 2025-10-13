const test = require('brittle')
const Buffer = require('..')

test('hex byteLength', (t) => {
  t.is(Buffer.byteLength('68656c6c6f20776f726c64', 'hex'), 11)
})

test('hex toString', (t) => {
  t.is(Buffer.from('hello world').toString('hex'), '68656c6c6f20776f726c64')
})

test('hex write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('68656c6c6f20776f726c64', 'hex'))

  t.is(buffer.write('68656c6c6f20776f726c64', 'hex'), 11)

  t.alike(buffer, Buffer.from('hello world'))
})
