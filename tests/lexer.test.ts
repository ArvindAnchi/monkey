import { describe, expect, test } from "@jest/globals"

import { Lexer } from "../lexer"
import { Token } from "../token"

describe('Lexer', () => {
    test('Sample tokens 1', () => {
        const input = '=+(){},;'
        const expectedTokens = [
            { eType: Token.ASSIGN, eLiteral: '=' },
            { eType: Token.PLUS, eLiteral: '+' },
            { eType: Token.LPAREN, eLiteral: '(' },
            { eType: Token.RPAREN, eLiteral: ')' },
            { eType: Token.LBRACE, eLiteral: '{' },
            { eType: Token.RBRACE, eLiteral: '}' },
            { eType: Token.COMMA, eLiteral: ',' },
            { eType: Token.SEMICOLON, eLiteral: ';' },
            { eType: Token.EOF, eLiteral: '' },
        ]
        const lexer = new Lexer(input)

        for (const eTok of expectedTokens) {
            const tok = lexer.NextToken()

            expect(tok.Type).toStrictEqual(eTok.eType)
            expect(tok.Literal).toStrictEqual(eTok.eLiteral)
        }
    })

    test('Sample tokens 2', () => {
        const input = `
            let five = 5;
            let ten = 10;

            let add = fn(x, y) {
              x + y;
            };

            let result = add(five, ten);
            !-/*5;
            5 < 10 > 5;

            if (5 < 10) {
                return true;
            } else {
                return false;
            }

            10 == 10;
            10 != 9;
        `
        const expectedTokens = [
            { eType: Token.LET, eLiteral: "let" },
            { eType: Token.IDENT, eLiteral: "five" },
            { eType: Token.ASSIGN, eLiteral: "=" },
            { eType: Token.INT, eLiteral: "5" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.LET, eLiteral: "let" },
            { eType: Token.IDENT, eLiteral: "ten" },
            { eType: Token.ASSIGN, eLiteral: "=" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.LET, eLiteral: "let" },
            { eType: Token.IDENT, eLiteral: "add" },
            { eType: Token.ASSIGN, eLiteral: "=" },
            { eType: Token.FUNCTION, eLiteral: "fn" },
            { eType: Token.LPAREN, eLiteral: "(" },
            { eType: Token.IDENT, eLiteral: "x" },
            { eType: Token.COMMA, eLiteral: "," },
            { eType: Token.IDENT, eLiteral: "y" },
            { eType: Token.RPAREN, eLiteral: ")" },
            { eType: Token.LBRACE, eLiteral: "{" },
            { eType: Token.IDENT, eLiteral: "x" },
            { eType: Token.PLUS, eLiteral: "+" },
            { eType: Token.IDENT, eLiteral: "y" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.RBRACE, eLiteral: "}" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.LET, eLiteral: "let" },
            { eType: Token.IDENT, eLiteral: "result" },
            { eType: Token.ASSIGN, eLiteral: "=" },
            { eType: Token.IDENT, eLiteral: "add" },
            { eType: Token.LPAREN, eLiteral: "(" },
            { eType: Token.IDENT, eLiteral: "five" },
            { eType: Token.COMMA, eLiteral: "," },
            { eType: Token.IDENT, eLiteral: "ten" },
            { eType: Token.RPAREN, eLiteral: ")" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.BANG, eLiteral: "!" },
            { eType: Token.MINUS, eLiteral: "-" },
            { eType: Token.SLASH, eLiteral: "/" },
            { eType: Token.ASTERISK, eLiteral: "*" },
            { eType: Token.INT, eLiteral: "5" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.INT, eLiteral: "5" },
            { eType: Token.LT, eLiteral: "<" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.GT, eLiteral: ">" },
            { eType: Token.INT, eLiteral: "5" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.IF, eLiteral: "if" },
            { eType: Token.LPAREN, eLiteral: "(" },
            { eType: Token.INT, eLiteral: "5" },
            { eType: Token.LT, eLiteral: "<" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.RPAREN, eLiteral: ")" },
            { eType: Token.LBRACE, eLiteral: "{" },
            { eType: Token.RETURN, eLiteral: "return" },
            { eType: Token.TRUE, eLiteral: "true" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.RBRACE, eLiteral: "}" },
            { eType: Token.ELSE, eLiteral: "else" },
            { eType: Token.LBRACE, eLiteral: "{" },
            { eType: Token.RETURN, eLiteral: "return" },
            { eType: Token.FALSE, eLiteral: "false" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.RBRACE, eLiteral: "}" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.EQ, eLiteral: "==" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.INT, eLiteral: "10" },
            { eType: Token.NOT_EQ, eLiteral: "!=" },
            { eType: Token.INT, eLiteral: "9" },
            { eType: Token.SEMICOLON, eLiteral: ";" },
            { eType: Token.EOF, eLiteral: '' },
        ]
        const lexer = new Lexer(input)

        for (const eTok of expectedTokens) {
            const tok = lexer.NextToken()

            expect(tok.Literal).toStrictEqual(eTok.eLiteral)
            expect(tok.Type).toStrictEqual(eTok.eType)
        }
    })
})

