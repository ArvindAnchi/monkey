import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import { Lexer } from './lexer/lexer'
import { Token } from './token/token'

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

        for (let tok = lexer.NextToken(); tok.Type != Token.EOF; tok = lexer.NextToken()) {
            console.log({ Literal: tok.Literal, Type: tok.Type })
        }
    }
}

