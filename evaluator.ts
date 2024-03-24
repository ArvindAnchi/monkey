import * as obj from './objects'
import * as ast from './ast'

const TRUE_BOBJ = new obj.Boolean(true)
const FALSE_BOBJ = new obj.Boolean(false)

function evalStatemets(stmts: ast.Statement[]): obj.MObject | null {
    let result: obj.MObject | null = null

    for (const stmt of stmts) {
        result = Eval(stmt)
    }

    return result
}

function evalNotOperatorExpression(right: obj.MObject | null) {
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

function evalMinusPrefixOperatorExpression(right: obj.MObject | null) {
    if (right?.Type() !== obj.INT_OBJ) {
        return null
    }

    const value = (right as obj.Integer).Value
    return new obj.Integer(-value)
}
function evalPrefixExpression(operator: string, right: obj.MObject | null): obj.MObject | null {
    switch (operator) {
        case '!':
            return evalNotOperatorExpression(right)
        case '-':
            return evalMinusPrefixOperatorExpression(right)
        default:
            return null
    }
}

export function Eval(node: ast.Node | null): obj.MObject | null {
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

    return null
}

