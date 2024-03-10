import { describe, test, expect } from '@jest/globals'
import { Identifier, LetStatement, Program } from '../ast'
import { Token } from '../token'

describe('AST', () => {
    test('ast -> string', () => {
        const program = new Program()
        const letStmt = new LetStatement()

        letStmt.token = new Token()
        letStmt.token.Type = Token.LET
        letStmt.token.Literal = 'let'

        letStmt.name = new Identifier()
        letStmt.name.value = 'myVar'
        letStmt.name.token = new Token()
        letStmt.name.token.Type = Token.IDENT
        letStmt.name.token.Literal = 'myVar'

        letStmt.value = new Identifier()
        letStmt.value.value = 'anotherVar'
        letStmt.value.token = new Token()
        letStmt.value.token.Type = Token.IDENT
        letStmt.value.token.Literal = 'anotherVar'

        program.statements.push(letStmt)

        expect(program.asString()).toStrictEqual('let myVar = anotherVar;')
    })
})

