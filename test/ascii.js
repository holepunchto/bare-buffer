const test = require('brittle')
const Buffer = require('..')

test('isASCII', (t) => {
  t.is(Buffer.isASCII(Buffer.from('a')), true)
  t.is(Buffer.isASCII(Buffer.from('\u00e3')), false)
})

test('isASCII with byte offset', (t) => {
  t.is(Buffer.isASCII(Buffer.from('\u00e3a').subarray(2)), true)
  t.is(Buffer.isASCII(Buffer.from('a\u00e3').subarray(1)), false)
})

test('toString', (t) => {
  t.is(Buffer.from('hello').toString('ascii'), 'hello')
  t.is(Buffer.alloc(0).toString('ascii'), '')

  // The high bit is unset when decoding, so bytes above 0x7f do not decode as
  // Latin-1 would.
  t.is(Buffer.of(0xe9, 0x41).toString('ascii'), 'iA')
  t.is(Buffer.of(0x80).toString('ascii'), '\x00')
  t.is(Buffer.of(0xff).toString('ascii'), '\x7f')

  t.test('with byte offset', (t) => {
    t.is(Buffer.from('xxhello').subarray(2).toString('ascii'), 'hello')
    t.is(Buffer.of(0x41, 0xe9, 0x42).subarray(1).toString('ascii'), 'iB')
  })

  t.test('range', (t) => {
    t.is(Buffer.from('hello').toString('ascii', 1, 3), 'el')
    t.is(Buffer.of(0x41, 0xe9, 0x42).toString('ascii', 1, 2), 'i')
  })
})

test('write', (t) => {
  const buffer = Buffer.alloc(6).fill(0xaa)

  t.is(buffer.write('abc', 'ascii'), 3, 'returns bytes written')
  t.alike(buffer, Buffer.of(0x61, 0x62, 0x63, 0xaa, 0xaa, 0xaa), 'rest untouched')

  t.is(Buffer.alloc(2).write('abcdef', 'ascii'), 2, 'truncates to the buffer')

  // Code units above 0xff are truncated to their low byte, as for Latin-1.
  const wide = Buffer.alloc(2).fill(0xaa)
  t.is(wide.write('\u00e9\u0100', 'ascii'), 2)
  t.alike(wide, Buffer.of(0xe9, 0x00))
})
