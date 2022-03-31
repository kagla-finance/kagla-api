export const mapWithIndex = <T>(mapper: (index: number) => T, length: number) =>
  Array.from(new Array(length)).map((_, idx) => mapper(idx))

export const unique = <T>(array: T[]) => Array.from(new Set(array))
