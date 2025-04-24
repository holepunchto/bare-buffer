const test = require('brittle')
const Buffer = require('../..')

test('Buffer.compare(a, b)', async (t) => {
  const a = Buffer.alloc(64, 'a')
  const b = Buffer.alloc(64, 'b')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e7; i++) {
      Buffer.compare(a, b)
    }
  })

  t.comment(((1e7 / elapsed) * 1e3) | 0, 'ops/s')
})
