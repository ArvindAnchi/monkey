import { describe, test, expect } from 'vitest'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import * as ast from '../ast'

function is<T>(obj: any, param: string): obj is T {
    return param in obj
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
    if (!is<ast.IntegerLiteral>(il, 'value')) {
        throw new Error(`Expected IntegerLiteral, got ${il.constructor.name}`)
    }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value.toString())
}

function testBoolLiteral(il: ast.Expression | null, value: boolean) {
    expect(il).toBeTruthy()

    if (il == null) { return }
    if (!is<ast.BooleanExpression>(il, 'value')) {
        throw new Error(`Expected BooleanExpression, got ${il.constructor.name}`)
    }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(String(value))
}

function testIdent(il: ast.Expression | null, value: string) {
    expect(il).toBeTruthy()

    if (il == null) { return }
    if (!is<ast.Identifier>(il, 'value')) {
        throw new Error(`Expected Identifier, got ${il.constructor.name}`)
    }

    expect(il.value).toBe(value)
    expect(il.tokenLiteral()).toBe(value)
}

function testInfixExpression(exp: ast.Expression | null, eLExp: string | number | boolean, eOp: string | number | boolean, eRExp: string | number | boolean) {
    if (!is<ast.InfixExpression>(exp, 'operator')) {
        throw new Error(`Expected InfixExpression, got ${exp?.constructor.name}`)
    }

    switch (typeof eLExp) {
        case 'number': testIntLiteral(exp.left, eLExp); break
        case 'boolean': testBoolLiteral(exp.left, eLExp); break
        case 'string': testIdent(exp.left, eLExp); break
    }

    switch (typeof eRExp) {
        case 'number': testIntLiteral(exp.right, eRExp); break
        case 'boolean': testBoolLiteral(exp.right, eRExp); break
        case 'string': testIdent(exp.right, eRExp); break
    }

    expect(exp.operator).toBe(eOp)
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

            if (!is<ast.LetStatement>(stmt, 'name')) {
                throw new Error(`Expected LetStatement, got ${stmt?.constructor.name}`)
            }

            expect(stmt.tokenLiteral()).toBe('let')
            expect(stmt.name?.value).toBe(tests[i].eIdent)
            expect(stmt.name?.tokenLiteral()).toBe(tests[i].eIdent)
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

            if (!is<ast.ReturnStatement>(stmt, 'value')) {
                throw new Error(`Expected ReturnStatement, got ${stmt?.constructor.name}`)
            }

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

        const stmt = program.statements[0]

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        expect(stmt.tokenLiteral()).toBe('foobar')

        testIdent(stmt.expression, 'foobar')
    })

    test('Int literals', () => {
        const input = '5;'

        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        testIntLiteral(stmt.expression, 5)
    })

    test('Boolean literals', () => {
        const input = 'true;'

        const l = new Lexer(input)
        const p = new Parser(l)

        const program = p.parseProgram()

        checkParserErrors(p)
        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        testBoolLiteral(stmt.expression, true)
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

            if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
                throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
            }

            expect(stmt.tokenLiteral()).toBe(tt.operator)

            const exp = stmt.expression

            if (!is<ast.PrefixExpression>(exp, 'operator')) {
                throw new Error(`Expected PrefixExpression, got ${stmt?.constructor.name}`)
            }

            expect(exp.operator).toBe(tt.operator)
            if (tt.intValue != null) testIntLiteral(exp.right, tt.intValue)
            if (tt.boolValue != null) testBoolLiteral(exp.right, tt.boolValue)
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

            if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
                throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
            }

            testInfixExpression(stmt.expression, tt.left, tt.operator, tt.right)
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
            { input: "a + add(b * c) + d", expected: "((a + add((b * c))) + d)", },
            { input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))", expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))", },
            { input: "add(a + b + c * d / f + g)", expected: "add((((a + b) + ((c * d) / f)) + g))", },
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

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        const exp = stmt.expression

        if (!is<ast.IfExpression>(exp, 'condition')) {
            throw new Error(`Expected IfExpression, got ${stmt?.constructor.name}`)
        }

        const conExp = exp.consequence?.statements[0]

        if (!is<ast.ExpressionStatement>(conExp, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        if (!is<ast.Identifier>(conExp, 'expression')) {
            throw new Error(`Expected Identifier, got ${stmt?.constructor.name}`)
        }

        testInfixExpression(exp.condition, 'x', '<', 'y')

        expect(exp.consequence?.statements.length).toBe(1)
        expect(conExp.expression?.token.Literal).toBe('x')
        expect(exp.alternative?.statements.length).toBeFalsy()
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

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        const exp = stmt.expression

        if (!is<ast.IfExpression>(exp, 'condition')) {
            throw new Error(`Expected IfExpression, got ${stmt?.constructor.name}`)
        }

        testInfixExpression(exp.condition, 'x', '<', 'y')
        expect(exp.consequence?.statements.length).toBe(1)

        const conExp = exp.consequence?.statements[0]
        const altExp = exp.alternative?.statements[0]

        if (!is<ast.ExpressionStatement>(conExp, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        if (!is<ast.ExpressionStatement>(altExp, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        expect(conExp.expression?.token.Literal).toBe('x')
        expect(altExp.expression?.token.Literal).toBe('y')
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

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        const exp = stmt.expression

        if (!is<ast.FunctionLiteral>(exp, 'params')) {
            throw new Error(`Expected FunctionLiteral, got ${stmt?.constructor.name}`)
        }

        const bodyStmt = exp.body?.statements[0]

        if (!is<ast.ExpressionStatement>(bodyStmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${bodyStmt?.constructor.name}`)
        }

        if (!is<ast.Identifier>(exp.params[0], 'value')) {
            throw new Error(`Expected Identifier, got ${stmt?.constructor.name}`)
        }

        if (!is<ast.Identifier>(exp.params[1], 'value')) {
            throw new Error(`Expected Identifier, got ${stmt?.constructor.name}`)
        }

        expect(exp.params).toHaveLength(2)
        expect(exp.params[0].value).toBe('x')
        expect(exp.params[1].value).toBe('y')
        expect(exp.body?.statements).toHaveLength(1)

        testInfixExpression(bodyStmt.expression, 'x', '+', 'y')
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

            if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
                throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
            }

            const func = stmt.expression

            if (!is<ast.FunctionLiteral>(func, 'params')) {
                throw new Error(`Expected FunctionLiteral, got ${stmt?.constructor.name}`)
            }

            expect(func.params).toHaveLength(tt.expectedParams.length)

            for (let i = 0; i < tt.expectedParams.length; i++) {
                testIdent(func.params[i], tt.expectedParams[i])
            }
        }
    })

    test('Call expression', () => {
        const input = 'add(1, 2 * 3, 4 + 5);'

        const lexer = new Lexer(input)
        const parser = new Parser(lexer)

        const program = parser.parseProgram()

        checkParserErrors(parser)

        expect(program).not.toBeNull()
        expect(program.statements.length).toBe(1)

        const stmt = program.statements[0]

        if (!is<ast.ExpressionStatement>(stmt, 'expression')) {
            throw new Error(`Expected ExpressionStatement, got ${stmt?.constructor.name}`)
        }

        const cExp = stmt.expression

        if (!is<ast.CallExpression>(cExp, 'function')) {
            throw new Error(`Expected FunctionLiteral, got ${stmt?.constructor.name}`)
        }

        testIdent(cExp.function, 'add')
        expect(cExp.args).toHaveLength(3)
        testIntLiteral(cExp?.args?.[0] ?? null, 1)
        testInfixExpression(cExp?.args?.[1] ?? null, 2, '*', 3)
        testInfixExpression(cExp?.args?.[2] ?? null, 4, '+', 5)
    })
})

