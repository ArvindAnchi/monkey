import * as obj from './objects'
import * as ast from './ast'

function evalStatemets(stmts: ast.Statement[]): obj.MObject | null {
    let result: obj.MObject | null = null

    for (const stmt of stmts) {
        result = Eval(stmt)
    }

    return result
}

export function Eval(node: ast.Node | null) {
    if (node instanceof ast.Program) {
        return evalStatemets(node.statements)
    }

    if (node instanceof ast.ExpressionStatement) {
        return Eval(node.expression)
    }

    if (node instanceof ast.IntegerLiteral) {
        return new obj.Integer(node.value)
    }

    return null
}

