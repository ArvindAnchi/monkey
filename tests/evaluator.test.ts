import { describe, test, expect } from 'vitest'

import * as obj from '../objects'
import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Eval } from '../evaluator'

function is<T>(obj: any, param: string): obj is T {
    return param in obj
}

function testEval(input: string) {
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)

    const program = parser.parseProgram()

    return Eval(program)
}

function testIntObject(obj: obj.MObject | null, expected: Number) {
    if (obj == null) {
        throw new Error("Got 'null' obj")
    }

    if (!is<obj.Integer>(obj, 'Value')) {
        throw new Error(`Expected Integer, got ${obj.Type()}`)
    }

    expect(obj.Value).toBe(expected)
}

function testBoolObject(obj: obj.MObject | null, expected: boolean) {
    if (obj == null) {
        throw new Error("Got 'null' obj")
    }

    if (!is<obj.Boolean>(obj, 'Value')) {
        throw new Error(`Expected Boolean, got ${obj.Type()}`)
    }

    expect(obj.Value).toBe(expected)
}

describe('Evaluator', () => {
    test('Int expression', () => {
        const tests = [
            { input: '5', expected: 5 },
            { input: '10', expected: 10 },
            { input: '-5', expected: -5 },
            { input: '-10', expected: -10 },
            { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
            { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
            { input: "-50 + 100 + -50", expected: 0 },
            { input: "5 * 2 + 10", expected: 20 },
            { input: "5 + 2 * 10", expected: 25 },
            { input: "20 + 2 * -10", expected: 0 },
            { input: "50 / 2 * 2 + 10", expected: 60 },
            { input: "2 * (5 + 10)", expected: 30 },
            { input: "3 * 3 * 3 + 10", expected: 37 },
            { input: "3 * (3 * 3) + 10", expected: 37 },
            { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)
            testIntObject(evaluated, tt.expected)
        }
    })

    test('Bool expression', () => {
        const tests = [
            { input: 'true', expected: true },
            { input: 'false', expected: false },
            { input: "true", expected: true },
            { input: "false", expected: false },
            { input: "1 < 2", expected: true },
            { input: "1 > 2", expected: false },
            { input: "1 < 1", expected: false },
            { input: "1 > 1", expected: false },
            { input: "1 == 1", expected: true },
            { input: "1 != 1", expected: false },
            { input: "1 == 2", expected: false },
            { input: "1 != 2", expected: true },
            { input: "true == true", expected: true },
            { input: "false == false", expected: true },
            { input: "true == false", expected: false },
            { input: "true != false", expected: true },
            { input: "false != true", expected: true },
            { input: "(1 < 2) == true", expected: true },
            { input: "(1 < 2) == false", expected: false },
            { input: "(1 > 2) == true", expected: false },
            { input: "(1 > 2) == false", expected: true },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)
            testBoolObject(evaluated, tt.expected)
        }
    })

    test('Not operator', () => {
        const tests = [
            { input: '!true', expected: false },
            { input: '!false', expected: true },
            { input: '!5', expected: false },
            { input: '!!true', expected: true },
            { input: '!!false', expected: false },
            { input: '!!5', expected: true },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)
            testBoolObject(evaluated, tt.expected)
        }
    })
})

