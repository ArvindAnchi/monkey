import * as obj from './objects'
import * as ast from './ast'

export function Eval(node: ast.Node) {
    if (node instanceof ast.IntegerLiteral) {
        return new obj.Integer(node.value)
    }

    return null
}

