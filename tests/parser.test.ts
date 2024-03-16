import { describe, test, expect } from 'vitest'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import {
    Expression,
    ExpressionStatement,
    Identifier,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    ReturnStatement,
    InfixExpression,
    BooleanExpression,
    IfExpression
} from '../ast'

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

function testBoolLiteral(il: Expression | null, value: boolean) {
    expect(il).toBeTruthy()
    if (il == null) { return }

    if (!is<BooleanExpression>(il, () => 'number' in il)) { throw new Error(`Expected IntLiteral, got ${typeof il}`) }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
}

function testInfixExpression(exp: Expression | null, eLExp: string | number | boolean, eOp: string | number | boolean, eRExp: string | number | boolean) {
    const isIdent = is<InfixExpression>(exp, () => 'expression' in (exp ?? {}))

    expect(exp).toBeInstanceOf(InfixExpression)
    if (isIdent) {
        switch (typeof eLExp) {
            case 'number':
                testIntLiteral(exp.left, eLExp)
                break
            case 'boolean':
                testBoolLiteral(exp.left, eLExp)
                break
            case 'string':
                expect(exp.left).toBe(eLExp)
                break
        }

        switch (typeof eRExp) {
            case 'number':
                testIntLiteral(exp.right, eRExp)
                break
            case 'boolean':
                testBoolLiteral(exp.right, eRExp)
                break
            case 'string':
                expect(exp.right).toBe(eRExp)
                break
        }

        expect(exp.operator).toBe(eOp)
    }
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
        expect(program.statements.length).toBe(tests.length)

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

    test('Boolean literals', () => {
        const input = 'true;'

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
            expect(stmt.tokenLiteral()).toBe('true')

            if (isExp) {
                const exp = stmt.expression
                const isIdent = is<BooleanExpression>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(BooleanExpression)
                if (isIdent) {
                    expect(exp.value).toBe(true)
                }
            }
        }
    })

    test('Prefix expressions', () => {
        const tests = [
            { input: '!5', operator: '!', intValue: 5 },
            { input: '-15', operator: '-', intValue: 15 },
            { input: '!true', operator: '!', boolValue: true },
            { input: '!false', operator: '!', boolValue: false },
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
                    if (tt.intValue != null) testIntLiteral(exp.right, tt.intValue)
                    if (tt.boolValue != null) testBoolLiteral(exp.right, tt.boolValue)
                }
            }
        }
    })

    test('Infix expressions', () => {
        const tests = [
            { input: '5 + 5', left: 5, operator: '+', right: 5 },
            { input: '5 - 5', left: 5, operator: '-', right: 5 },
            { input: '5 * 5', left: 5, operator: '*', right: 5 },
            { input: '5 / 5', left: 5, operator: '/', right: 5 },
            { input: '5 > 5', left: 5, operator: '>', right: 5 },
            { input: '5 < 5', left: 5, operator: '<', right: 5 },
            { input: '5 == 5', left: 5, operator: '==', right: 5 },
            { input: '5 != 5', left: 5, operator: '!=', right: 5 },
            { input: "true == true", left: true, operator: "==", right: true },
            { input: "true != false", left: true, operator: "!=", right: false },
            { input: "false == false", left: false, operator: "==", right: false },
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

            if (isExp) {
                const exp = stmt.expression
                testInfixExpression(exp, tt.left, tt.operator, tt.right)
            }
        }
    })

    test('Operator precedence', () => {
        const tests = [
            { input: "-a * b", expected: "((-a) * b)", },
            { input: "!-a", expected: "(!(-a))", },
            { input: "a + b + c", expected: "((a + b) + c)", },
            { input: "a + b - c", expected: "((a + b) - c)", },
            { input: "a * b * c", expected: "((a * b) * c)", },
            { input: "a * b / c", expected: "((a * b) / c)", },
            { input: "a + b / c", expected: "(a + (b / c))", },
            { input: "a + b * c + d / e - f", expected: "(((a + (b * c)) + (d / e)) - f)", },
            { input: "3 + 4; -5 * 5", expected: "(3 + 4)((-5) * 5)", },
            { input: "5 > 4 == 3 < 4", expected: "((5 > 4) == (3 < 4))", },
            { input: "5 < 4 != 3 > 4", expected: "((5 < 4) != (3 > 4))", },
            { input: "3 + 4 * 5 == 3 * 1 + 4 * 5", expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))", },
            { input: "true", expected: "true", },
            { input: "false", expected: "false", },
            { input: "3 > 5 == false", expected: "((3 > 5) == false)", },
            { input: "3 < 5 == true", expected: "((3 < 5) == true)", },
            { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)", },
            { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)", },
            { input: "2 / (5 + 5)", expected: "(2 / (5 + 5))", },
            { input: "-(5 + 5)", expected: "(-(5 + 5))", },
            { input: "!(true == true)", expected: "(!(true == true))", },
        ]

        for (const tt of tests) {
            const lexer = new Lexer(tt.input)
            const parser = new Parser(lexer)

            const program = parser.parseProgram()

            const actual = program.asString()

            checkParserErrors(parser)
            expect(actual).toBe(tt.expected)
        }
    })

    test('If expression', () => {
        const input = 'if (x< y) { x }'

        const lexer = new Lexer(input)
        const parser = new Parser(lexer)

        const program = parser.parseProgram()

        checkParserErrors(parser)

        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]
        const isExp = is<ExpressionStatement>(stmt, () => 'expression' in stmt)

        expect(isExp).toBeTruthy()
        expect(stmt).toBeInstanceOf(ExpressionStatement)

        if (isExp) {
            const exp = stmt.expression
            const isIfExp = is<IfExpression>(exp, () => 'condition' in (exp ?? {}))

            expect(stmt.expression).toBeInstanceOf(IfExpression)

            if (isIfExp) {
                testInfixExpression(exp.condition, 'x', '<', 'y')
                expect(exp.consequence?.statements.length).toBe(1)

                const conExp = exp.consequence?.statements[0]
                const isConExp = is<ExpressionStatement>(conExp, () => 'expression' in (exp ?? {}))

                expect(conExp).toBeInstanceOf(ExpressionStatement)

                if (isConExp) {
                    const isIdent = is<Identifier>(conExp, () => 'expression' in (conExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(Identifier)
                    if (isIdent) { expect(conExp.value).toBe('x') }
                }

                expect(exp.alternative?.statements.length).toBeFalsy()
            }
        }
    })

    test('If else expression', () => {
        const input = 'if (x< y) { x } else { y }'

        const lexer = new Lexer(input)
        const parser = new Parser(lexer)

        const program = parser.parseProgram()

        checkParserErrors(parser)

        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]
        const isExp = is<ExpressionStatement>(stmt, () => 'expression' in stmt)

        expect(isExp).toBeTruthy()
        expect(stmt).toBeInstanceOf(ExpressionStatement)

        if (isExp) {
            const exp = stmt.expression
            const isIfExp = is<IfExpression>(exp, () => 'condition' in (exp ?? {}))

            expect(stmt.expression).toBeInstanceOf(IfExpression)

            if (isIfExp) {
                testInfixExpression(exp.condition, 'x', '<', 'y')
                expect(exp.consequence?.statements.length).toBe(1)

                const conExp = exp.consequence?.statements[0]
                const altExp = exp.alternative?.statements[0]

                const isConExp = is<ExpressionStatement>(conExp, () => 'expression' in (exp ?? {}))
                const isAltExp = is<ExpressionStatement>(altExp, () => 'expression' in (exp ?? {}))

                expect(conExp).toBeInstanceOf(ExpressionStatement)
                expect(altExp).toBeInstanceOf(ExpressionStatement)

                if (isConExp) {
                    const isIdent = is<Identifier>(conExp, () => 'expression' in (conExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(Identifier)
                    if (isIdent) { expect(conExp.value).toBe('x') }
                }

                if (isAltExp) {
                    const isIdent = is<Identifier>(altExp, () => 'expression' in (altExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(Identifier)
                    if (isIdent) { expect(altExp.value).toBe('y') }
                }
            }
        }
    })
})

