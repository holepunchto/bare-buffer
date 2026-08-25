# bare-buffer

Native buffers for JavaScript.

```
npm i bare-buffer
```

## Usage

```js
const Buffer = require('bare-buffer')

const message = Buffer.from('hello')
const empty = Buffer.alloc(16)
const buffer = Buffer.allocUnsafe(4).fill(123)
const combined = Buffer.concat([buffer, buffer])
```

## API

See the [`bare-buffer` reference](https://docs.pears.com/reference/bare/modules/bare-buffer).

## License

Apache-2.0
