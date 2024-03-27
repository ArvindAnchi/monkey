import { Err, MObject } from "./objects";

export class Environment {
    private store: Record<string, MObject>

    constructor() {
        this.store = {}
    }

    get(name: string) {
        if (!(name in this.store)) {
            return new Err(`identifier not found: ${name}`)
        }

        return this.store[name]
    }

    set(name: string, obj: MObject) {
        this.store[name] = obj
    }
}

