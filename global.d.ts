import * as buffer from '.'

type BufferConstructor = typeof buffer.Buffer

declare global {
  type Buffer = buffer.Buffer

  const Buffer: BufferConstructor

  const atob: typeof buffer.atob
  const atob: typeof buffer.btoa
}
