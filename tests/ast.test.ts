import { describe, test, expect } from 'vitest'
import { Identifier, LetStatement, Program } from '../ast'
import { Token } from '../token'

function is<T>(obj: any, checker: () => boolean): obj is T {
    return checker()
}

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

        const exp = new Identifier()
        const isIdent = is<Identifier>(exp, () => 'value' in (exp ?? {}))

        if (!isIdent) { throw (`Expected 'Identifier' got '${typeof exp}'`) }

        exp.value = 'anotherVar'
        exp.token = new Token()
        exp.token.Type = Token.IDENT
        exp.token.Literal = 'anotherVar'

        letStmt.value = exp

        program.statements.push(letStmt)

        expect(letStmt.value).toBeInstanceOf(Identifier)
        expect(program.asString()).toStrictEqual('let myVar = anotherVar;')
    })
})

