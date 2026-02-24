import {ValidationError} from "../ValidationError.js";
import {Scope} from "../../scope/index.js";
import {typeOfForErrorMessage} from "../validateField.js";

export const checkScope = (
  type: string,
  key: string,
  value: unknown,
) => {
  if (!(value instanceof Scope)) {
    throw new ValidationError('invalid_type', type, key, `expected Scope, got ${typeOfForErrorMessage(value)}`)
  }
}
