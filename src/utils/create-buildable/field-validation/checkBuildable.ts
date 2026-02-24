import {ValidationError} from "../ValidationError.js";
import {isBuildableItem} from "../utils.js";

export const checkBuildable = (
  type: string,
  key: string,
  value: unknown,
) => {
  if (!isBuildableItem(value)) {
    throw new ValidationError('invalid_buildable', type, key, `expected IBuildable, got ${typeof value}`)
  }
}
