import { Token } from "./token"

interface Node {
    TokenLiteral(): string
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

        return this.statements[0].TokenLiteral()
    }
}

export class Identifier implements Expression {
    token: Token = new Token()
    value: string = ''

    expressionNode() { }
    TokenLiteral(): string {
        return this.token.Literal
    }
}

export class LetStatement implements Statement {
    token: Token = new Token()
    name?: Identifier
    value?: Expression

    statementNode() { }
    TokenLiteral(): string {
        return this.token.Literal
    }
}

