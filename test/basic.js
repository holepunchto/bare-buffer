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
      t.is(Buffer.compare(Buffer.alloc(i).subarray(i), Buffer.alloc(i).subarray(i)), 0, `offset ${i}`)
    }
  })
})

test('concat', (t) => {
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])]), Buffer.from([1, 2, 3, 4, 5, 6]))
})

test('concat with length', (t) => {
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 5), Buffer.from([1, 2, 3, 4, 5]))
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6], [7, 8, 9])], 5), Buffer.from([1, 2, 3, 4, 5]))
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 6), Buffer.from([1, 2, 3, 4, 5, 6]))
  t.alike(Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from([4, 5, 6])], 7), Buffer.from([1, 2, 3, 4, 5, 6, 0]))
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

test('isBuffer', (t) => {
  t.ok(Buffer.isBuffer(Buffer.alloc(4)))

  t.absent(Buffer.isBuffer(new Uint8Array(4)))

  t.absent(Buffer.isBuffer())
  t.absent(Buffer.isBuffer({}))
  t.absent(Buffer.isBuffer(null))

  class MyBuffer extends Buffer {}

  t.ok(Buffer.isBuffer(new MyBuffer(4)))
})

test('writeDoubleLE', (t) => {
  const value = 123.456

  const expectedBuffer = Buffer.from('77be9f1a2fdd5e40', 'hex')

  const buffer = Buffer.alloc(8)
  const bufferOffset = buffer.writeDoubleLE(value, 0)
  t.is(bufferOffset, 8)
  t.alike(buffer, expectedBuffer)
})

test('writeFloatLE', (t) => {
  const value = 0xcafebabe

  const expectedBuffer = Buffer.from('bbfe4a4f', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeFloatLE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('writeUInt16LE', (t) => {
  const expectedBuffer = Buffer.from('deadbeef', 'hex')

  const buffer = Buffer.alloc(4)

  t.is(buffer.writeUInt16LE(0xadde, 0), 2)
  t.is(buffer.writeUInt16LE(0xefbe, 2), 4)

  t.alike(buffer, expectedBuffer)
})

test('writeUInt32LE', (t) => {
  const value = 0xfeedface

  const expectedBuffer = Buffer.from('cefaedfe', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeUInt32LE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('writeInt32LE', (t) => {
  const value = 0x05060708

  const expectedBuffer = Buffer.from('08070605', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeInt32LE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('readDoubleLE', (t) => {
  const buffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])

  const actual = buffer.readDoubleLE()
  const expected = 5.447603722011605e-270
  t.is(actual, expected)
})

test('readFloatLE', (t) => {
  const buffer = Buffer.from([1, 2, 3, 4])

  const actual = buffer.readFloatLE()
  const expected = 1.539989614439558e-36
  t.is(actual, expected)
})

test('readUInt16LE', (t) => {
  const buffer = Buffer.from([0x12, 0x34])

  const actual = buffer.readUInt16LE().toString(16)
  const expected = '3412'
  t.is(actual, expected)
})

test('readUInt32LE', (t) => {
  const buffer = Buffer.from([0x12, 0x34, 0x56, 0x78])

  const actual = buffer.readUInt32LE().toString(16)
  const expected = '78563412'
  t.is(actual, expected)
})

test('readInt32LE', (t) => {
  const buffer = Buffer.from([0, 0, 0, 5])

  const actual = buffer.readInt32LE()
  const expected = 83886080
  t.is(actual, expected)
})

test('writeDoubleBE', (t) => {
  const value = 123.456

  const expectedBuffer = Buffer.from('405edd2f1a9fbe77', 'hex')

  const buffer = Buffer.alloc(8)
  const bufferOffset = buffer.writeDoubleBE(value, 0)
  t.is(bufferOffset, 8)
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

test('writeUInt16BE', (t) => {
  const expectedBuffer = Buffer.from('deadbeef', 'hex')

  const buffer = Buffer.alloc(4)

  t.is(buffer.writeUInt16BE(0xdead, 0), 2)
  t.is(buffer.writeUInt16BE(0xbeef, 2), 4)

  t.alike(buffer, expectedBuffer)
})

test('writeUInt32BE', (t) => {
  const value = 0xfeedface

  const expectedBuffer = Buffer.from('feedface', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeUInt32BE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

test('writeInt32BE', (t) => {
  const value = 0x05060708

  const expectedBuffer = Buffer.from('05060708', 'hex')

  const buffer = Buffer.alloc(4)
  const bufferOffset = buffer.writeInt32BE(value, 0)
  t.is(bufferOffset, 4)
  t.alike(buffer, expectedBuffer)
})

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

test('readDoubleBE', (t) => {
  const buffer = Buffer.from([8, 7, 6, 5, 4, 3, 2, 1])

  const actual = buffer.readDoubleBE()
  const expected = 5.447603722011605e-270
  t.is(actual, expected)
})

test('readFloatBE', (t) => {
  const buffer = Buffer.from([4, 3, 2, 1])

  const actual = buffer.readFloatBE()
  const expected = 1.539989614439558e-36
  t.is(actual, expected)
})

test('readUInt16BE', (t) => {
  const buffer = Buffer.from([0x78, 0x56, 0x34, 0x12])

  const actual = buffer.readUInt16BE(2).toString(16)
  const expected = '3412'
  t.is(actual, expected)
})

test('readUInt32BE', (t) => {
  const buffer = Buffer.from([0x78, 0x56, 0x34, 0x12])

  const actual = buffer.readUInt32BE().toString(16)
  const expected = '78563412'
  t.is(actual, expected)
})

test('readInt32BE', (t) => {
  const buffer = Buffer.from([5, 0, 0, 0])

  const actual = buffer.readInt32BE()
  const expected = 83886080
  t.is(actual, expected)
})

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
