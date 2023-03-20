const test = require('brittle')
const Buffer = require('../..')

test('Buffer.from(string, \'base64\')', async (t) => {
  const string = Buffer.alloc(4 * 1024, 'a').toString('base64')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      Buffer.from(string, 'base64')
    }
  })

  t.comment(1e5 / elapsed * 1e3 | 0, 'ops/s')
})

test('buffer.toString(\'base64\')', async (t) => {
  const buffer = Buffer.alloc(4 * 1024, 'a')

  const elapsed = await t.execution(() => {
    for (let i = 0; i < 1e5; i++) {
      buffer.toString('base64')
    }
  })

  t.comment(1e5 / elapsed * 1e3 | 0, 'ops/s')
})
