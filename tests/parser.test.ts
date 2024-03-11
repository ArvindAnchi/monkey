import { describe, test, expect } from '@jest/globals'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { ExpressionStatement, Identifier, LetStatement, ReturnStatement } from '../ast'

function is<T>(obj: any, checker: () => boolean): obj is T {
    return checker()
}

function checkParserErrors(p: Parser) {
    const errors = p.getErrors()

    if (errors.length === 0) { return }

    console.error(`Got ${errors.length} parsing errors`)

    for (const msg of errors) {
        console.error(` -> ${msg}`)
    }

    throw new Error('Parser failed with errors')
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

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(test.length)

        for (let i = 0; i < program.statements.length; i++) {
            const stmt = program.statements[i]
            const isLet = is<LetStatement>(stmt, () => 'name' in stmt)

            expect(isLet).toBeTruthy()
            expect(stmt).toBeInstanceOf(LetStatement)
            expect(stmt.tokenLiteral()).toBe('let')

            if (isLet) {
                expect(stmt.name?.value).toBe(tests[i].eIdent)
                expect(stmt.name?.tokenLiteral()).toBe(tests[i].eIdent)
            }
        }
    })

    test('Return statements', () => {
        const input = `
            return 5;
            return 10;
            return 993322;
        `
        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(3)

        for (let i = 0; i < program.statements.length; i++) {
            const stmt = program.statements[i]
            const isRet = is<ReturnStatement>(stmt, () => 'value' in stmt)

            expect(isRet).toBeTruthy()
            expect(stmt).toBeInstanceOf(ReturnStatement)
            expect(stmt.tokenLiteral()).toBe('return')
        }
    })

    test('Identifier statements', () => {
        const input = 'foobar;'

        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        for (let i = 0; i < program.statements.length; i++) {
            const stmt = program.statements[i]
            const isExp = is<ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe('foobar')

            if (isExp) {
                expect(stmt.expression).toBeInstanceOf(Identifier)
                expect(stmt.expression?.value).toBe('foobar')
            }
        }
    })

    test('Int statements', () => {
        const input = '5;'

        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        for (let i = 0; i < program.statements.length; i++) {
            const stmt = program.statements[i]
            const isExp = is<ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe('5')

            if (isExp) {
                expect(stmt.expression).toBeInstanceOf(Identifier)
                expect(stmt.expression?.value).toBe(5)
            }
        }
    })
})

