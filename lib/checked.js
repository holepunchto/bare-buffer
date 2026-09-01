// A typed callback cannot raise, so the bindings report a range that does not
// check out with a result no successful call can produce. Both the typed and
// the untyped callback return it, so that the answer does not change once V8
// takes the fast path.
const OUT_OF_BOUNDS = -2147483648

module.exports = function checked(result) {
  if (result === OUT_OF_BOUNDS) {
    throw new RangeError('View is out of bounds of its backing store')
  }

  return result
}
