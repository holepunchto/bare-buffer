const test = require('brittle')
const tinyBuffer = require('./index.js')

test('from', function (t) {
  t.alike([...tinyBuffer.from('hello')], [...Buffer.from('hello')])
})

test.skip('allocUnsafe', function (t) {})

test('alloc', function (t) {
  t.alike([...tinyBuffer.alloc(0)], [...Buffer.alloc(0)])
  t.alike([...tinyBuffer.alloc(1)], [...Buffer.alloc(1)])
  t.alike([...tinyBuffer.alloc(2)], [...Buffer.alloc(2)])
})

test('concat', function (t) {
  const a = tinyBuffer.alloc(2).fill(1)
  const b = tinyBuffer.alloc(2).fill(2)
  const combined = tinyBuffer.concat([a, b])
  t.alike([...combined], [...Buffer.from([1, 1, 2, 2])])
})
