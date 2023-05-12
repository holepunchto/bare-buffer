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

## License

Apache-2.0
