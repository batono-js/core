import {ValidationError} from "../ValidationError.js";
import type {FieldDescriptor} from "../FieldBuilder.js";
import {typeOfForErrorMessage, validateField} from "../validateField.js";

const assertObject = (
  value: unknown,
  type: string,
  key: string,
  baseType: string
): void => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError('invalid_type', type, key, `expected ${baseType}, got ${typeOfForErrorMessage(value)}`)
  }
}
export const checkObject = (
  type: string,
  key: string,
  value: unknown,
  descriptor: FieldDescriptor
) => {

  assertObject(value, type, key, descriptor.baseType)

  if (descriptor.baseType === 'record') {
    for (const [recordKey, recordValue] of Object.entries(value as Record<string, unknown>)) {
      validateField(type, `${key}.${recordKey}`, recordValue, descriptor.recordValueType!)
    }
  } else if (descriptor.baseType === 'object' && descriptor.objectSchema) {

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
}
