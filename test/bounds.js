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
  t.is(buffer.write('yyyy'), 0, 'write')
  t.is(Buffer.isUTF8(buffer), false, 'isUTF8')
  t.is(Buffer.isASCII(buffer), false, 'isASCII')
  t.is(buffer.indexOf('yy'), -1, 'indexOf')
  t.exception.all(() => buffer.equals(Buffer.alloc(4096)), /RangeError/, 'equals')

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

test('something that only looks like a view is rejected', (t) => {
  const store = new ArrayBuffer(8)
  const wide = { buffer: store, byteOffset: 1 << 22, byteLength: 64 }
  const needle = { buffer: store, byteOffset: 1 << 22, byteLength: 8 }

  t.exception.all(() => Buffer.alloc(64).equals(wide), /TypeError/, 'equals')
  t.exception.all(() => Buffer.alloc(64).compare(wide), /TypeError/, 'compare')
  t.exception.all(() => Buffer.compare(wide, Buffer.alloc(64)), /TypeError/, 'compare a')
  t.exception.all(() => Buffer.compare(Buffer.alloc(64), wide), /TypeError/, 'compare b')
  t.exception.all(() => Buffer.alloc(64).indexOf(needle), /TypeError/, 'indexOf')
  t.exception.all(() => Buffer.alloc(64).lastIndexOf(needle), /TypeError/, 'lastIndexOf')
  t.exception.all(() => Buffer.alloc(64).includes(needle), /TypeError/, 'includes')
})

test('comparing never yields anything but a comparison', (t) => {
  const store = new ArrayBuffer(8)
  const lying = Object.setPrototypeOf(new Buffer(store, 0, 8), Wider.prototype)

  // A real view whose byteLength lies gets past the type check, so the range
  // check in the bindings is what catches it. It must not answer with a number
  // that reads as a comparison, nor with undefined.
  t.exception.all(() => lying.compare(Buffer.alloc(4096)), /RangeError/, 'compare')
  t.exception.all(() => Buffer.compare(lying, Buffer.alloc(4096)), /RangeError/, 'Buffer.compare')
  t.exception.all(() => lying.equals(Buffer.alloc(4096)), /RangeError/, 'equals')
})

test('an unusable range answers the same on either path', (t) => {
  const store = new ArrayBuffer(8)
  const buffer = Object.setPrototypeOf(new Buffer(store, 0, 8), Wider.prototype)

  const cases = [
    ['write', () => buffer.write('yyyy')],
    ['isUTF8', () => Buffer.isUTF8(buffer)],
    ['isASCII', () => Buffer.isASCII(buffer)],
    ['indexOf', () => buffer.indexOf('yy')],
    ['equals', () => buffer.equals(Buffer.alloc(4096))],
    ['compare', () => buffer.compare(Buffer.alloc(4096))]
  ]

  const outcome = (fn) => {
    try {
      return `returned ${fn()}`
    } catch (err) {
      return `threw ${err.name}`
    }
  }

  for (const [name, fn] of cases) {
    const cold = outcome(fn)
    const seen = new Set()

    for (let i = 0; i < 200000; i++) seen.add(outcome(fn))

    t.alike([...seen], [cold], name)
  }
})

test('a forged range is never reported as equal', (t) => {
  const secret = Buffer.from('super-secret-token')

  const forged = Object.setPrototypeOf(
    new Buffer(new ArrayBuffer(1), 0, 1),
    class extends Buffer {
      get byteLength() {
        return secret.byteLength
      }
    }.prototype
  )

  let equal = 0

  for (let i = 0; i < 200000; i++) {
    try {
      if (secret.equals(forged)) equal++
    } catch {}
  }

  t.is(equal, 0, 'no call reported equality')
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

test('an argument of the wrong type is rejected, not reinterpreted', (t) => {
  const buffer = Buffer.alloc(32)
  const forged = { byteLength: 16, a: 1.5 }

  for (const encoding of ['utf8', 'latin1', 'utf16le', 'ascii', 'hex', 'base64']) {
    t.exception.all(() => buffer.write(forged, encoding), /TypeError/, `write ${encoding}`)
  }
})

test('rejecting an argument of the wrong type survives the fast path', (t) => {
  const forged = { byteLength: 16, a: 1.5 }

  let threw = 0

  for (let i = 0; i < 200000; i++) {
    try {
      Buffer.alloc(32).write(forged, 'latin1')
    } catch {
      threw++
    }
  }

  t.is(threw, 200000, 'every call threw, and none aborted')
})

test('alloc rejects a length that is not a length', (t) => {
  for (const value of [{}, 'hello', [], null, true, () => {}]) {
    t.exception.all(() => Buffer.alloc(value), /TypeError|RangeError/, typeof value)
  }

  t.exception.all(() => Buffer.alloc(-1), /RangeError/, 'negative')
})

test('a write leaves the bytes it does not report untouched', (t) => {
  const cases = [
    ['ab', undefined, undefined, 2, '6162aaaaaaaaaaaa'],
    ['ab', 0, 8, 2, '6162aaaaaaaaaaaa'],
    ['\u{1F600}', 0, 3, 0, 'aaaaaaaaaaaaaaaa'],
    ['ÿ', 0, 1, 0, 'aaaaaaaaaaaaaaaa']
  ]

  for (const [string, offset, length, written, expected] of cases) {
    const buffer = Buffer.alloc(8).fill(0xaa)

    const actual =
      offset === undefined ? buffer.write(string) : buffer.write(string, offset, length)

    t.is(actual, written, `${JSON.stringify(string)} reports ${written}`)
    t.is(buffer.toString('hex'), expected, `${JSON.stringify(string)} writes only that much`)
  }
})
