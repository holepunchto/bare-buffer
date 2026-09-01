const test = require('brittle')
const Buffer = require('..')
const binding = require('../binding')
const checked = require('../lib/checked')

// A typed callback declares its buffer and string arguments as handles, which V8
// passes through without checking, so the binding has to check them itself. Only
// the untyped callback runs until V8 has emitted the fast call, and it only does
// that for a call site that has run to completion often enough, so each case is
// warmed with an argument that checks out before being handed one that does not.
// That is also the order it happens in outside a test.
const ITERATIONS = 20000

function settles(t, cases, good, bad, expected) {
  for (const [name, call] of cases) {
    for (let i = 0; i < ITERATIONS; i++) call(good)

    const seen = new Set()

    for (let i = 0; i < ITERATIONS; i++) {
      try {
        seen.add(`returned ${checked(call(bad))}`)
      } catch (err) {
        seen.add(`threw ${err.name}`)
      }
    }

    t.alike([...seen], [expected], name)
  }
}

test('a string argument is checked on either path', (t) => {
  const store = new ArrayBuffer(8)

  const cases = [
    ['writeUTF8', (v) => binding.writeUTF8(store, 0, 8, v)],
    ['writeUTF16LE', (v) => binding.writeUTF16LE(store, 0, 8, v)],
    ['writeLatin1', (v) => binding.writeLatin1(store, 0, 8, v)],
    ['writeBase64', (v) => binding.writeBase64(store, 0, 8, v)],
    ['writeHex', (v) => binding.writeHex(store, 0, 8, v)],
    ['byteLengthUTF8', (v) => binding.byteLengthUTF8(v)]
  ]

  for (const value of [{}, 0, [], null, Symbol('s')]) {
    settles(t, cases, 'aabb', value, 'threw TypeError')
  }

  // Warming writes, so the store can only be checked against a call site that is
  // already hot, which the cases above have left it.
  new Uint8Array(store).fill(0)

  for (const [, call] of cases) {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        call({})
      } catch {}
    }
  }

  t.alike([...new Uint8Array(store)], [0, 0, 0, 0, 0, 0, 0, 0], 'the store is untouched')
})

test('a buffer argument is checked on either path', (t) => {
  const store = new ArrayBuffer(8)

  const cases = [
    ['validateUTF8', (b) => binding.validateUTF8(b, 0, 8)],
    ['validateAscii', (b) => binding.validateAscii(b, 0, 8)],
    ['swap16', (b) => binding.swap16(b, 0, 8)],
    ['swap32', (b) => binding.swap32(b, 0, 8)],
    ['swap64', (b) => binding.swap64(b, 0, 8)],
    ['writeUTF8', (b) => binding.writeUTF8(b, 0, 8, 'yy')],
    ['compare a', (b) => binding.compare(b, 0, 8, store, 0, 8)],
    ['compare b', (b) => binding.compare(store, 0, 8, b, 0, 8)],
    ['indexOf', (b) => binding.indexOf(store, 0, 8, b, 0, 2, 0)],
    ['lastIndexOf', (b) => binding.lastIndexOf(store, 0, 8, b, 0, 2, 0)]
  ]

  settles(t, cases, store, { byteLength: 8 }, 'threw TypeError')
})

test('an out of bounds span is still a range error', (t) => {
  const store = new ArrayBuffer(8)

  const cases = [
    ['writeUTF8', (n) => binding.writeUTF8(store, 0, n, 'yy')],
    ['validateUTF8', (n) => binding.validateUTF8(store, 0, n)],
    ['swap16', (n) => binding.swap16(store, 0, n)],
    ['compare', (n) => binding.compare(store, 0, n, store, 0, 8)],
    ['indexOf', (n) => binding.indexOf(store, 0, n, store, 0, 2, 0)]
  ]

  settles(t, cases, 8, 9, 'threw RangeError')
})

test('write rejects anything but a string', (t) => {
  for (const value of [{}, [], 0, null, undefined, Buffer.from('yy')]) {
    t.exception.all(() => Buffer.alloc(8).write(value), /TypeError/, `write(${typeof value})`)
    t.exception.all(
      () => Buffer.alloc(8).write(value, 0, 4, 'hex'),
      /TypeError/,
      `write(${typeof value}, 0, 4, 'hex')`
    )
  }
})

// A detached or zero length store has no address, which the string and codec
// APIs would otherwise read as a request for the length a write would need.
test('a store with no address reports nothing written', (t) => {
  t.is(Buffer.alloc(0).write('abc'), 0, 'zero length')

  const store = new ArrayBuffer(8)
  const detached = Buffer.from(store)
  store.transfer()

  t.is(detached.write('abc'), 0, 'detached')

  const empty = new ArrayBuffer(0)

  t.is(binding.writeUTF8(empty, 0, 0, 'abc'), 0, 'writeUTF8')
  t.is(binding.writeUTF16LE(empty, 0, 0, 'abc'), 0, 'writeUTF16LE')
  t.is(binding.writeLatin1(empty, 0, 0, 'abc'), 0, 'writeLatin1')

  // Unlike the truncating codecs, these two decode all or nothing.
  t.is(binding.writeBase64(empty, 0, 0, 'AAAA'), -1, 'writeBase64')
  t.is(binding.writeHex(empty, 0, 0, 'aabb'), -1, 'writeHex')
  t.is(binding.writeBase64(empty, 0, 0, ''), 0, 'writeBase64 of nothing')
  t.is(binding.writeHex(empty, 0, 0, ''), 0, 'writeHex of nothing')
})

test('a resizable store is followed by the numeric accessors', (t) => {
  const store = new ArrayBuffer(8, { maxByteLength: 64 })
  const buffer = Buffer.from(store, 0)

  t.is(buffer.readDoubleBE(0), 0, 'in range to begin with')

  store.resize(64)

  t.is(buffer.byteLength, 64, 'the view grew')
  t.is(buffer.readDoubleBE(56), 0, 'and the accessors reach')

  store.resize(8)

  t.is(buffer.byteLength, 8, 'the view shrank')
  t.is(buffer.readDoubleBE(0), 0, 'what is left still reads')
  t.exception.all(() => buffer.readDoubleBE(56), /RangeError/, 'the rest does not')
})
