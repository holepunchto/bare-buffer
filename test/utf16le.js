const test = require('brittle')
const Buffer = require('..')

test('utf16le byteLength', (t) => {
  t.is(Buffer.byteLength('hello world', 'utf16le'), 22)
})

test('utf16le toString', (t) => {
  t.is(
    Buffer.from([
      0x68, 0x00, 0x65, 0x00, 0x6c, 0x00, 0x6c, 0x00, 0x6f, 0x00, 0x20, 0x00, 0x77, 0x00, 0x6f,
      0x00, 0x72, 0x00, 0x6c, 0x00, 0x64, 0x00
    ]).toString('utf16le'),
    'hello world'
  )
})

test('utf16le write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('hello world', 'utf16le'))

  t.is(buffer.write('hello world', 'utf16le'), 22)

  t.alike(buffer, Buffer.from('hello world', 'utf16le'))
})
