import { Token } from "../token/token"

function newToken(tType: string, tLiteral: string) {
    const tok = new Token()

    tok.Type = tType
    tok.Literal = tLiteral

    return tok
}

function isDigit(ch: string) {
    return '0'.charCodeAt(0) <= ch.charCodeAt(0) && '9'.charCodeAt(0) >= ch.charCodeAt(0)
}

function isLetter(ch: string) {
    return 'a'.charCodeAt(0) <= ch.charCodeAt(0) && 'z'.charCodeAt(0) >= ch.charCodeAt(0) ||
        'A'.charCodeAt(0) <= ch.charCodeAt(0) && 'Z'.charCodeAt(0) >= ch.charCodeAt(0) ||
        '_'.charCodeAt(0) <= ch.charCodeAt(0)
}

export class Lexer {
    input: string
    position: number
    readPosition: number
    ch: string

    constructor(input: string) {
        this.input = input
        this.position = 0
        this.readPosition = 0
        this.ch = ''

        this.readChar()
    }

    NextToken() {
        let tok = new Token()

        this.skipWhitespace()

        switch (this.ch) {
            case '=':
                if (this.peekChar() == '=') {
                    const ch = this.ch
                    this.readChar()

                    tok = newToken(Token.EQ, ch + this.ch)
                } else {
                    tok = newToken(Token.ASSIGN, this.ch)
                }
                break
            case '+':
                tok = newToken(Token.PLUS, this.ch)
                break
            case '-':
                tok = newToken(Token.MINUS, this.ch)
                break
            case '!':
                if (this.peekChar() == '=') {
                    const ch = this.ch
                    this.readChar()

                    tok = newToken(Token.NOT_EQ, ch + this.ch)
                } else {
                    tok = newToken(Token.BANG, this.ch)
                }
                break
            case '/':
                tok = newToken(Token.SLASH, this.ch)
                break
            case '*':
                tok = newToken(Token.ASTERISK, this.ch)
                break
            case '<':
                tok = newToken(Token.LT, this.ch)
                break
            case '>':
                tok = newToken(Token.GT, this.ch)
                break
            case ';':
                tok = newToken(Token.SEMICOLON, this.ch)
                break
            case ',':
                tok = newToken(Token.COMMA, this.ch)
                break
            case ',':
                tok = newToken(Token.COMMA, this.ch)
                break
            case ';':
                tok = newToken(Token.SEMICOLON, this.ch)
                break
            case '(':
                tok = newToken(Token.LPAREN, this.ch)
                break
            case ')':
                tok = newToken(Token.RPAREN, this.ch)
                break
            case '{':
                tok = newToken(Token.LBRACE, this.ch)
                break
            case '}':
                tok = newToken(Token.RBRACE, this.ch)
                break
            case '\0':
                tok.Literal = ''
                tok.Type = Token.EOF
                break
            default:
                if (isLetter(this.ch)) {
                    tok.Literal = this.readIdent()
                    tok.Type = tok.lookupIdent(tok.Literal)

                    return tok
                } else if (isDigit(this.ch)) {
                    tok.Literal = this.readNumber()
                    tok.Type = Token.INT

                    return tok
                }

                tok = newToken(Token.ILLEGAL, this.ch)
        }

        this.readChar()

        return tok
    }

    peekChar() {
        if (this.readPosition >= this.input.length) {
            return '\0'
        } else {
            return this.input[this.readPosition]
        }
    }

    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '\0'
        } else {
            this.ch = this.input[this.readPosition]
        }

        this.position = this.readPosition
        this.readPosition += 1
    }

    readNumber() {
        const pos = this.position

        while (isDigit(this.ch)) {
            this.readChar()
        }

        return this.input.slice(pos, this.position)
    }

    readIdent() {
        const pos = this.position

        while (isLetter(this.ch)) {
            this.readChar()
        }

        return this.input.slice(pos, this.position)
    }

    skipWhitespace() {
        while (this.ch == ' ' || this.ch == '\t' || this.ch == '\n' || this.ch == '\r') {
            this.readChar()
        }
    }
}

