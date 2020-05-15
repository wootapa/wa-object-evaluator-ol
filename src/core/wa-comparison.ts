import { Primitive, IJsonDump, IEvaluatable, PrimitiveThing } from "./wa-contracts";
import { Util } from "./wa-util";

export interface IComparisonOpts {
    isDate?: boolean
}
export interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean
    wildCard?: string
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
        this._value = Util.resolveOperatorValue(value);
    }
};

export abstract class Comparison extends KeyValue implements IEvaluatable {
    static alias: string;
    protected _opts?: IComparisonOpts;

    constructor(key: string, value: PrimitiveThing, opts?: IComparisonOpts) {
        super(key, value);
        this._opts = opts;

        // opts is defined when constructing from stringified json
        if (this._opts?.isDate && typeof (this._value == 'string')) {
            this._value = new Date(Date.parse(this._value as string));
        }
        this._opts = { isDate: this._value instanceof Date, ...opts };
    }

    get opts() {
        return this._opts;
    }

    toJson(): IJsonDump {
        return {
            type: (this.constructor as any).alias,
            ctorArgs: [this._key, this._value, this._opts]
        };
    }

    evaluate<PrimitiveThing>(obj: PrimitiveThing): boolean {
        // Get object and compare values
        let objValue = Util.resolveObjectValue<Primitive, PrimitiveThing>(this._key, obj);

        if (this instanceof ComparisonEquals) {
            return objValue === this._value;
        }
        if (this instanceof ComparisonIsNull) {
            return objValue === null || objValue === undefined;
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

            if (objValue && this._value) {
                let o = objValue.toString() as string;

                if (!this['valueRe']) {
                    let v = `*${this._value.toString()}*`
                        .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&")
                        .replace(new RegExp(`\\${opts.wildCard}`, 'g'), ".*")
                        .replace(/\?/g, ".");
                    const flags = !opts.matchCase ? 'i' : '';
                    this['valueRe'] = new RegExp(v, flags);
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
    equals(key: string, value: PrimitiveThing): T
    isNull(key: string): T
    eq(key: string, value: PrimitiveThing): T
    greaterThan(key: string, value: PrimitiveThing): T
    gt(key: string, value: PrimitiveThing): T
    greaterThanEquals(key: string, value: PrimitiveThing): T
    gte(key: string, value: PrimitiveThing): T
    lessThan(key: string, value: PrimitiveThing): T
    lt(key: string, value: PrimitiveThing): T
    lessThanEquals(key: string, value: PrimitiveThing): T
    lte(key: string, value: PrimitiveThing): T
    like(key: string, value: PrimitiveThing, options?: IComparisonOpts): T
    ilike(key: string, value: PrimitiveThing, options?: IComparisonOpts): T
    any(key: string, values: PrimitiveThing[]): T
}
export class ComparisonEquals extends Comparison {
    static alias = 'eq'
}
export class ComparisonIsNull extends Comparison {
    static alias = 'isnull'
}
export class ComparisonGreaterThan extends Comparison {
    static alias = 'gt'
}
export class ComparisonGreaterThanEquals extends Comparison {
    static alias = 'gte'
}
export class ComparisonLessThan extends Comparison {
    static alias = 'lt'
}
export class ComparisonLessThanEquals extends Comparison {
    static alias = 'lte'
}
export class ComparisonLike extends Comparison {
    static alias = 'like'
    constructor(key: string, value: PrimitiveThing, opts?: ILikeOptions) {
        super(key, value, { matchCase: true, wildCard: '*', ...opts });
    };
    get opts() {
        return this._opts as ILikeOptions;
    };
}
