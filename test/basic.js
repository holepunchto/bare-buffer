const test = require('brittle')
const Buffer = require('..')

test('from', (t) => {
  t.ok(Buffer.from('123'), 'from string')
  t.ok(Buffer.from([1, 2, 3]), 'from array')
  t.ok(Buffer.from(Buffer.from([1, 2, 3])), 'from buffer')
  t.ok(Buffer.from(new ArrayBuffer(8)), 'from arraybuffer')
})

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

test('byteLength', (t) => {
  t.is(Buffer.byteLength(Buffer.alloc(42)), 42)
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
      t.is(
        Buffer.compare(
          Buffer.alloc(i).subarray(i),
          Buffer.alloc(i).subarray(i)
        ),
        0,
        `offset ${i}`
      )
    }
  })
})

test('concat', (t) => {
  t.alike(
    Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])]),
    Buffer.from([1, 2, 3, 4, 5, 6])
  )
})

test('concat with length', (t) => {
  t.alike(
    Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 5),
    Buffer.from([1, 2, 3, 4, 5])
  )
  t.alike(
    Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 5),
    Buffer.from([1, 2, 3, 4, 5])
  )
  t.alike(
    Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 6),
    Buffer.from([1, 2, 3, 4, 5, 6])
  )
  t.alike(
    Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 7),
    Buffer.from([1, 2, 3, 4, 5, 6, 0])
  )
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
      t.is(
        Buffer.alloc(i).subarray(i).equals(Buffer.alloc(i).subarray(i)),
        true,
        `offset ${i}`
      )
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

test('isBuffer', (t) => {
  t.ok(Buffer.isBuffer(Buffer.alloc(4)))

  t.absent(Buffer.isBuffer(new Uint8Array(4)))

  t.absent(Buffer.isBuffer())
  t.absent(Buffer.isBuffer({}))
  t.absent(Buffer.isBuffer(null))

  class MyBuffer extends Buffer {}

  t.ok(Buffer.isBuffer(new MyBuffer(4)))

  // Reenable when global.Buffer is updated
  // t.unlike(Buffer, global.Buffer)
  // t.ok(Buffer.isBuffer(global.Buffer.alloc(4)))
})

test('readInt8', (t) => assertRead(t, { byteSize: 8, signed: false }))
test('readUInt8', (t) => assertRead(t, { byteSize: 8, signed: true }))

test('readInt16LE', (t) =>
  assertRead(t, { byteSize: 16, signed: true, littleEndian: true }))
test('readInt32LE', (t) =>
  assertRead(t, { byteSize: 32, signed: true, littleEndian: true }))
test('readBigInt64LE', (t) =>
  assertRead(t, { byteSize: 64, signed: true, littleEndian: true }))

test('readInt16BE', (t) =>
  assertRead(t, { byteSize: 16, signed: true, littleEndian: false }))
test('readInt32BE', (t) =>
  assertRead(t, { byteSize: 32, signed: true, littleEndian: false }))
test('readBigInt64BE', (t) =>
  assertRead(t, { byteSize: 64, signed: true, littleEndian: false }))

test('readUInt16LE', (t) =>
  assertRead(t, { byteSize: 16, signed: false, littleEndian: true }))
test('readUInt32LE', (t) =>
  assertRead(t, { byteSize: 32, signed: false, littleEndian: true }))
test('readBigUInt64LE', (t) =>
  assertRead(t, { byteSize: 64, signed: false, littleEndian: true }))

test('readUInt16BE', (t) =>
  assertRead(t, { byteSize: 16, signed: false, littleEndian: false }))
test('readUInt32BE', (t) =>
  assertRead(t, { byteSize: 32, signed: false, littleEndian: false }))
test('readBigUInt64BE', (t) =>
  assertRead(t, { byteSize: 64, signed: false, littleEndian: false }))

test('readInt32BE - top bit set', (t) => {
  const buffer = Buffer.from([0xff, 0xff, 0xff, 0xff])

  let actual = buffer.readInt32BE()
  let expected = -1
  t.is(actual, expected)

  const bufferMax = Buffer.from([0x80, 0, 0, 0x1])

  actual = bufferMax.readInt32BE()
  expected = -1 * 0x7fffffff
  t.is(actual, expected)

  const bufferSub1 = Buffer.from([0x80, 0, 0, 0])

  actual = bufferSub1.readInt32BE()
  expected = -1 * 0x80000000
  t.is(actual, expected)
})

test('readFloatLE', (t) => {
  const buffer = Buffer.from([1, 2, 3, 4])

  const actual = buffer.readFloatLE()
  const expected = 1.539989614439558e-36
  t.is(actual, expected)
})

test('readFloatBE', (t) => {
  const buffer = Buffer.from([4, 3, 2, 1])

  const actual = buffer.readFloatBE()
  const expected = 1.539989614439558e-36
  t.is(actual, expected)
})

test('readDoubleLE', (t) => {
  const buffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])

  const actual = buffer.readDoubleLE()
  const expected = 5.447603722011605e-270
  t.is(actual, expected)
})

test('readDoubleBE', (t) => {
  const buffer = Buffer.from([8, 7, 6, 5, 4, 3, 2, 1])

  const actual = buffer.readDoubleBE()
  const expected = 5.447603722011605e-270
  t.is(actual, expected)
})

test('writeInt8', (t) => assertWrite(t, { byteSize: 8, signed: false }))
test('writeUInt8', (t) => assertWrite(t, { byteSize: 8, signed: true }))

test('writeInt16LE', (t) =>
  assertWrite(t, { byteSize: 16, signed: true, littleEndian: true }))
test('writeInt32LE', (t) =>
  assertWrite(t, { byteSize: 32, signed: true, littleEndian: true }))
test('writeBigInt64LE', (t) =>
  assertWrite(t, { byteSize: 64, signed: true, littleEndian: true }))

test('writeInt16BE', (t) =>
  assertWrite(t, { byteSize: 16, signed: true, littleEndian: false }))
test('writeInt32BE', (t) =>
  assertWrite(t, { byteSize: 32, signed: true, littleEndian: false }))
test('writeBigInt64BE', (t) =>
  assertWrite(t, { byteSize: 64, signed: true, littleEndian: false }))

test('writeUInt16LE', (t) =>
  assertWrite(t, { byteSize: 16, signed: false, littleEndian: true }))
test('writeUInt32LE', (t) =>
  assertWrite(t, { byteSize: 32, signed: false, littleEndian: true }))
test('writeBigUInt64LE', (t) =>
  assertWrite(t, { byteSize: 64, signed: false, littleEndian: true }))

test('writeUInt16BE', (t) =>
  assertWrite(t, { byteSize: 16, signed: false, littleEndian: false }))
test('writeUInt32BE', (t) =>
  assertWrite(t, { byteSize: 32, signed: false, littleEndian: false }))
test('writeBigUInt64BE', (t) =>
  assertWrite(t, { byteSize: 64, signed: false, littleEndian: false }))

test('writeInt32BE - top bit set', (t) => {
  let value = -1

  const expectedBuffer = Buffer.from('ffffffff', 'hex')

  const buffer = Buffer.alloc(4)
  let bufferOffset = buffer.writeInt32BE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)

  const expectedMax = Buffer.from('80000000', 'hex')

  value = -1 * 0x80000000
  bufferOffset = buffer.writeInt32BE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedMax)

  const expectedMaxSub1 = Buffer.from('80000001', 'hex')

  value = -1 * 0x7fffffff
  bufferOffset = buffer.writeInt32BE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedMaxSub1)
})

test('writeFloatLE', (t) => {
  const value = 0xcafebabe

  const expectedBuffer = Buffer.from('bbfe4a4f', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeFloatLE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('writeFloatBE', (t) => {
  const value = 0xcafebabe

  const expectedBuffer = Buffer.from('4f4afebb', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeFloatBE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('writeDoubleLE', (t) => {
  const value = 123.456

  const expectedBuffer = Buffer.from('77be9f1a2fdd5e40', 'hex')

  const buffer = Buffer.alloc(8)
  const bufferOffset = buffer.writeDoubleLE(value, 0)
  t.is(bufferOffset, 8)
  t.alike(buffer, expectedBuffer)
})

test('writeDoubleBE', (t) => {
  const value = 123.456

  const expectedBuffer = Buffer.from('405edd2f1a9fbe77', 'hex')

  const buffer = Buffer.alloc(8)
  const bufferOffset = buffer.writeDoubleBE(value, 0)
  t.is(bufferOffset, 8)
  t.alike(buffer, expectedBuffer)
})

const inferMethodName = ({ prefix, byteSize, signed, littleEndian }) => {
  const b = byteSize === 64 ? 'Big' : ''
  const s = signed ? '' : 'U'
  const e = byteSize === 8 ? '' : littleEndian ? 'LE' : 'BE'

  return prefix + b + s + 'Int' + byteSize + e
}

const assertRead = (t, { byteSize, signed, littleEndian }) => {
  const method = inferMethodName({
    prefix: 'read',
    byteSize,
    signed,
    littleEndian
  })

  t.test('endianness', (t) => {
    const LE = [0xff, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12]
    const BE = [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xff]

    const buffer = Buffer.from(littleEndian ? LE : BE)
    const offset = littleEndian ? buffer.length - byteSize / 8 : 0

    const actual = buffer[method](offset).toString(16)
    const expected = '123456789abcdeff'.slice(0, byteSize / 4)

    t.is(actual, expected)
  })

  t.test('signedness', (t) => {
    const buffer = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])

    const actual = buffer[method]()

    const expectedUnsigned =
      byteSize === 64 ? 2n ** 64n - 1n : 2 ** byteSize - 1
    const expectedSigned = byteSize === 64 ? -1n : -1

    t.is(actual, signed ? expectedSigned : expectedUnsigned)
  })
}

const assertWrite = (t, { byteSize, signed, littleEndian }) => {
  const method = inferMethodName({
    prefix: 'write',
    byteSize,
    signed,
    littleEndian
  })

  const LE = [0xde, 0xadde, 0xefbeadde, 0xefbeaddeefbeadden]
  const BE = [0xde, 0xdead, 0xdeadbeef, 0xdeadbeefdeadbeefn]

  const index = Math.log2(byteSize) - 3
  const bufferInput = littleEndian ? LE[index] : BE[index]

  const buffer = Buffer.alloc(byteSize / 8)
  const bufferOffset = buffer[method](bufferInput, 0)

  const expected = 'deadbeefdeadbeef'.slice(0, byteSize / 4)
  const expectedBuffer = Buffer.from(expected, 'hex')

  t.is(bufferOffset, byteSize / 8)
  t.alike(buffer, expectedBuffer)
}
