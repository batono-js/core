import {ValidationError} from "../ValidationError.js";
import type {FieldDescriptor} from "../FieldBuilder.js";
import {typeOfForErrorMessage, validateField} from "../validateField.js";

export const checkArray = (
  type: string,
  key: string,
  value: unknown,
  descriptor: FieldDescriptor
) => {
  if (!Array.isArray(value)) {
    throw new ValidationError('invalid_array', type, key, `expected array, got ${typeOfForErrorMessage(value)}`)
  }
  value.forEach((item, i) => validateField(type, `${key}[${i}]`, item, {...descriptor, many: false}))
}
