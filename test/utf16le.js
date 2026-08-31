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

test('utf16le lone surrogate write stays within byteLength', (t) => {
  // byteLength must predict at least as many bytes as write produces;
  // otherwise Buffer.alloc(byteLength).write(s) writes past the buffer.
  for (const s of ['\uD800', '\uDC00', '\uD800A', '\uDC00\uD800', 'A\uD800B']) {
    const len = Buffer.byteLength(s, 'utf16le')
    const guard = 4
    const buffer = Buffer.alloc(len + guard, 0xaa)
    const written = buffer.write(s, 0, len, 'utf16le')
    t.is(written, len, `write of ${JSON.stringify(s)} returns predicted length`)
    for (let i = len; i < buffer.byteLength; i++) {
      t.is(buffer[i], 0xaa, `byte ${i} after write of ${JSON.stringify(s)} untouched`)
    }
  }
})

test('utf16le toString at an odd byte offset', (t) => {
  const buffer = Buffer.from([0x11, 0x22, 0x33, 0x44])

  t.is(buffer.subarray(0, 2).toString('utf16le'), String.fromCharCode(0x2211))
  t.is(buffer.subarray(1, 3).toString('utf16le'), String.fromCharCode(0x3322))
  t.is(buffer.subarray(2, 4).toString('utf16le'), String.fromCharCode(0x4433))
})

test('utf16le write at an odd byte offset', (t) => {
  const buffer = Buffer.alloc(6)
  const odd = buffer.subarray(1, 5)

  t.is(odd.write('AB', 'utf16le'), 4)
  t.is(odd.toString('utf16le'), 'AB')
  t.alike([...buffer], [0x00, 0x41, 0x00, 0x42, 0x00, 0x00])
})

test('utf16le at an odd byte offset beyond the stack buffer', (t) => {
  const string = 'x'.repeat(2048)
  const buffer = Buffer.alloc(4097).subarray(1)

  t.is(buffer.write(string, 'utf16le'), 4096)
  t.is(buffer.toString('utf16le'), string)
})
