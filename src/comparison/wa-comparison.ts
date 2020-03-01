import { ValueOrGetter, Primitive, IValueGetter, ObjectOrDict, IEvaluatable } from "../base/wa-contracts";
import { ComparisonBuilder } from "./wa-comparison-builder";

interface IComparisonOpts { }
interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean
}

export abstract class ComparisonBase implements IEvaluatable {
    private _property: string;
    private _value: ValueOrGetter;
    private _opts?: IComparisonOpts

    constructor(property: string, value: ValueOrGetter, opts?: IComparisonOpts) {
        this._property = property;
        this._value = value;
        this._opts = opts;
    }

    // Returns simple and deeply nested properties.
    protected getDictValue = (dict: ObjectOrDict, property: string): Primitive => {
        return property
            .split('.')
            .reduce((dict, part) => dict[part], dict as any);
    };

    evaluate(object: ObjectOrDict, getter?: IValueGetter): boolean {
        // Use getter function if defined
        let objValue = typeof getter === "function"
            ? getter.apply(object, [this._property])
            : this.getDictValue(object, this._property)

        // Call value when value is not a primitive
        let cmpValue = typeof this._value === "function"
            ? (this._value as IValueGetter)(this._property)
            : this._value;

        if (this instanceof ComparisonEquals) {
            return objValue === cmpValue;
        }
        if (this instanceof ComparisonGreaterThan) {
            return objValue > cmpValue;
        }
        if (this instanceof ComparisonGreaterThanEquals) {
            return objValue >= cmpValue;
        }
        if (this instanceof ComparisonLessThan) {
            return objValue < cmpValue;
        }
        if (this instanceof ComparisonLessThanEquals) {
            return objValue <= cmpValue;
        }
        if (this instanceof ComparisonLike) {
            const opts = this._opts as ILikeOptions;
            let a = (objValue as string)?.toString();
            let b = (cmpValue as string)?.toString();
            if (!opts.matchCase) {
                a = a?.toLowerCase();
                b = b?.toLowerCase();
            }
            return a?.indexOf(b) > -1;
        }
        return false;
    }
}

// Exports
export interface IComparison {
    equals(property: string, value: ValueOrGetter): ComparisonBuilder
    eq(property: string, value: ValueOrGetter): ComparisonBuilder
    greaterThan(property: string, value: ValueOrGetter): ComparisonBuilder
    gt(property: string, value: ValueOrGetter): ComparisonBuilder
    greaterThanEquals(property: string, value: ValueOrGetter): ComparisonBuilder
    gte(property: string, value: ValueOrGetter): ComparisonBuilder
    lessThan(property: string, value: ValueOrGetter): ComparisonBuilder
    lt(property: string, value: ValueOrGetter): ComparisonBuilder
    lessThanEquals(property: string, value: ValueOrGetter): ComparisonBuilder
    lte(property: string, value: ValueOrGetter): ComparisonBuilder
    like(property: string, value: ValueOrGetter, options?: IComparisonOpts): ComparisonBuilder
    ilike(property: string, value: ValueOrGetter, options?: IComparisonOpts): ComparisonBuilder
    any(property: string, values: ValueOrGetter[]): ComparisonBuilder
}
export class ComparisonEquals extends ComparisonBase { }
export class ComparisonGreaterThan extends ComparisonBase { }
export class ComparisonGreaterThanEquals extends ComparisonBase { }
export class ComparisonLessThan extends ComparisonBase { }
export class ComparisonLessThanEquals extends ComparisonBase { }
export class ComparisonLike extends ComparisonBase { }