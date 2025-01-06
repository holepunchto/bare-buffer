const test = require('brittle')
const Buffer = require('../..')

test("Buffer.byteLength(string, 'utf8')", async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('utf8')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e6; i++) {
      Buffer.byteLength(string, 'utf8')
    }
  })

  t.comment(((1e6 / elapsed) * 1e3) | 0, 'ops/s')
})

test("Buffer.from(string, 'utf8')", async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('utf8')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e6; i++) {
      Buffer.from(string, 'utf8')
    }
  })

  t.comment(((1e6 / elapsed) * 1e3) | 0, 'ops/s')
})

test("buffer.toString('utf8')", async (t) => {
  const buffer = Buffer.alloc(4 * 1024, 'a')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e6; i++) {
      buffer.toString('utf8')
    }
  })

  t.comment(((1e6 / elapsed) * 1e3) | 0, 'ops/s')
})
