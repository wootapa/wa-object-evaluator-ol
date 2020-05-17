import { IDictionary, ThingOrThingGetter, IReport } from "./wa-contracts";
import now from 'performance-now';

export class Util {
    static getDictValue = <T>(obj: IDictionary<T>, key: string): T => {
        // Check for composite key { 'a.b.c': 'foo'}
        if (key in obj) {
            return obj[key];
        }
        // Split keys and resolve nested { a: { b: { c: 'foo'}}}
        const value = key.split('.').reduce((obj, part) => obj[part] || {}, obj as any);
        return value instanceof Object && Object.keys(value).length === 0 ? undefined : value;
    }

    static resolveObjectValue<T, T2>(key: string, obj: ThingOrThingGetter<T2>): T {
        // Recursively resolve
        const value = obj instanceof Function
            ? Util.resolveObjectValue(key, obj.apply(obj, [key]))
            : obj instanceof Object
                ? Util.getDictValue<T>(obj as IDictionary<T>, key)
                : obj; // Plain

        // Dict value might be a function
        return value instanceof Function
            ? Util.resolveObjectValue(key, value.apply(value, [key]))
            : value as T;
    }

    static resolveOperatorValue<T>(value: ThingOrThingGetter<T>): T {
        // Recursively resolve
        return value instanceof Function
            ? Util.resolveOperatorValue(value.apply(value))
            : value;
    }

    static classOf<T>(o: T): any {
        return o.constructor;
    }
}

export class Reporter {
    private _start: number = 0;
    private _duration: number = 0;
    private _truthy = 0;
    private _falsy = 0;

    constructor(private _id: string) { }

    start() {
        this._start = now();
        return this;
    }

    stop(result: boolean) {
        this._duration += now() - this._start;
        result ? this._truthy++ : this._falsy++;
        return this.getReport();
    }

    reset() {
        this._truthy = 0;
        this._falsy = 0;
        this._duration = 0;
        return this;
    }

    getReport(): IReport {
        return {
            id: this._id,
            duration: this._duration,
            truths: this._truthy,
            falses: this._falsy
        };
    }
}
