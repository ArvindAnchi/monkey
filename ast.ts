import { Token } from "./token"

interface Node {
    tokenLiteral(): string
    asString(): string
}

export interface Statement extends Node {
    statementNode(): void
}

export interface Expression extends Node {
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
    name?: Identifier
    value?: Expression

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.tokenLiteral + ' '
        sString += this.name?.asString() + ' '
        sString += ' = '
        sString += this.value?.asString()
        sString += ';'

        return sString
    }
}

export class ReturnStatement implements Statement {
    token: Token = new Token()
    value?: Expression

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.tokenLiteral + ' '
        sString += this.value?.asString()
        sString += ';'

        return sString
    }
}

export class ExpressionStatement implements Statement {
    token: Token = new Token()
    expression?: Expression

    statementNode() { }
    tokenLiteral(): string {
        return this.token.Literal
    }
    asString() {
        let sString = ''

        sString += this.expression?.asString()
        sString += ';'

        return sString
    }
}

