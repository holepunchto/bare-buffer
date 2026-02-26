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

test('isUtf8', (t) => {
  t.is(Buffer.isUtf8(Buffer.from('foo')), true)
  t.is(Buffer.isUtf8(Buffer.of(0x80)), false)
})
