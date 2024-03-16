import { BlockStatement, BooleanExpression, Expression, ExpressionStatement, Identifier, IfExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from './ast'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'

type prefixParseFunc = () => Expression | null
type infixParseFunc = (ex: Expression) => Expression | null

enum Precedence {
    LOWEST,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL
}

const precedences = {
    [Token.EQ]: Precedence.EQUALS,
    [Token.NOT_EQ]: Precedence.EQUALS,
    [Token.LT]: Precedence.LESSGREATER,
    [Token.GT]: Precedence.LESSGREATER,
    [Token.PLUS]: Precedence.SUM,
    [Token.MINUS]: Precedence.SUM,
    [Token.SLASH]: Precedence.PRODUCT,
    [Token.ASTERISK]: Precedence.PRODUCT,
}

const prefixParseFuncs: Record<TokenType, prefixParseFunc> = {}
const infixParseFuncs: Record<TokenType, infixParseFunc> = {}

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

    private peekPrecedence() {
        const precedence = precedences[this.peekToken.Type]

        if (precedence == null) { return Precedence.LOWEST }

        return precedence
    }

    private curPrecedence() {
        const precedence = precedences[this.curToken.Type]

        if (precedence == null) { return Precedence.LOWEST }

        return precedence
    }

    private peekError(t: TokenType) {
        this.errors.push(`Expected '${t}' got ${this.peekToken.Type}`)
    }

    private parseIdentifier(parser: Parser) {
        return () => {
            const ident = new Identifier()

            ident.token = parser.curToken
            ident.value = parser.curToken.Literal

            return ident
        }
    }

    private parseIntegerLiteral(parser: Parser) {
        return () => {
            const val = Number(parser.curToken.Literal)

            if (isNaN(val)) {
                parser.errors.push(`Invalid literal '${parser.curToken.Literal}': expcting 'int'`)
                return null
            }

            const lit = new IntegerLiteral()

            lit.token = parser.curToken
            lit.value = val

            return lit
        }
    }

    private parseiBooleanLiteral(parser: Parser) {
        return () => {
            const val = Boolean(parser.curToken.Literal)
            const lit = new BooleanExpression()

            lit.token = parser.curToken
            lit.value = val

            return lit
        }
    }

    private parsePrefixExpression(parser: Parser) {
        return () => {
            const expr = new PrefixExpression()

            expr.token = parser.curToken
            expr.operator = parser.curToken.Literal

            parser.nextToken()

            expr.right = parser.parseExpression(Precedence.PREFIX)

            return expr
        }
    }

    private parseInfixExpression(parser: Parser) {
        return (left: Expression) => {
            const expr = new InfixExpression()

            expr.token = parser.curToken
            expr.operator = parser.curToken.Literal
            expr.left = left

            const precedence = this.curPrecedence()
            parser.nextToken()

            expr.right = parser.parseExpression(precedence)

            return expr
        }
    }

    private parseiGroupedLiteral(parser: Parser) {
        return () => {
            parser.nextToken()

            const exp = parser.parseExpression(Precedence.LOWEST)

            if (!parser.expectPeek(Token.RPAREN)) {
                return null
            }

            return exp
        }
    }

    private parseIfExpression(parser: Parser) {
        return () => {
            const expr = new IfExpression()

            expr.token = parser.curToken

            if (!parser.expectPeek(Token.LPAREN)) { return null }

            parser.nextToken()

            expr.condition = parser.parseExpression(Precedence.LOWEST)

            if (!parser.expectPeek(Token.RPAREN)) { return null }
            if (!parser.expectPeek(Token.LBRACE)) { return null }

            expr.consequence = parser.parseBlockStatement()

            if (this.peekTokenIs(Token.ELSE)) {
                parser.nextToken()

                if (!parser.expectPeek(Token.LBRACE)) { return null }

                expr.alternative = parser.parseBlockStatement()
            }

            return expr
        }
    }

    getErrors() {
        return this.errors
    }

    registerPrefixFunc(tokenType: TokenType, fn: prefixParseFunc) {
        prefixParseFuncs[tokenType] = fn
    }

    registerInfixFunc(tokenType: TokenType, fn: infixParseFunc) {
        infixParseFuncs[tokenType] = fn
    }

    parseProgram() {
        const program = new Program()

        this.registerPrefixFunc(Token.IDENT, this.parseIdentifier(this))
        this.registerPrefixFunc(Token.INT, this.parseIntegerLiteral(this))
        this.registerPrefixFunc(Token.BANG, this.parsePrefixExpression(this))
        this.registerPrefixFunc(Token.MINUS, this.parsePrefixExpression(this))
        this.registerPrefixFunc(Token.TRUE, this.parseiBooleanLiteral(this))
        this.registerPrefixFunc(Token.FALSE, this.parseiBooleanLiteral(this))
        this.registerPrefixFunc(Token.LPAREN, this.parseiGroupedLiteral(this))
        this.registerPrefixFunc(Token.IF, this.parseIfExpression(this))

        this.registerInfixFunc(Token.EQ, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.NOT_EQ, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.LT, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.GT, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.PLUS, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.MINUS, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.SLASH, this.parseInfixExpression(this))
        this.registerInfixFunc(Token.ASTERISK, this.parseInfixExpression(this))

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
                return this.parseExpressionStatement()
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

    parseExpressionStatement() {
        const stmt = new ExpressionStatement()

        stmt.token = this.curToken
        stmt.expression = this.parseExpression(Precedence.LOWEST)

        if (this.peekTokenIs(Token.SEMICOLON)) {
            this.nextToken()
        }

        return stmt
    }

    parseExpression(precedence: Precedence) {
        const prefix = prefixParseFuncs[this.curToken.Type]

        if (prefix == null) {
            this.errors.push(`No prefix parse function found for ${this.curToken.Type}`)
            return null
        }

        let left = prefix()

        while (!this.peekTokenIs(Token.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infix = infixParseFuncs[this.peekToken.Type]

            if (infix == null) { return left }
            this.nextToken()
            if (left == null) { throw new Error('Got null left') }

            left = infix(left)
        }

        return left
    }

    parseBlockStatement() {
        const block = new BlockStatement()

        block.token = this.curToken
        block.statements = []

        this.nextToken()

        while (!this.curTokenIs(Token.RBRACE) && !this.curTokenIs(Token.EOF)) {
            const stmt = this.parseStatement()

            if (stmt != null) {
                block.statements.push(stmt)
            }

            this.nextToken()
        }

        return block
    }
}

