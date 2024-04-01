import { BlockStatement, Identifier } from "./ast"
import { Environment } from "./env"

type ObjectType = string

export interface MObject {
    Type: () => ObjectType
    Inspect: () => string
}

export const INT_OBJ: ObjectType = 'INTEGER'
export const BOOL_OBJ: ObjectType = 'BOOLEAN'
export const NULL_OBJ: ObjectType = 'NULL'
export const RETURN_OBJ: ObjectType = 'RETURN'
export const FUNCTION_OBJ: ObjectType = 'FUNCTION'
export const STRING_OBJ: ObjectType = 'STRING'
export const ERROR_OBJ: ObjectType = 'ERROR'

export class Integer implements MObject {
    Value: number

    constructor(val?: number) { this.Value = Math.floor(val ?? 0) }
    Type() { return INT_OBJ }
    Inspect() { return this.Value.toString() }
}

export class Boolean implements MObject {
    Value: boolean

    constructor(val?: boolean) { this.Value = val ?? false }
    Type() { return BOOL_OBJ }
    Inspect() { return this.Value.toString() }
}

export class Null implements MObject {
    Type() { return NULL_OBJ }
    Inspect() { return 'null' }
}

export class Return implements MObject {
    Value: MObject

    constructor(val: MObject) { this.Value = val }
    Type() { return RETURN_OBJ }
    Inspect() { return this.Value.Inspect() }
}

export class String implements MObject {
    Value: string

    constructor(val: string) { this.Value = val }
    Type() { return STRING_OBJ }
    Inspect() { return this.Value }
}

export class Function implements MObject {
    params: Identifier[]
    body: BlockStatement | null
    env: Environment

    constructor(params: Identifier[], body: BlockStatement | null, env: Environment) {
        this.params = params
        this.body = body
        this.env = env
    }
    Type() { return FUNCTION_OBJ }
    Inspect() {
        let out = ''

        out += 'fn'
        out += '('
        out += this.params.map(p => p.asString()).join(', ')
        out += ') {\n'
        out += this.body?.asString()
        out += '\n}'

        return out
    }
}

export class Err implements MObject {
    message: string

    constructor(msg: string) { this.message = msg }
    Type() { return ERROR_OBJ }
    Inspect() { return `ERROR: ${this.message}` }
}
