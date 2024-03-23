import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import { Lexer } from './lexer'
import { Parser } from './parser'
import { Eval } from './evaluator'

const prompt = '>> '

export async function start() {
    const rl = createInterface({ input, output })

    while (true) {
        const c = await rl.question(prompt)

        if (c == '') {
            rl.close()
            return
        }

        const lexer = new Lexer(c)
        const parser = new Parser(lexer)

        const program = parser.parseProgram()

        const pErrs = parser.getErrors()

        if (pErrs.length > 0) {
            console.error(`  ERROR: Got ${pErrs.length} parsing errors`)

            for (const err of pErrs) {
                console.error(`    ${err}`)
            }

            continue
        }

        console.log('  Parsed:', program.asString())

        const evaluated = Eval(program)

        if (evaluated == null) {
            console.log('  Error: Could not evaluate')
            continue
        }

        console.log(evaluated.Inspect())
    }
}

