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

test('hex write odd length throws', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('abc', 'hex'))

  t.exception(() => buffer.write('abc', 'hex'))
})

test('hex write non-ascii utf16 code unit throws', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('6€', 'hex'))

  t.exception(() => buffer.write('6€', 'hex'))
})

test('toString across the stack encoding boundary', (t) => {
  // Results are encoded on the stack up to a fixed length and on the heap beyond
  // it, so round trip either side of where that switches over for each encoding.
  const sizes = [0, 1, 15, 16, 17, 510, 511, 512, 513, 767, 768, 769, 1023, 1024, 1025, 4096]

  for (const size of sizes) {
    const buffer = Buffer.alloc(size)
    for (let i = 0; i < size; i++) buffer[i] = (i * 37 + 11) & 0xff

    for (const encoding of ['hex', 'base64', 'base64url']) {
      const encoded = buffer.toString(encoding)

      t.alike(Buffer.from(encoded, encoding), buffer, `${encoding} round trip at ${size}`)

      if (size > 4) {
        const view = buffer.subarray(3)

        t.alike(
          Buffer.from(view.toString(encoding), encoding),
          view,
          `${encoding} round trip on a view at ${size}`
        )
      }
    }
  }

  t.test('results stay valid once the encoding buffer is gone', (t) => {
    const kept = []

    for (let i = 0; i < 200; i++) {
      const buffer = Buffer.alloc(1 + ((i * 13) % 600), i & 0xff)
      kept.push([buffer, buffer.toString('hex')])
    }

    for (const [buffer, hex] of kept) {
      t.alike(Buffer.from(hex, 'hex'), buffer)
    }
  })
})
