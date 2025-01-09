const test = require('brittle')
const Buffer = require('../..')

test("Buffer.byteLength(string, 'hex')", async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('hex')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e7; i++) {
      Buffer.byteLength(string, 'hex')
    }
  })

  t.comment(((1e7 / elapsed) * 1e3) | 0, 'ops/s')
})

test("Buffer.from(string, 'hex')", async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('hex')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      Buffer.from(string, 'hex')
    }
  })

  t.comment(((1e5 / elapsed) * 1e3) | 0, 'ops/s')
})

test("buffer.toString('hex')", async (t) => {
  const buffer = Buffer.alloc(4 * 1024, 'a')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      buffer.toString('hex')
    }
  })

  t.comment(((1e5 / elapsed) * 1e3) | 0, 'ops/s')
})
