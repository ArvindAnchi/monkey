import { Identifier, LetStatement, Program, ReturnStatement, Statement } from './ast'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'

export class Parser {
    private lex: Lexer

    private curToken: Token
    private peekToken: Token

    private errors: string[]

    constructor(lexer: Lexer) {
        this.lex = lexer

        this.curToken = new Token()
        this.peekToken = new Token()

        this.nextToken()
        this.nextToken()

        this.errors = []
    }

    private nextToken() {
        this.curToken = this.peekToken
        this.peekToken = this.lex.NextToken()
    }

    private curTokenIs(t: TokenType) {
        return this.curToken.Type === t
    }

    private peekTokenIs(t: TokenType) {
        return this.peekToken.Type === t
    }

    private expectPeek(t: TokenType) {
        if (!this.peekTokenIs(t)) {
            this.peekError(t)
            return false
        }

        this.nextToken()
        return true
    }

    private peekError(t: TokenType) {
        this.errors.push(`Expected '${t}' got ${this.peekToken.Type}`)
    }

    getErrors() {
        return this.errors
    }

    parseProgram() {
        const program = new Program()

        while (this.curToken.Type !== Token.EOF) {
            const stmt = this.parseStatement()

            if (stmt !== null) {
                program.statements.push(stmt)
            }

            this.nextToken()
        }

        return program
    }

    parseStatement(): Statement | null {
        switch (this.curToken.Type) {
            case Token.LET:
                return this.parseLetStatement()
            case Token.RETURN:
                return this.parseReturnStatement()
            default:
                return null
        }
    }

    parseLetStatement(): LetStatement | null {
        const stmt = new LetStatement()

        stmt.token = this.curToken

        if (!this.expectPeek(Token.IDENT)) { return null }

        stmt.name = new Identifier()

        stmt.name.token = this.curToken
        stmt.name.value = this.curToken.Literal

        if (!this.expectPeek(Token.ASSIGN)) { return null }

        while (!this.curTokenIs(Token.SEMICOLON)) {
            this.nextToken()
        }

        return stmt
    }

    parseReturnStatement(): ReturnStatement | null {
        const stmt = new ReturnStatement()

        stmt.token = this.curToken

        while (!this.curTokenIs(Token.SEMICOLON)) {
            this.nextToken()
        }

        return stmt
    }
}
