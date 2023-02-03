const test = require('brittle')
const Buffer = require('.')

test('from', function (t) {
  t.alike([...Buffer.from('hello')], [...Buffer.from('hello')])
})

test.skip('allocUnsafe', function (t) {})

test('alloc', function (t) {
  t.alike([...Buffer.alloc(0)], [...Buffer.alloc(0)])
  t.alike([...Buffer.alloc(1)], [...Buffer.alloc(1)])
  t.alike([...Buffer.alloc(2)], [...Buffer.alloc(2)])
})

test('concat', function (t) {
  const a = Buffer.alloc(2).fill(1)
  const b = Buffer.alloc(2).fill(2)
  const combined = Buffer.concat([a, b])
  t.alike([...combined], [...Buffer.from([1, 1, 2, 2])])
})
