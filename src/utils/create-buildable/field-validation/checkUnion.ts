import {ValidationError} from "../ValidationError.js";
import type {FieldDescriptor} from "../FieldBuilder.js";
import {validateField} from "../validateField.js";

export const checkUnion = (
  type: string,
  key: string,
  value: unknown,
  descriptor: FieldDescriptor
) => {
  const typeErrors: string[] = []
  let typeValid = false
  for (const unionDescriptor of descriptor.union!) {
    try {
      validateField(type, key, value, unionDescriptor)
      typeValid = true
    } catch (e) {
      if (e instanceof ValidationError && e.code === 'invalid_type') {
        typeErrors.push(e.message)
      }
    }
  }

  if (!typeValid) {
    throw new ValidationError('invalid_union', type, key, `does not match any union type:\n${typeErrors.join('\n')}`)
  }
}

