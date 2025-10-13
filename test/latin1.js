const test = require('brittle')
const Buffer = require('..')

test('latin1 byteLength', (t) => {
  t.is(Buffer.byteLength('héllô çõrld', 'latin1'), 11)
})

test('latin1 toString', (t) => {
  t.is(
    Buffer.from([0x68, 0xe9, 0x6c, 0x6c, 0xf4, 0x20, 0xe7, 0xf5, 0x72, 0x6c, 0x64]).toString(
      'latin1'
    ),
    'héllô çõrld'
  )
})

test('latin1 write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('héllô çõrld', 'latin1'))

  buffer.write('héllô çõrld', 'latin1')

  t.alike(buffer, Buffer.from('héllô çõrld', 'latin1'))
})
