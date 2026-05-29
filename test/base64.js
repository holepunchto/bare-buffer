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

test('base64 write non-ascii utf16 code unit throws', (t) => {
  const buffer = Buffer.alloc(16)

  t.exception(() => buffer.write('ABCĀ', 'base64'))
  t.exception(() => buffer.write('ABĀ', 'base64'))
  t.exception(() => buffer.write('￿￿￿￿', 'base64'))
  t.exception(() => buffer.write('A\ud800BC', 'base64'))
})
