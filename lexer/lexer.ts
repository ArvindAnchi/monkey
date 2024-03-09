import { Token } from "../token/token"

function newToken(tType: string, tLiteral: string) {
    const tok = new Token()

    tok.Type = tType
    tok.Literal = tLiteral

    return tok
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

        switch (this.ch) {
            case '=':
                tok = newToken(Token.ASSIGN, this.ch)
                break
            case '+':
                tok = newToken(Token.PLUS, this.ch)
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
                    return tok
                } else {
                    tok = newToken(Token.ILLEGAL, this.ch)
                }
        }

        this.readChar()

        return tok
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

    readIdent() {
        const pos = this.position

        while (isLetter(this.ch)) {
            this.readChar()
        }

        return this.input.slice(pos, this.position)
    }
}

