import { describe, test, expect } from '@jest/globals'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Expression, ExpressionStatement, Identifier, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement } from '../ast'

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

function testIntLiteral(il: Expression | null, value: number) {
    expect(il).toBeTruthy()
    if (il == null) { return }

    if (!is<IntegerLiteral>(il, () => 'number' in il)) { throw new Error(`Expected IntLiteral, got ${typeof il}`) }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
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
                const exp = stmt.expression
                const isIdent = is<Identifier>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(Identifier)
                if (isIdent) {
                    expect(exp.value).toBe('foobar')
                }
            }
        }
    })

    test('Int literals', () => {
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
                const exp = stmt.expression
                const isIdent = is<IntegerLiteral>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(IntegerLiteral)
                if (isIdent) {
                    expect(exp.value).toBe(5)
                }
            }
        }
    })

    test('Prefix expressions', () => {
        const tests = [
            { input: '!5', operator: '!', intValue: 5 },
            { input: '-15', operator: '-', intValue: 15 }
        ]

        for (const tt of tests) {
            const lexer = new Lexer(tt.input)
            const parser = new Parser(lexer)

            const program = parser.parseProgram()

            checkParserErrors(parser)

            expect(program).not.toBeNull()
            expect(program.statements.length).toBe(1)

            const stmt = program.statements[0]
            const isExp = is<ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe(tt.operator)

            if (isExp) {
                const exp = stmt.expression
                const isIdent = is<PrefixExpression>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(PrefixExpression)
                if (isIdent) {
                    expect(exp.operator).toBe(tt.operator)
                    testIntLiteral(exp.right, tt.intValue)
                }
            }
        }
    })
})

