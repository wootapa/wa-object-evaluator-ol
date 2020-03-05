import { IEvaluatable, ValueOrGetter, ObjectOrDict, IValueGetter, ValueResolver } from ".";

interface IComparisonOpts { }
interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean
}

export abstract class Comparison implements IEvaluatable {
    constructor(
        private _key: string,
        private _value: ValueOrGetter,
        private _opts?: IComparisonOpts) { }

    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        // Get object and compare values
        let objValue = ValueResolver.resolveObjectValue(this._key, obj, getter);
        let cmpValue = ValueResolver.resolveCompareValue(this._key, this._value);

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