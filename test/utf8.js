const test = require('brittle')
const Buffer = require('..')

test('utf8 byteLength', (t) => {
  t.is(Buffer.byteLength('hello world'), 11)
})

test('utf8 byteLength, fast path for multibyte strings', (t) => {
  let r
  for (let i = 0; i < 1000000; i++) {
    r = Buffer.byteLength('però')
  }
  t.is(r, 5)
})

test('utf8 toString', (t) => {
  t.is(Buffer.from('hello world').toString(), 'hello world')
})

test('utf8 toString with NULL byte', (t) => {
  t.is(Buffer.from('hello\0world').toString(), 'hello\0world')
})

test('utf8 write', (t) => {
  const buffer = Buffer.alloc(Buffer.byteLength('hello world'))

  buffer.write('hello world')

  t.alike(buffer, Buffer.from('hello world'))
})

test('utf8 write + toString, shared buffer', (t) => {
  const buffer = Buffer.from(new SharedArrayBuffer(Buffer.byteLength('hello world')))

  buffer.write('hello world')

  t.alike(buffer, Buffer.from('hello world'))

  t.is(buffer.toString(), 'hello world')
})

test('isUTF8', (t) => {
  t.is(Buffer.isUTF8(Buffer.from('foo')), true)
  t.is(Buffer.isUTF8(Buffer.of(0x80)), false)
})

test('utf8 lone surrogate write stays within byteLength', (t) => {
  // byteLength must predict at least as many bytes as write produces;
  // otherwise Buffer.alloc(byteLength).write(s) writes past the buffer.
  for (const s of ['\uD800', '\uDC00', '\uD800A', '\uDC00\uD800', 'A\uD800B']) {
    const len = Buffer.byteLength(s, 'utf8')
    const guard = 4
    const buffer = Buffer.alloc(len + guard, 0xaa)
    const written = buffer.write(s, 0, len, 'utf8')
    t.is(written, len, `write of ${JSON.stringify(s)} returns predicted length`)
    for (let i = len; i < buffer.byteLength; i++) {
      t.is(buffer[i], 0xaa, `byte ${i} after write of ${JSON.stringify(s)} untouched`)
    }
  }
})
