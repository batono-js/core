const resolve = <T>(value: T | (() => T)) => {
  return (typeof value === 'function' ? (value as () => T)() : value)
}

export class When<T> {
  readonly #matched: boolean
  readonly #value: T | false

  constructor(condition: boolean, value: T | (() => T)) {
    this.#matched = condition
    this.#value = condition ? resolve(value) : false
  }

  else<U>(fallback: U | (() => U)): T | U {
    if (this.#matched) return this.#value as T
    return resolve(fallback)
  }

  elseif<U>(condition: boolean, value: U | (() => U)): When<T | U> {
    if (this.#matched) return new When<T | U>(true, this.#value as T)
    return new When<T | U>(condition, value)
  }

  valueOf(): T | false {
    return this.#value
  }
}

export function when<T>(condition: boolean, value: (() => T) | T): When<T> {
  return new When(condition, value)
}
