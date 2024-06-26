import { Token } from "./token"

export interface Node {
    tokenLiteral(): string
    asString(): string
}

export interface Statement extends Node {
    statementNode(): void
}

export interface Expression extends Node {
    token: Token

    expressionNode(): void
}

export class Program {
    statements: Statement[]

    constructor() {
        this.statements = []
    }

    tokenLiteral(): string {
        if (this.statements.length === 0) { return "" }

        return this.statements[0].tokenLiteral()
    }

    asString() {
        let pString = ''

        for (const stmt of this.statements) {
            pString += stmt.asString()
        }

        return pString
    }
}

export class Identifier implements Expression {
    token: Token = new Token()
    value: string = ''

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        return this.value
    }
}

export class LetStatement implements Statement {
    token: Token = new Token()
    name: Identifier | null = null
    value: Expression | null = null

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.tokenLiteral() + ' '
        sString += this.name?.asString()
        sString += ' = '
        sString += this.value?.asString()
        sString += ';'

        return sString
    }
}

export class ReturnStatement implements Statement {
    token: Token = new Token()
    value: Expression | null = null

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.tokenLiteral() + ' '
        sString += this.value?.asString()
        sString += ';'

        return sString
    }
}

export class ExpressionStatement implements Statement {
    token: Token = new Token()
    expression: Expression | null = null

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.expression?.asString()

        return sString
    }
}

export class BlockStatement implements Statement {
    token: Token = new Token()
    statements: Statement[] = []

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let out = ''

        for (const s of this.statements) {
            out += s.asString()
        }

        return out
    }
}

export class IntegerLiteral implements Expression {
    token: Token = new Token()
    value: number = 0

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        return this.value.toString()
    }
}

export class PrefixExpression implements Expression {
    token: Token = new Token()
    operator: string = ''
    right: Expression | null = null

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let out = ''

        out += '('
        out += this.operator
        out += this.right?.asString()
        out += ')'

        return out
    }
}

export class InfixExpression implements Expression {
    token: Token = new Token()
    left: Expression | null = null
    operator: string = ''
    right: Expression | null = null

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let out = ''

        out += '('
        out += this.left?.asString()
        out += ' ' + this.operator + ' '
        out += this.right?.asString()
        out += ')'

        return out
    }
}

export class BooleanExpression implements Expression {
    token: Token = new Token()
    value: boolean = false

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        return this.token.Literal
    }
}

export class IfExpression implements Expression {
    token: Token = new Token()
    condition: Expression | null = null
    consequence: BlockStatement | null = null
    alternative: BlockStatement | null = null

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let out = ''

        out += 'if'
        out += this.condition?.asString()
        out += ' '
        out += this.consequence?.asString()

        if (this.alternative != null) {
            out += 'else '
            out += this.alternative?.asString()
        }

        return out
    }
}

export class FunctionLiteral implements Expression {
    token: Token = new Token()
    params: Identifier[] = []
    body: BlockStatement | null = null

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let out = ''

        out += this.tokenLiteral()
        out += '('
        out += this.params.map(p => p.asString()).join(', ')
        out += ')'
        out += this.body?.asString()

        return out
    }
}

export class CallExpression implements Expression {
    token: Token = new Token()
    function: Expression | null = null
    args: (Expression | null)[] = []

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        const params = []
        let out = ''

        for (const arg of (this.args ?? [])) {
            params.push(arg?.asString())
        }

        out += this.function?.asString()
        out += '('
        out += params.join(', ')
        out += ')'

        return out
    }
}

export class StringLiteral implements Expression {
    token: Token = new Token()
    value: string = ''

    expressionNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        return this.token.Literal
    }
}

