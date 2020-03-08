import { Primitive, IJsonDump, ValueOrGetter, IEvaluatable, ObjectOrDict, IValueGetter } from "./wa-contracts";
import { ValueResolver } from "./wa-util";

interface IComparisonOpts { }
interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean
}

export abstract class KeyValue {
    protected _key: string;
    protected _value: Primitive;

    get key() {
        return this._key;
    }

    get value() {
        return this._value;
    }

    constructor(key: string, value: ValueOrGetter) {
        this._key = key;
        this._value = ValueResolver.resolveCompareValue(this._key, value);
    }
};

export abstract class Comparison extends KeyValue implements IEvaluatable {
    private _opts?: IComparisonOpts;

    constructor(key: string, value: ValueOrGetter, opts?: IComparisonOpts) {
        super(key, value);
        this._opts = opts;
    }

    static fromJson(json: any) {
        return new ComparisonEquals(json.key, json.value, json.opts);
    }

    toJson(): IJsonDump {
        return {
            type: this.constructor.name,
            ctorArgs: [this._key, this._value, this._opts]
        };
    }

    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        // Get object and compare values
        let objValue = ValueResolver.resolveObjectValue(this._key, obj, getter);

        if (this instanceof ComparisonEquals) {
            return objValue === this._value;
        }
        if (this instanceof ComparisonGreaterThan) {
            return objValue > this._value;
        }
        if (this instanceof ComparisonGreaterThanEquals) {
            return objValue >= this._value;
        }
        if (this instanceof ComparisonLessThan) {
            return objValue < this._value;
        }
        if (this instanceof ComparisonLessThanEquals) {
            return objValue <= this._value;
        }
        if (this instanceof ComparisonLike) {
            const opts = this._opts as ILikeOptions;
            let a = (objValue as string)?.toString();
            let b = (this._value as string)?.toString();
            if (!opts.matchCase) {
                a = a?.toLowerCase();
                b = b?.toLowerCase();
            }
            return a?.indexOf(b) > -1;
        }
        return false;
    }
}

// Exports to be implemented in builder
export interface IComparison<T> {
    equals(property: string, value: ValueOrGetter): T
    eq(property: string, value: ValueOrGetter): T
    greaterThan(property: string, value: ValueOrGetter): T
    gt(property: string, value: ValueOrGetter): T
    greaterThanEquals(property: string, value: ValueOrGetter): T
    gte(property: string, value: ValueOrGetter): T
    lessThan(property: string, value: ValueOrGetter): T
    lt(property: string, value: ValueOrGetter): T
    lessThanEquals(property: string, value: ValueOrGetter): T
    lte(property: string, value: ValueOrGetter): T
    like(property: string, value: ValueOrGetter, options?: IComparisonOpts): T
    ilike(property: string, value: ValueOrGetter, options?: IComparisonOpts): T
    any(property: string, values: ValueOrGetter[]): T
}
export class ComparisonEquals extends Comparison { }
export class ComparisonGreaterThan extends Comparison { }
export class ComparisonGreaterThanEquals extends Comparison { }
export class ComparisonLessThan extends Comparison { }
export class ComparisonLessThanEquals extends Comparison { }
export class ComparisonLike extends Comparison { }
