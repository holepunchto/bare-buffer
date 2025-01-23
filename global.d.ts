import * as buffer from '.'

type BufferConstructor = typeof buffer.Buffer

declare global {
  type Buffer = buffer.Buffer

  const Buffer: BufferConstructor
}
