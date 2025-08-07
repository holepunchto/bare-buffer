const test = require('brittle')
const Buffer = require('..')

test('base64url byteLength', (t) => {
  t.is(Buffer.byteLength('aGVsbG8gd29ybGQ', 'base64url'), 11)
})

test('base64url toString', (t) => {
  t.is(Buffer.from('hello world').toString('base64url'), 'aGVsbG8gd29ybGQ')
})

test('base64url write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('aGVsbG8gd29ybGQ', 'base64url'))

  t.is(buffer.write('aGVsbG8gd29ybGQ', 'base64'), 11)

  t.alike(buffer, Buffer.from('hello world'))
})
