import { describe, test, expect } from 'vitest'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import * as ast from '../ast'

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

function testIntLiteral(il: ast.Expression | null, value: number) {
    expect(il).toBeTruthy()
    if (il == null) { return }

    if (!is<ast.IntegerLiteral>(il, () => 'number' in il)) { throw new Error(`Expected IntLiteral, got ${typeof il}`) }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
}

function testBoolLiteral(il: ast.Expression | null, value: boolean) {
    expect(il).toBeTruthy()
    if (il == null) { return }

    if (!is<ast.BooleanExpression>(il, () => 'number' in il)) { throw new Error(`Expected IntLiteral, got ${typeof il}`) }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
}

function testIdent(il: ast.Expression | null, value: string) {
    expect(il).toBeTruthy()
    if (il == null) { return }

    if (!is<ast.Identifier>(il, () => 'value' in (il ?? {}))) { throw new Error(`Expected Identifier, got ${typeof il}`) }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
}

function testInfixExpression(exp: ast.Expression | null, eLExp: string | number | boolean, eOp: string | number | boolean, eRExp: string | number | boolean) {
    const isIdent = is<ast.InfixExpression>(exp, () => 'expression' in (exp ?? {}))

    expect(exp).toBeInstanceOf(ast.InfixExpression)
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
            const isLet = is<ast.LetStatement>(stmt, () => 'name' in stmt)

            expect(isLet).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.LetStatement)
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
            const isRet = is<ast.ReturnStatement>(stmt, () => 'value' in stmt)

            expect(isRet).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ReturnStatement)
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
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe('foobar')

            if (isExp) {
                const exp = stmt.expression
                testIdent(exp, 'foobar')
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
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe('5')

            if (isExp) {
                const exp = stmt.expression
                const isIdent = is<ast.IntegerLiteral>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(ast.IntegerLiteral)
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
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe('true')

            if (isExp) {
                const exp = stmt.expression
                const isIdent = is<ast.BooleanExpression>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(ast.BooleanExpression)
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
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ExpressionStatement)
            expect(stmt.tokenLiteral()).toBe(tt.operator)

            if (isExp) {
                const exp = stmt.expression
                const isIdent = is<ast.PrefixExpression>(exp, () => 'expression' in (exp ?? {}))

                expect(stmt.expression).toBeInstanceOf(ast.PrefixExpression)
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
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            expect(isExp).toBeTruthy()
            expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

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
        const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

        expect(isExp).toBeTruthy()
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

        if (isExp) {
            const exp = stmt.expression
            const isIfExp = is<ast.IfExpression>(exp, () => 'condition' in (exp ?? {}))

            expect(stmt.expression).toBeInstanceOf(ast.IfExpression)

            if (isIfExp) {
                testInfixExpression(exp.condition, 'x', '<', 'y')
                expect(exp.consequence?.statements.length).toBe(1)

                const conExp = exp.consequence?.statements[0]
                const isConExp = is<ast.ExpressionStatement>(conExp, () => 'expression' in (exp ?? {}))

                expect(conExp).toBeInstanceOf(ast.ExpressionStatement)

                if (isConExp) {
                    const isIdent = is<ast.Identifier>(conExp, () => 'expression' in (conExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(ast.Identifier)
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
        const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

        expect(isExp).toBeTruthy()
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

        if (isExp) {
            const exp = stmt.expression
            const isIfExp = is<ast.IfExpression>(exp, () => 'condition' in (exp ?? {}))

            expect(stmt.expression).toBeInstanceOf(ast.IfExpression)

            if (isIfExp) {
                testInfixExpression(exp.condition, 'x', '<', 'y')
                expect(exp.consequence?.statements.length).toBe(1)

                const conExp = exp.consequence?.statements[0]
                const altExp = exp.alternative?.statements[0]

                const isConExp = is<ast.ExpressionStatement>(conExp, () => 'expression' in (exp ?? {}))
                const isAltExp = is<ast.ExpressionStatement>(altExp, () => 'expression' in (exp ?? {}))

                expect(conExp).toBeInstanceOf(ast.ExpressionStatement)
                expect(altExp).toBeInstanceOf(ast.ExpressionStatement)

                if (isConExp) {
                    const isIdent = is<ast.Identifier>(conExp, () => 'expression' in (conExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(ast.Identifier)
                    if (isIdent) { expect(conExp.value).toBe('x') }
                }

                if (isAltExp) {
                    const isIdent = is<ast.Identifier>(altExp, () => 'expression' in (altExp ?? {}))

                    expect(stmt.expression).toBeInstanceOf(ast.Identifier)
                    if (isIdent) { expect(altExp.value).toBe('y') }
                }
            }
        }
    })

    test('Func literal', () => {
        const input = 'fn(x, y) { x+y; }'

        const lexer = new Lexer(input)
        const parser = new Parser(lexer)

        const program = parser.parseProgram()

        checkParserErrors(parser)

        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]
        const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

        expect(isExp).toBeTruthy()
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

        if (isExp) {
            const exp = stmt.expression
            const isIfExp = is<ast.FunctionLiteral>(exp, () => 'parameters' in (exp ?? {}))

            expect(stmt.expression).toBeInstanceOf(ast.FunctionLiteral)

            if (isIfExp) {
                expect(exp.params).toHaveLength(2)

                const isParam1Ident = is<ast.Identifier>(exp.params[0], () => 'expression' in (exp ?? {}))
                const isParam2Ident = is<ast.Identifier>(exp.params[1], () => 'expression' in (exp ?? {}))

                expect(exp.params[0]).toBeInstanceOf(ast.Identifier)
                expect(exp.params[1]).toBeInstanceOf(ast.Identifier)

                if (isParam1Ident) { expect(exp.params[0]).toBe('x') }
                if (isParam2Ident) { expect(exp.params[1]).toBe('y') }

                expect(exp.body?.statements).toHaveLength(1)

                const stmt = exp.body?.statements[0]
                const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in (stmt ?? {}))

                expect(isExp).toBeTruthy()
                expect(stmt).toBeInstanceOf(ast.ExpressionStatement)

                if (isExp) {
                    testInfixExpression(stmt.expression, 'x', '+', 'y')
                }
            }
        }
    })

    test('Func params parser', () => {
        const tests = [
            { input: "fn() {};", expectedParams: [] },
            { input: "fn(x) {};", expectedParams: ["x"] },
            { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
        ]

        for (const tt of tests) {
            const lexer = new Lexer(tt.input)
            const parser = new Parser(lexer)

            const program = parser.parseProgram()

            checkParserErrors(parser)

            expect(program).not.toBeNull()
            expect(program.statements.length).toBe(1)

            const stmt = program.statements[0]
            const isExp = is<ast.ExpressionStatement>(stmt, () => 'expression' in stmt)

            if (isExp) {
                const func = stmt.expression
                const isFunc = is<ast.FunctionLiteral>(func, () => 'params' in (func ?? {}))

                if (isFunc) {
                    expect(func.params).toHaveLength(tt.expectedParams.length)

                    for (let i = 0; i < tt.expectedParams.length; i++) {
                        testIdent(func.params[i], tt.expectedParams[i])
                    }
                }
            }
        }
    })
})

