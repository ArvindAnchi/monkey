import * as obj from './objects'
import * as ast from './ast'

const NULL_OBJ = new obj.Null()
const TRUE_BOBJ = new obj.Boolean(true)
const FALSE_BOBJ = new obj.Boolean(false)

function evalStatemets(stmts: ast.Statement[]): obj.MObject {
    let result: obj.MObject = NULL_OBJ

    for (const stmt of stmts) {
        result = Eval(stmt)
    }

    return result
}

function evalNotOperatorExpression(right: obj.MObject) {
    switch (right) {
        case TRUE_BOBJ:
            return FALSE_BOBJ
        case FALSE_BOBJ:
            return TRUE_BOBJ
        case NULL_OBJ:
            return TRUE_BOBJ
        default:
            return FALSE_BOBJ
    }
}

function evalMinusPrefixOperatorExpression(right: obj.MObject) {
    if (right?.Type() !== obj.INT_OBJ) {
        return NULL_OBJ
    }

    const value = (right as obj.Integer).Value
    return new obj.Integer(-value)
}

function toBoolObj(input: boolean): obj.Boolean {
    if (input) return TRUE_BOBJ
    return FALSE_BOBJ
}

function evalIntInfixExpression(operator: string, left: obj.MObject, right: obj.MObject): obj.MObject {
    const leftVal = (left as obj.Integer).Value
    const rightVal = (right as obj.Integer).Value

    switch (operator) {
        case '+':
            return new obj.Integer(leftVal + rightVal)
        case '-':
            return new obj.Integer(leftVal - rightVal)
        case '*':
            return new obj.Integer(leftVal * rightVal)
        case '/':
            return new obj.Integer(leftVal / rightVal)
        case '<':
            return toBoolObj(leftVal < rightVal)
        case '>':
            return toBoolObj(leftVal > rightVal)
        case '==':
            return toBoolObj(leftVal == rightVal)
        case '!=':
            return toBoolObj(leftVal != rightVal)
        default:
            return NULL_OBJ
    }
}

function evalInfixExpression(operator: string, left: obj.MObject, right: obj.MObject): obj.MObject {
    if (left?.Type() === obj.INT_OBJ && right?.Type() === obj.INT_OBJ) {
        return evalIntInfixExpression(operator, left, right)
    }

    if (operator === '==') {
        return toBoolObj(left === right)
    }

    if (operator === '!=') {
        return toBoolObj(left !== right)
    }

    return NULL_OBJ
}

function evalPrefixExpression(operator: string, right: obj.MObject): obj.MObject {
    switch (operator) {
        case '!':
            return evalNotOperatorExpression(right)
        case '-':
            return evalMinusPrefixOperatorExpression(right)
        default:
            return NULL_OBJ
    }
}

export function Eval(node: ast.Node | null): obj.MObject {
    if (node instanceof ast.Program) {
        return evalStatemets(node.statements)
    }

    if (node instanceof ast.ExpressionStatement) {
        return Eval(node.expression)
    }

    if (node instanceof ast.IntegerLiteral) {
        return new obj.Integer(node.value)
    }

    if (node instanceof ast.BooleanExpression) {
        return node.value
            ? TRUE_BOBJ
            : FALSE_BOBJ
    }

    if (node instanceof ast.PrefixExpression) {
        const right = Eval(node.right)
        return evalPrefixExpression(node.operator, right)
    }

    if (node instanceof ast.InfixExpression) {
        const right = Eval(node.right)
        const left = Eval(node.left)
        return evalInfixExpression(node.operator, left, right)
    }

    return NULL_OBJ
}

