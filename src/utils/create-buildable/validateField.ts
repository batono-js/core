import type {FieldDescriptor} from "./FieldBuilder.js";
import {ValidationError} from "./ValidationError.js";
import {isBuildableItem} from "./utils.js";

export function validateField(type: string, key: string, value: unknown, descriptor: FieldDescriptor) {
  if (value == null && descriptor.nullable) return
  if (value == null && descriptor.optional) return

  if (descriptor.many) {
    if (!Array.isArray(value)) {
      throw new ValidationError('invalid_array', type, key, `expected array, got ${typeof value}`)
    }

    value.forEach((item, i) => validateField(type, `${key}[${i}]`, item, {...descriptor, many: false}))
    return
  }

  if (descriptor.baseType === 'union') {
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
    return
  }

  if (descriptor.baseType === 'buildable') {
    if (!isBuildableItem(value)) {
      throw new ValidationError('invalid_buildable', type, key, `expected IBuildable, got ${typeof value}`)
    }
    return
  }

  if (typeof value !== descriptor.baseType) {
    throw new ValidationError('invalid_type', type, key, `expected ${descriptor.baseType}, got ${typeof value}`)
  }
}
