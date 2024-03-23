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

describe('Evaluator', () => {
    test('Int expression', () => {
        const tests = [
            { input: '5', expected: 5 },
            { input: '10', expected: 10 },
        ]

        for (const tt of tests) {
            const evaluated = testEval(tt.input)
            testIntObject(evaluated, tt.expected)
        }
    })
})

