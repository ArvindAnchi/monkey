import { describe, test, expect } from 'vitest'

import * as objs from '../objects'
import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Eval } from '../evaluator'
import { Environment } from '../env'

function is<T>(obj: any, param: string): obj is T {
    return param in obj
}

function testEval(input: string) {
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const env = new Environment()

    const program = parser.parseProgram()

    return Eval(program, env)
}

function testIntObject(obj: objs.MObject, expected: Number) {
    if (obj.Type() == objs.NULL_OBJ) {
        throw new Error("Expected Boolean, got 'null' obj")
    }

    if (!is<objs.Integer>(obj, 'Value')) {
        throw new Error(`Expected Integer, got ${obj.Type()}`)
    }

    expect(obj.Value).toBe(expected)
}

function testBoolObject(obj: objs.MObject, expected: boolean) {
    if (obj.Type() == objs.NULL_OBJ) {
        throw new Error("Expected Boolean, got 'null' obj")
    }

    if (!is<objs.Boolean>(obj, 'Value')) {
        throw new Error(`Expected Boolean, got ${obj.Type()}`)
    }

    expect(obj.Value).toBe(expected)
}

function testNullObject(obj: objs.MObject) {
    if (obj.Type() !== objs.NULL_OBJ) {
        throw new Error(`Expected 'null' obj, got ${obj.Type()}`)
    }
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

    test('If Else expression', () => {
        const tests = [
            { input: "if (true) { 10 }", expected: 10 },
            { input: "if (false) { 10 }", expected: null },
            { input: "if (1) { 10 }", expected: 10 },
            { input: "if (1 < 2) { 10 }", expected: 10 },
            { input: "if (1 > 2) { 10 }", expected: null },
            { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
            { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)

            if (typeof tt.expected === 'number') {
                testIntObject(evaluated, tt.expected)
            } else {
                testNullObject(evaluated)
            }
        }
    })

    test('Return statement', () => {
        const tests = [
            { input: "return 10;", expected: 10 },
            { input: "return 10; 9;", expected: 10 },
            { input: "return 2 * 5; 9;", expected: 10 },
            { input: "9; return 2 * 5; 9;", expected: 10 },
            { input: "if (true) { if (true) { return 10 } return 1 }", expected: 10 },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)
            testIntObject(evaluated, tt.expected)
        }
    })

    test('Error handling', () => {
        const tests = [
            { input: "5 + true;", eMsg: "type mismatch: INTEGER + BOOLEAN", },
            { input: "5 + true; 5;", eMsg: "type mismatch: INTEGER + BOOLEAN", },
            { input: "-true", eMsg: "unknown operator: -BOOLEAN", },
            { input: "true + false;", eMsg: "unknown operator: BOOLEAN + BOOLEAN", },
            { input: "5; true + false; 5", eMsg: "unknown operator: BOOLEAN + BOOLEAN", },
            { input: "if (10 > 1) { true + false; }", eMsg: "unknown operator: BOOLEAN + BOOLEAN", },
            { input: 'if (10 > 1) { if (10 > 1) { return true + false; }  return 1; }', eMsg: "unknown operator: BOOLEAN + BOOLEAN", },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)

            if (!is<objs.Err>(evaluated, 'message')) {
                throw new Error(`Expected Err_Oject, got ${evaluated.Type()}`)
            }

            expect(evaluated.message).toBe(tt.eMsg)
        }
    })
})

