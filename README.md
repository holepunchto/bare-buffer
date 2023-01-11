# tiny-buffers

Buffer backed by Int8Array

```
npm i tiny-buffers
```

## Usage
```javascript
const Buffer = require('tiny-buffers')

const message = Buffer.from('hello')
const empty = Buffer.alloc(16)
const buffer = Buffer.allocUnsafe(4).fill(123)
const combined = Buffer.concat([buffer, buffer])
```

## License
MIT
