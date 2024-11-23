const test = require('brittle')
const Buffer = require('../..')

test("Buffer.from(string, 'utf16le')", async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('utf16le')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      Buffer.from(string, 'utf16le')
    }
  })

  t.comment(((1e5 / elapsed) * 1e3) | 0, 'ops/s')
})

test("buffer.toString('utf16le')", async (t) => {
  const buffer = Buffer.alloc(4 * 1024, 'a')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      buffer.toString('utf16le')
    }
  })

  t.comment(((1e5 / elapsed) * 1e3) | 0, 'ops/s')
})
