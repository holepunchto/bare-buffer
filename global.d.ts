import * as buffer from '.'

declare global {
  interface Buffer extends buffer.Buffer {}

  class Buffer extends buffer.Buffer {}
}
