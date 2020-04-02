import { Primitive, IJsonDump, IEvaluatable, PrimitiveThing } from "./wa-contracts";
import { Util } from "./wa-util";

interface IComparisonOpts { }
interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean
    wildCard: string
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

    constructor(key: string, value: PrimitiveThing) {
        this._key = key;
        this._value = Util.resolveCompareValue(this._key, value);
    }
};

export abstract class Comparison extends KeyValue implements IEvaluatable {
    private _opts?: IComparisonOpts;

    constructor(key: string, value: PrimitiveThing, opts?: IComparisonOpts) {
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

    evaluate<PrimitiveThing>(obj: PrimitiveThing): boolean {
        // Get object and compare values
        let objValue = Util.resolveObjectValue(this._key, obj);

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
            const opts = { matchCase: true, wildCard: '*', ...this._opts } as ILikeOptions;

            if (objValue && this._value) {
                let o = objValue.toString() as string;

                if (!this['valueRe']) {
                    let v = `*${this._value.toString()}*`
                        .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&")
                        .replace(/\*/g, ".*")
                        .replace(/\?/g, ".");
                    const flags = !opts.matchCase ? 'i' : '';
                    this['valueRe'] = new RegExp(v, flags);
                    console.log('Creating re');
                }
                return this['valueRe'].test(o);
            }
            return false;
        }
        return false;
    }
}

// Exports to be implemented in builder
export interface IComparison<T> {
    equals(property: string, value: PrimitiveThing): T
    eq(property: string, value: PrimitiveThing): T
    greaterThan(property: string, value: PrimitiveThing): T
    gt(property: string, value: PrimitiveThing): T
    greaterThanEquals(property: string, value: PrimitiveThing): T
    gte(property: string, value: PrimitiveThing): T
    lessThan(property: string, value: PrimitiveThing): T
    lt(property: string, value: PrimitiveThing): T
    lessThanEquals(property: string, value: PrimitiveThing): T
    lte(property: string, value: PrimitiveThing): T
    like(property: string, value: PrimitiveThing, options?: IComparisonOpts): T
    ilike(property: string, value: PrimitiveThing, options?: IComparisonOpts): T
    any(property: string, values: PrimitiveThing[]): T
}
export class ComparisonEquals extends Comparison { }
export class ComparisonGreaterThan extends Comparison { }
export class ComparisonGreaterThanEquals extends Comparison { }
export class ComparisonLessThan extends Comparison { }
export class ComparisonLessThanEquals extends Comparison { }
export class ComparisonLike extends Comparison { }
