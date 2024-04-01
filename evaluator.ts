import * as obj from './objects'
import * as ast from './ast'
import { Environment } from './env'

const NULL_OBJ = new obj.Null()
const TRUE_BOBJ = new obj.Boolean(true)
const FALSE_BOBJ = new obj.Boolean(false)

function evalProgram(program: ast.Program, env: Environment): obj.MObject {
    let result: obj.MObject = NULL_OBJ

    for (const stmt of program.statements) {
        result = Eval(stmt, env)

        if (result instanceof obj.Return) {
            return result.Value
        }

        if (result instanceof obj.Err) {
            return result
        }
    }

    return result
}

function evalBlockStatement(block: ast.BlockStatement, env: Environment): obj.MObject {
    let result: obj.MObject = NULL_OBJ

    for (const stmt of block.statements) {
        result = Eval(stmt, env)

        if (result != null) {
            const rt = result.Type()

            if (rt === obj.RETURN_OBJ || rt === obj.ERROR_OBJ) {
                return result
            }
        }
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
        return newError(`unknown operator: -${right.Type()}`)
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

    if (left?.Type() != right?.Type()) {
        return newError(`type mismatch: ${left.Type()} ${operator} ${right.Type()}`)
    }

    return newError(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`)
}

function evalPrefixExpression(operator: string, right: obj.MObject): obj.MObject {
    switch (operator) {
        case '!':
            return evalNotOperatorExpression(right)
        case '-':
            return evalMinusPrefixOperatorExpression(right)
        default:
            return newError(`unknown operator: ${operator}${right.Type()}`)
    }
}

function isTruthy(obj: obj.MObject): boolean {
    switch (obj) {
        case NULL_OBJ:
            return false
        case FALSE_BOBJ:
            return false
        case TRUE_BOBJ:
            return true
        default:
            return true
    }
}

function evalIfExpression(iExp: ast.IfExpression, env: Environment): obj.MObject {
    const condition = Eval(iExp.condition, env)

    if (isError(condition)) {
        return condition
    }

    if (isTruthy(condition)) {
        return Eval(iExp.consequence, env)
    } else if (iExp.alternative != null) {
        return Eval(iExp.alternative, env)
    } else {
        return NULL_OBJ
    }
}

function newError(message: string): obj.Err {
    return new obj.Err(message)
}

function isError(cObj: obj.MObject): boolean {
    if (cObj == null) {
        return false
    }

    return cObj.Type() === obj.ERROR_OBJ
}

function evalIdentifier(node: ast.Identifier | null, env: Environment) {
    if (node == null) { throw new Error('Got null node') }

    const val = env.get(node.value)

    return val
}

function evalExpression(expList: (ast.Expression | null)[], env: Environment): obj.MObject[] {
    const result: obj.MObject[] = []

    for (const e of expList) {
        const evaluated = Eval(e, env)

        if (isError(evaluated)) {
            return [evaluated]
        }

        result.push(evaluated)
    }

    return result
}

function unwrapReturnValue(fobj: obj.MObject): obj.MObject {
    if (fobj instanceof obj.Return) {
        return fobj.Value
    }

    return fobj
}

function extendEnv(fn: obj.Function, args: obj.MObject[]): Environment {
    const env = new Environment(fn.env)

    for (const [paramIdx, param] of fn.params.entries()) {
        env.set(param.value, args[paramIdx])
    }

    return env
}

function applyFunc(func: obj.MObject, args: obj.MObject[]): obj.MObject {
    if (!(func instanceof obj.Function)) {
        return newError(`Not a function: ${func.Type()}`)
    }

    const extEnv = extendEnv(func, args)
    const evaluated = Eval(func.body, extEnv)

    return unwrapReturnValue(evaluated)
}

export function Eval(node: ast.Node | null, env: Environment): obj.MObject {
    if (node instanceof ast.Program) {
        return evalProgram(node, env)
    }

    if (node instanceof ast.ExpressionStatement) {
        return Eval(node.expression, env)
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
        const right = Eval(node.right, env)

        if (isError(right)) {
            return right
        }

        return evalPrefixExpression(node.operator, right)
    }

    if (node instanceof ast.InfixExpression) {
        const right = Eval(node.right, env)

        if (isError(right)) {
            return right
        }

        const left = Eval(node.left, env)

        if (isError(left)) {
            return left
        }

        return evalInfixExpression(node.operator, left, right)
    }

    if (node instanceof ast.BlockStatement) {
        return evalBlockStatement(node, env)
    }

    if (node instanceof ast.IfExpression) {
        return evalIfExpression(node, env)
    }

    if (node instanceof ast.Identifier) {
        return evalIdentifier(node, env)
    }

    if (node instanceof ast.ReturnStatement) {
        const val = Eval(node.value, env)

        if (isError(val)) {
            return val
        }

        return new obj.Return(val)
    }

    if (node instanceof ast.LetStatement) {
        const val = Eval(node.value, env)

        if (isError(val)) { return val }
        if (node.name == null) { throw new Error('Got null node') }

        env.set(node.name.value, val)
    }

    if (node instanceof ast.FunctionLiteral) {
        const params = node.params
        const body = node.body

        return new obj.Function(params, body, env)
    }

    if (node instanceof ast.CallExpression) {
        const func = Eval(node.function, env)
        if (isError(func)) {
            return func
        }

        const args = evalExpression(node.args, env)
        if (args.length == 1 && isError(args[0])) {
            return args[0]
        }

        return applyFunc(func, args)
    }

    if (node instanceof ast.StringLiteral) {
        return new obj.String(node.value)
    }

    return NULL_OBJ
}

