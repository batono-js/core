import type {FieldDescriptor} from "./FieldBuilder.js";
import {ValidationError} from "./ValidationError.js";
import {isBuildableItem} from "./utils.js";
import {Scope} from "../scope/Scope.js";

export const typeOfForErrorMessage = (value: unknown) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return typeof value
}

export function validateField(type: string, key: string, value: unknown, descriptor: FieldDescriptor) {
  if (value == null && descriptor.nullable) return
  if (value == null && descriptor.optional) return

  if (descriptor.baseType === 'enum') {

    if (!descriptor.enumValues!.includes(value as string)) {
      throw new ValidationError('invalid_type', type, key,
        `expected one of ${descriptor.enumValues!.map(v => `"${v}"`).join(', ')}, got "${value}"`)
    }
    return
  }

  if (descriptor.baseType === 'record') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationError('invalid_type', type, key, `expected record, got ${typeOfForErrorMessage(value)}`)
    }
    for (const [recordKey, recordValue] of Object.entries(value as Record<string, unknown>)) {
      validateField(type, `${key}.${recordKey}`, recordValue, descriptor.recordValueType!)
    }
    return
  }

  if (descriptor.baseType === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationError('invalid_type', type, key, `expected object, got ${typeOfForErrorMessage(value)}`)
    }

    if (descriptor.objectSchema) {
      for (const [fieldKey, fieldDescriptor] of Object.entries(descriptor.objectSchema)) {
        const fieldValue = (value as Record<string, unknown>)[fieldKey]
        if (fieldValue === undefined) {
          if (!fieldDescriptor.optional) {
            throw new ValidationError('missing_field', type, `${key}.${fieldKey}`, 'is required')
          }
          continue
        }
        validateField(type, `${key}.${fieldKey}`, fieldValue, fieldDescriptor)
      }
    }
    return
  }

  if (descriptor.baseType === 'any') {
    return
  }

  if (descriptor.baseType === 'scope') {
    if (!(value instanceof Scope)) {
      throw new ValidationError('invalid_type', type, key, `expected Scope, got ${typeOfForErrorMessage(value)}`)
    }
    return
  }

  if (descriptor.many) {
    if (!Array.isArray(value)) {
      throw new ValidationError('invalid_array', type, key, `expected array, got ${typeOfForErrorMessage(value)}`)
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
