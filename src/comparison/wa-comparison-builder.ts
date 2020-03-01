
import { IComparison, ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike } from "./wa-comparison";
import { BuilderBase, ValueOrGetter, LogicalOr, Logical } from "../base";

export class ComparisonBuilder extends BuilderBase implements IComparison {

    equals(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonEquals(property, value));
        return this;
    };
    eq = this.equals;

    greaterThan(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonGreaterThan(property, value));
        return this;
    };
    gt = this.greaterThan;

    greaterThanEquals(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonGreaterThanEquals(property, value));
        return this;
    };
    gte = this.greaterThanEquals;

    lessThan(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonLessThan(property, value));
        return this;
    };
    lt = this.lessThan;

    lessThanEquals(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonLessThanEquals(property, value));
        return this;
    };
    lte = this.lessThanEquals;

    like(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonLike(property, value, { matchCase: true }));
        return this;
    };

    ilike(property: string, value: ValueOrGetter): ComparisonBuilder {
        this._logical.add(new ComparisonLike(property, value, { matchCase: false }));
        return this;
    };

    any(property: string, values: ValueOrGetter[]): ComparisonBuilder {
        if (values.length) {
            let or = this._logical.add(new LogicalOr(this._logical)) as Logical;
            values.forEach(value => or.add(new ComparisonEquals(property, value)));
        }
        return this;
    };
}