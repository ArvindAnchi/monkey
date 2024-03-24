type ObjectType = string

export interface MObject {
    Type: () => ObjectType
    Inspect: () => string
}

export const INT_OBJ: ObjectType = 'INTEGER'
export const BOOL_OBJ: ObjectType = 'BOOLEAN'
export const NULL_OBJ: ObjectType = 'NULL'

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

