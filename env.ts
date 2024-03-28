import { Err, MObject } from "./objects";

export class Environment {
    private store: Record<string, MObject>
    private outer: Environment | null

    constructor(outer?: Environment) {
        this.store = {}
        this.outer = outer ?? null
    }

    get(name: string): MObject {
        if (!(name in this.store)) {
            if (this.outer != null && name in this.outer) {
                return this.outer.get(name)
            }

            return new Err(`identifier not found: ${name}`)
        }

        return this.store[name]
    }

    set(name: string, obj: MObject) {
        this.store[name] = obj
    }
}

