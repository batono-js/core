import {ValidationError} from "../ValidationError.js";
import type {FieldDescriptor} from "../FieldBuilder.js";

export const checkEnum = (
  type: string,
  key: string,
  value: unknown,
  descriptor: FieldDescriptor
) => {
  if (!descriptor.enumValues!.includes(value as string)) {
    throw new ValidationError('invalid_type', type, key,
      `expected one of ${descriptor.enumValues!.map(v => `"${v}"`).join(', ')}, got "${value}"`)
  }
}
