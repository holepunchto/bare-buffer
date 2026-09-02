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

function settles(t, cases, good, bad, expected, describe = (err) => `threw ${err.name}`) {
  for (const [name, call] of cases) {
    for (let i = 0; i < ITERATIONS; i++) call(good)

    const seen = new Set()

    for (let i = 0; i < ITERATIONS; i++) {
      try {
        seen.add(`returned ${checked(call(bad))}`)
      } catch (err) {
        seen.add(describe(err))
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

// The untyped callback checks the type of every argument before it looks at any
// span, so a typed callback that sliced first would report a range error where
// the untyped one reports a type error. Only a call that gets a type and a span
// wrong at once can tell the two orders apart.
test('the argument that comes first wins on either path', (t) => {
  const store = new ArrayBuffer(8)
  const wrong = { byteLength: 8 }

  // A bad buffer alongside a span that is also out of bounds. The type error has
  // to win, or the fast path reports a range error the untyped path never would.
  settles(
    t,
    [
      ['compare', ([n, b]) => binding.compare(store, 0, n, b, 0, 8)],
      ['indexOf', ([n, b]) => binding.indexOf(store, 0, n, b, 0, 2, 0)],
      ['lastIndexOf', ([n, b]) => binding.lastIndexOf(store, 0, n, b, 0, 2, 0)]
    ],
    [8, store],
    [9, wrong],
    'threw TypeError'
  )

  // A bad buffer alongside a bad string. Both are type errors, so only the
  // message says which of the two arguments was reached first.
  settles(
    t,
    [
      ['writeUTF8', ([b, v]) => binding.writeUTF8(b, 0, 8, v)],
      ['writeUTF16LE', ([b, v]) => binding.writeUTF16LE(b, 0, 8, v)],
      ['writeLatin1', ([b, v]) => binding.writeLatin1(b, 0, 8, v)],
      ['writeBase64', ([b, v]) => binding.writeBase64(b, 0, 8, v)],
      ['writeHex', ([b, v]) => binding.writeHex(b, 0, 8, v)]
    ],
    [store, 'aabb'],
    [wrong, 0],
    'Buffer must be an array buffer',
    (err) => err.message
  )
})

// A start before the first byte names no position, and neither does one past the
// last, so the forward search reports no match for either. The backward search
// still has the whole buffer behind a start past the end, but nothing behind one
// before the beginning. A start is compared as a signed 64 bit value so that it
// cannot wrap into range where size_t is narrower.
test('a start outside the buffer finds nothing forwards', (t) => {
  const store = new ArrayBuffer(8)
  new Uint8Array(store).fill(0x79)

  const needle = new ArrayBuffer(1)
  new Uint8Array(needle)[0] = 0x79

  const before = [-1, -8, -4294967296, -9007199254740991]
  const after = [8, 9, 4294967296, 9007199254740991]

  for (const start of [...before, ...after]) {
    t.is(binding.indexOf(store, 0, 8, needle, 0, 1, start), -1, `indexOf from ${start}`)
  }

  for (const start of before) {
    t.is(binding.lastIndexOf(store, 0, 8, needle, 0, 1, start), -1, `lastIndexOf from ${start}`)
  }

  for (const start of after) {
    t.is(binding.lastIndexOf(store, 0, 8, needle, 0, 1, start), 7, `lastIndexOf from ${start}`)
  }
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

// A length past the maximum reaches the allocator as a size_t, which on a 64 bit
// target simply fails to allocate but on a 32 bit one wraps to a much shorter
// buffer, so the binding has to turn it away before narrowing it.
test('alloc rejects a length the platform cannot represent', (t) => {
  const max = binding.constants.MAX_LENGTH

  t.exception.all(() => binding.alloc(max + 1), /RangeError/, 'alloc')
  t.exception.all(() => binding.allocUnsafe(max + 1), /RangeError/, 'allocUnsafe')

  t.exception.all(() => binding.alloc(2 ** 60), /RangeError/, 'alloc past a size_t')
  t.exception.all(() => binding.allocUnsafe(2 ** 60), /RangeError/, 'allocUnsafe past a size_t')
})

// The encoded length is known before any of it is written, so a result too long
// to be a string is turned away without allocating or encoding it first. The
// error is the one the string APIs raise for the same length, so this pins the
// two paths together rather than the saving itself.
test('a conversion too long to be a string is rejected up front', (t) => {
  const max = binding.constants.MAX_STRING_LENGTH

  const cases = [
    ['toStringHex', binding.toStringHex, Math.floor(max / 2) + 1],
    ['toStringBase64', binding.toStringBase64, Math.floor(max / 4) * 3 + 1],
    ['toStringBase64URL', binding.toStringBase64URL, Math.ceil((max * 3) / 4) + 1]
  ]

  for (const [name, convert, size] of cases) {
    let store

    // Uninitialized, so the pages are only touched if the conversion runs.
    try {
      store = binding.allocUnsafe(size)
    } catch {
      t.comment(`${name} skipped, could not allocate ${size} bytes`)
      continue
    }

    t.exception.all(() => convert(store, 0, size), /RangeError/, name)
  }
})
