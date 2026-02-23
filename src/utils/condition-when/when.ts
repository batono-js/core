export class When<T> {
  readonly #matched: boolean
  readonly #value: T | false

  constructor(condition: boolean, value: T) {
    this.#matched = condition
    this.#value = condition ? value : false
  }

  else<U>(fallback: U): T | U {
    return this.#matched ? this.#value as T : fallback
  }

  elseif<U>(condition: boolean, value: U): When<T | U> {
    if (this.#matched) return new When<T | U>(true, this.#value as T)
    return new When<T | U>(condition, value)
  }

  valueOf(): T | false {
    return this.#value
  }
}

export function when<T>(condition: boolean, value: T): When<T> {
  return new When(condition, value)
}
