type ObjectType = string

export interface MObject {
    Type: () => ObjectType
    Inspect: () => string
}

export const INT_OBJ: ObjectType = 'INTEGER'
export const BOOL_OBJ: ObjectType = 'BOOLEAN'
export const NULL_OBJ: ObjectType = 'NULL'
export const RETURN_OBJ: ObjectType = 'RETURN'
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

export class Err implements MObject {
    message: string

    constructor(msg: string) { this.message = msg }
    Type() { return ERROR_OBJ }
    Inspect() { return `ERROR: ${this.message}` }
}
