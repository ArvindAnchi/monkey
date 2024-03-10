import { describe, test, expect } from '@jest/globals'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { LetStatement } from '../ast'

function is<T>(obj: any, checker: () => boolean): obj is T {
    return checker()
}

describe('Parser', () => {
    test('Let statements', () => {
        const input = `
            let x = 5;
            let y = 10;
            let foobar = 838383;
        `
        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        const tests = [
            { eIdent: 'x' },
            { eIdent: 'y' },
            { eIdent: 'foobar' },
        ]

        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(test.length)

        for (let i = 0; i < program.statements.length; i++) {
            const stmt = program.statements[i]

            expect(stmt.TokenLiteral()).toBe('let')

            if (is<LetStatement>(stmt, () => 'name' in stmt)) {
                expect(stmt.name?.value).toBe(tests[i].eIdent)
                expect(stmt.name?.TokenLiteral()).toBe(tests[i].eIdent)
            }
        }
    })
})

