import type {FieldDescriptor} from "./FieldBuilder.js";
import {ValidationError} from "./ValidationError.js";
import {checkEnum} from "./field-validation/checkEnum.js";
import {checkObject} from "./field-validation/checkObject.js";
import {checkScope} from "./field-validation/checkScope.js";
import {checkArray} from "./field-validation/checkArray.js";
import {checkUnion} from "./field-validation/checkUnion.js";
import {checkBuildable} from "./field-validation/checkBuildable.js";

export const typeOfForErrorMessage = (value: unknown) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return typeof value
}

export function validateField(type: string, key: string, value: unknown, descriptor: FieldDescriptor) {
  if (value == null && (descriptor.nullable || descriptor.optional)) return
  if (descriptor.baseType === 'any') return
  if (descriptor.baseType === 'enum') return checkEnum(type, key, value, descriptor)
  if (descriptor.baseType === 'record' || descriptor.baseType === 'object') return checkObject(type, key, value, descriptor)
  if (descriptor.baseType === 'scope') return checkScope(type, key, value)
  if (descriptor.many) return checkArray(type, key, value, descriptor)
  if (descriptor.baseType === 'union') return checkUnion(type, key, value, descriptor)
  if (descriptor.baseType === 'buildable') return checkBuildable(type, key, value)

  if (typeof value !== descriptor.baseType) {
    throw new ValidationError('invalid_type', type, key, `expected ${descriptor.baseType}, got ${typeof value}`)
  }
}
