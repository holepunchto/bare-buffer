const test = require('brittle')
const Buffer = require('..')

class Wider extends Buffer {
  get byteLength() {
    return 4096
  }
}

test('an overstated byteLength makes the bindings do nothing', (t) => {
  const store = new ArrayBuffer(8)
  const buffer = Object.setPrototypeOf(new Buffer(store, 0, 8), Wider.prototype)

  t.is(buffer.toString('hex'), undefined, 'toString hex')
  t.is(buffer.toString('utf8'), undefined, 'toString utf8')
  t.is(buffer.toString('base64'), undefined, 'toString base64')
  t.is(buffer.toString('utf16le'), undefined, 'toString utf16le')
  t.is(buffer.write('yyyy'), undefined, 'write')
  t.is(Buffer.isUTF8(buffer), undefined, 'isUTF8')
  t.is(Buffer.isASCII(buffer), undefined, 'isASCII')
  t.is(buffer.indexOf('yy'), undefined, 'indexOf')
  t.is(buffer.equals(Buffer.alloc(4096)), false, 'equals')

  t.alike([...new Uint8Array(store)], [0, 0, 0, 0, 0, 0, 0, 0], 'the store is untouched')
})

test('the backing store is the boundary, not the view', (t) => {
  const poolSize = Buffer.poolSize

  t.teardown(() => {
    Buffer.poolSize = poolSize
  })

  Buffer.poolSize = 65536

  const pooled = Object.setPrototypeOf(Buffer.from('x'), Wider.prototype)

  t.is(pooled.toString('hex').length, 4096 * 2, 'a pooled view reads within its pool')
  t.is(new Uint8Array(Buffer.from('x').buffer).byteLength, 65536, 'as .buffer already does')
})

test('a forged range makes the bindings do nothing', (t) => {
  const store = new ArrayBuffer(8)
  const wide = { buffer: store, byteOffset: 1 << 22, byteLength: 64 }
  const needle = { buffer: store, byteOffset: 1 << 22, byteLength: 8 }

  t.is(Buffer.alloc(64).equals(wide), false, 'equals')
  t.is(Buffer.alloc(64).compare(wide), undefined, 'compare')
  t.is(Buffer.compare(wide, Buffer.alloc(64)), undefined, 'compare a')
  t.is(Buffer.compare(Buffer.alloc(64), wide), undefined, 'compare b')
  t.is(Buffer.alloc(64).indexOf(needle), undefined, 'indexOf')
  t.is(Buffer.alloc(64).lastIndexOf(needle), undefined, 'lastIndexOf')
})

test('either kind of backing store is accepted', (t) => {
  const stores = [
    ['ArrayBuffer', new ArrayBuffer(4)],
    ['SharedArrayBuffer', new SharedArrayBuffer(4)],
    ['resizable ArrayBuffer', new ArrayBuffer(4, { maxByteLength: 16 })],
    ['growable SharedArrayBuffer', new SharedArrayBuffer(4, { maxByteLength: 16 })]
  ]

  for (const [name, store] of stores) {
    const buffer = Buffer.from(store)

    buffer.write('ab')

    t.is(buffer.toString('latin1', 0, 2), 'ab', name)
  }
})

test('invalid encoded input is still reported', (t) => {
  t.exception.all(() => Buffer.from('AAAAA', 'base64'), /Invalid input/)
  t.exception.all(() => Buffer.from('abc', 'hex'), /Invalid input/)
  t.exception.all(() => Buffer.alloc(2).write('aabbcc', 'hex'), /Invalid input/)
})

test('reporting invalid input survives the fast path', (t) => {
  let threw = 0

  for (let i = 0; i < 200000; i++) {
    try {
      Buffer.from('A', 'base64')
    } catch {
      threw++
    }
  }

  t.is(threw, 200000, 'every call threw, and none aborted')
})

test('from copies a view element wise', (t) => {
  t.alike([...Buffer.from(new Uint16Array([0x11, 0x22]))], [0x11, 0x22])
  t.alike([...Buffer.from(new Uint32Array([1, 2]))], [1, 2])
  t.alike([...Buffer.from(new Int8Array([-1, 2]))], [0xff, 2])
  t.is(Buffer.from(new DataView(new ArrayBuffer(8))).byteLength, 0)
})

test('concat rejects anything but a Uint8Array', (t) => {
  t.exception.all(() => Buffer.concat([new Uint16Array(4)]), /TypeError/)
  t.exception.all(() => Buffer.concat([new DataView(new ArrayBuffer(8))]), /TypeError/)
  t.exception.all(() => Buffer.concat([Buffer.alloc(1), new Uint32Array(1)]), /TypeError/)
})

test('concat leaves no byte uninitialized', (t) => {
  for (let length = 0; length < 40; length++) {
    const result = Buffer.concat([Buffer.from('ab'), Buffer.from('cd')], length)
    const expected = Buffer.alloc(length)

    expected.write('abcd'.slice(0, length))

    t.alike(result, expected, `length ${length}`)
  }
})
