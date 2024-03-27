import { MObject } from "./objects";

export class Environment {
    private store: Record<string, MObject>

    constructor() {
        this.store = {}
    }

    get(name: string) {
        return this.store[name]
    }

    set(name: string, obj: MObject) {
        this.store[name] = obj
    }
}

