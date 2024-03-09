import { start } from "./repl"

async function main() {
    console.log('Hello!')
    start().catch(console.error)
}

main().catch(console.error)

