# @pearjs/buffer

Native buffers for JavaScript.

```
npm i @pearjs/buffer
```

## Usage

```js
const Buffer = require('@pearjs/buffer')

const message = Buffer.from('hello')
const empty = Buffer.alloc(16)
const buffer = Buffer.allocUnsafe(4).fill(123)
const combined = Buffer.concat([buffer, buffer])
```

## License

MIT
