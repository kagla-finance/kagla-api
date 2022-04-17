type Falsy = null | undefined | false | '' | 0 | -0 | 0n | typeof NaN

export const mapWithIndex = <T>(mapper: (index: number) => T, length: number) =>
  Array.from(new Array(length)).map((_, idx) => mapper(idx))

export const unique = <T>(array: T[]) => Array.from(new Set(array))

export const filterFalsy = <T>(arg: T | Falsy): arg is T => !!arg
