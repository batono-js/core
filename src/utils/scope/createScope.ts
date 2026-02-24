import {Scope} from "./Scope.js";
import {generateToken} from "../generateToken.js";

export const createScope = (): Scope => new Scope(generateToken('s'))
