type ObjectType = string

export interface MObject {
    Type: () => ObjectType
    Inspect: () => string
}

const INT_OBJ: ObjectType = 'INTEGER'
const BOOL_OBJ: ObjectType = 'BOOLEAN'
const NULL_OBJ: ObjectType = 'NULL'

export class Integer implements MObject {
    Value: Number = 0

    Type() { return INT_OBJ }
    Inspect() { return this.Value.toString() }
}

export class Boolean implements MObject {
    Value: boolean = false

    Type() { return BOOL_OBJ }
    Inspect() { return this.Value.toString() }
}

export class Null implements MObject {
    Type() { return NULL_OBJ }
    Inspect() { return 'null' }
}

