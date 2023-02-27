const test = require('brittle')
const Buffer = require('..')

test('alloc', (t) => {
  t.is(Buffer.alloc(42).byteLength, 42)
})

test('alloc with fill', (t) => {
  const buf = Buffer.alloc(5, 0xff)
  t.is(buf.byteLength, 5)
  for (let i = 0; i < 5; i++) t.is(buf[i], 0xff)
})

test('allocUnsafe', (t) => {
  t.is(Buffer.allocUnsafe(42).byteLength, 42)
})

test('allocUnsafeSlow', (t) => {
  t.is(Buffer.allocUnsafeSlow(42).byteLength, 42)
})

test('compare', (t) => {
  t.is(Buffer.compare(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3])), 0)
  t.is(Buffer.compare(Buffer.from([1, 3, 2]), Buffer.from([1, 2, 3])), 1)
  t.is(Buffer.compare(Buffer.from([1, 2, 3]), Buffer.from([1, 3, 2])), -1)
  t.is(Buffer.compare(Buffer.from([1, 2, 3, 4]), Buffer.from([1, 2, 3])), 1)
  t.is(Buffer.compare(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3, 4])), -1)
  t.is(Buffer.compare(Buffer.from([1, 2, 3, 4]), Buffer.from([1, 2, 3, 4])), 0)
  t.is(Buffer.compare(Buffer.from([1, 2, 4, 3]), Buffer.from([1, 2, 3, 4])), 1)
  t.is(Buffer.compare(Buffer.from([1, 2, 3, 4]), Buffer.from([1, 2, 4, 3])), -1)

  t.test('varying lengths', (t) => {
    for (let i = 0; i < 10; i++) {
      t.is(Buffer.compare(Buffer.alloc(i), Buffer.alloc(i)), 0, `length ${i}`)
    }
  })

  t.test('varying alignment', (t) => {
    for (let i = 0; i < 10; i++) {
      t.is(Buffer.compare(Buffer.alloc(i).subarray(i), Buffer.alloc(i).subarray(i)), 0, `offset ${i}`)
    }
  })
})

test('concat', (t) => {
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])]), Buffer.from([1, 2, 3, 4, 5, 6]))
})

test('copy', (t) => {
  const x = Buffer.from([1, 2, 3])
  const y = Buffer.alloc(3)

  t.is(x.copy(y), 3)
  t.alike(y, x)

  t.test('within self', (t) => {
    const x = Buffer.from([1, 2, 3, 0, 0, 0])

    t.is(x.copy(x, 3), 3)
    t.alike(x, Buffer.from([1, 2, 3, 1, 2, 3]))
  })
})

test('equals', (t) => {
  t.is(Buffer.from([1, 2, 3]).equals(Buffer.from([1, 2, 3])), true)
  t.is(Buffer.from([1, 3, 2]).equals(Buffer.from([1, 2, 3])), false)
  t.is(Buffer.from([1, 2, 3, 4]).equals(Buffer.from([1, 2, 3])), false)

  t.test('varying lengths', (t) => {
    for (let i = 0; i < 10; i++) {
      t.is(Buffer.alloc(i).equals(Buffer.alloc(i)), true, `length ${i}`)
    }
  })

  t.test('varying alignment', (t) => {
    for (let i = 0; i < 10; i++) {
      t.is(Buffer.alloc(i).subarray(i).equals(Buffer.alloc(i).subarray(i)), true, `offset ${i}`)
    }
  })
})

test('fill', (t) => {
  t.alike(Buffer.alloc(3).fill(1), Buffer.from([1, 1, 1]))
  t.alike(Buffer.alloc(3).fill(1, 1), Buffer.from([0, 1, 1]))
  t.alike(Buffer.alloc(3).fill(1, 1, 2), Buffer.from([0, 1, 0]))
  t.alike(Buffer.alloc(3).fill('ab'), Buffer.from([0x61, 0x62, 0x61]))
  t.alike(Buffer.alloc(3).fill('abcd', 'hex'), Buffer.from([0xab, 0xcd, 0xab]))
  t.alike(Buffer.alloc(3).fill('abcd', 1, 'hex'), Buffer.from([0, 0xab, 0xcd]))
  t.alike(Buffer.alloc(3).fill('ab', 1, 2, 'hex'), Buffer.from([0, 0xab, 0]))
})

test('indexOf', (t) => {
  t.is(Buffer.from([1, 2, 3]).indexOf(1), 0)
  t.is(Buffer.from([1, 2, 3]).indexOf(2), 1)
  t.is(Buffer.from([1, 2, 3]).indexOf(3), 2)
  t.is(Buffer.from([1, 2, 3]).indexOf(4), -1)

  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([1])), 0)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([1, 2])), 0)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([1, 2, 3])), 0)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([2])), 1)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([2, 3])), 1)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([3])), 2)

  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([4])), -1)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([1, 3])), -1)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([2, 1])), -1)
  t.is(Buffer.from([1, 2, 3]).indexOf(Buffer.from([3, 2, 1])), -1)

  t.is(Buffer.from([1, 2, 2, 3]).indexOf(Buffer.from([2])), 1)
})

test('lastIndexOf', (t) => {
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(1), 0)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(2), 1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(3), 2)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(4), -1)

  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([1])), 0)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([1, 2])), 0)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([1, 2, 3])), 0)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([2])), 1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([2, 3])), 1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([3])), 2)

  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([4])), -1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([1, 3])), -1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([2, 1])), -1)
  t.is(Buffer.from([1, 2, 3]).lastIndexOf(Buffer.from([3, 2, 1])), -1)

  t.is(Buffer.from([1, 2, 2, 3]).lastIndexOf(Buffer.from([2])), 2)
})

test('swap16', (t) => {
  t.alike(
    Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]).swap16(),
    Buffer.from([0x2, 0x1, 0x4, 0x3, 0x6, 0x5, 0x8, 0x7])
  )
})

test('swap32', (t) => {
  t.alike(
    Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]).swap32(),
    Buffer.from([0x4, 0x3, 0x2, 0x1, 0x8, 0x7, 0x6, 0x5])
  )
})

test('swap64', (t) => {
  t.alike(
    Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]).swap64(),
    Buffer.from([0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1])
  )
})
