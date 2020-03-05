import { LogicalAnd, LogicalOr, LogicalNot, Logical } from "./wa-logical";
import { IValueGetter, ObjectOrDict, ValueOrGetter, Filter } from "./wa-contracts";
import { ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike, IComparison } from "./wa-comparison";

export interface IBuilder { }
export abstract class BuilderBase<T extends BuilderBase<T>> implements IBuilder, IComparison<T> {
    protected _logical: Logical;
    protected _this: T;

    // Provided by subclass so we know its type
    protected abstract getThisPointer(): T;

    constructor() {
        this._this = this.getThisPointer();
        this._logical = new LogicalAnd(this._this)
    }

    // Static factory
    static create<T extends BuilderBase<T>>(this: { new(): T }) {
        return new this();
    }

    // Helper
    protected _add(filter: Filter) {
        return this._logical.add(filter);
    }

    // Builder
    clear(): T {
        this._logical = new LogicalAnd(this);
        return this._this;
    };

    done(): T {
        while (this._logical.getParent() !== this._this) {
            this.up();
        }
        return this._this;
    };

    up(): T {
        if (this._logical.getParent() === this._this) {
            return this._this;
        }
        this._logical = this._logical.getParent() as Logical;
        return this._this;
    };

    // Evaluate
    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        return this._logical.evaluate(obj, getter);
    };

    // Logical
    and(): T {
        this._logical = this._logical.add(new LogicalAnd(this._logical)) as Logical;
        return this._this;
    };

    or(): T {
        this._logical = this._logical.add(new LogicalOr(this._logical)) as Logical;
        return this._this;
    };

    not(): T {
        this._logical = this._logical.add(new LogicalNot(this._logical)) as Logical;
        return this._this;
    };

    // Comparison
    equals(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonEquals(property, value));
        return this._this;
    };
    eq = this.equals;

    greaterThan(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonGreaterThan(property, value));
        return this._this;
    };
    gt = this.greaterThan;

    greaterThanEquals(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonGreaterThanEquals(property, value));
        return this._this;
    };
    gte = this.greaterThanEquals;

    lessThan(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonLessThan(property, value));
        return this._this;
    };
    lt = this.lessThan;

    lessThanEquals(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonLessThanEquals(property, value));
        return this._this;
    };
    lte = this.lessThanEquals;

    like(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonLike(property, value, { matchCase: true }));
        return this._this;
    };

    ilike(property: string, value: ValueOrGetter): T {
        this._logical.add(new ComparisonLike(property, value, { matchCase: false }));
        return this._this;
    };

    any(property: string, values: ValueOrGetter[]): T {
        if (values.length) {
            let or = this._logical.add(new LogicalOr(this._logical)) as Logical;
            values.forEach(value => or.add(new ComparisonEquals(property, value)));
        }
        return this._this;
    };
}

export class BuilderCore extends BuilderBase<BuilderCore> {
    protected getThisPointer(): BuilderCore {
        return this;
    }
}