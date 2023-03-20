const test = require('brittle')
const Buffer = require('..')

test('base64 byteLength', (t) => {
  t.is(Buffer.byteLength('aGVsbG8gd29ybGQ=', 'base64'), 11)
})

test('base64 toString', (t) => {
  t.is(Buffer.from('hello world').toString('base64'), 'aGVsbG8gd29ybGQ=')
})

test('base64 write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('aGVsbG8gd29ybGQ=', 'base64'))

  t.is(buffer.write('aGVsbG8gd29ybGQ=', 'base64'), 11)

  t.alike(buffer, Buffer.from('hello world'))
})
