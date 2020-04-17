import { LogicalAnd, LogicalOr, LogicalNot, Logical } from "./wa-logical";
import { IDictionary, ClassDict, IJsonDump, PrimitiveThing } from "./wa-contracts";
import { ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike, IComparison, KeyValue, ComparisonIsNull } from "./wa-comparison";
import { Util } from "./wa-util";

export interface IBuilder { }
export abstract class BuilderCoreBase<T extends BuilderCoreBase<T>> implements IBuilder, IComparison<T> {
    // Root logical operator. Always an AND.
    protected _logical: Logical;

    // The instance we return from builder
    protected _this: T;

    // Dict with class constructors. Used when creating from a json dump.
    protected _clazzDict: ClassDict = {
        LogicalAnd,
        LogicalOr,
        LogicalNot,
        ComparisonEquals,
        ComparisonGreaterThan,
        ComparisonGreaterThanEquals,
        ComparisonLessThan,
        ComparisonLessThanEquals,
        ComparisonLike
    };

    // Provided by subclass so we can return the correct type
    protected abstract getBuilder(): T;

    // Provided by subclass so we know how to create unknown operators
    protected abstract getClassDict(): ClassDict;

    constructor() {
        this._this = this.getBuilder();
        // Use AND by default. Overridden in static constructors.
        this._logical = new LogicalAnd(this._this)
        // Merge base and implementation classmaps
        this._clazzDict = { ...this._clazzDict, ...this._this.getClassDict() };
    }

    // Static and preferable logical constructors
    static fromJson<T extends BuilderCoreBase<T>>(this: { new(): T }, json: IJsonDump) {
        const builder = new this();
        const jsonParsed = typeof(json) === 'string' ? JSON.parse(json) : json;
        builder._logical = Logical.fromJson(jsonParsed, builder._clazzDict, builder);
        return builder;
    }

    static and<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalAnd(builder);
        return builder;
    }

    static or<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalOr(builder);
        return builder;
    }

    static not<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalNot(builder);
        return builder;
    }

    // Exports to json
    toJson = () => this._logical.toJson();

    // Evaluates object
    evaluate = (obj: PrimitiveThing) => this._logical.evaluate(obj);

    // Destroys all operators except root
    clear(): T {
        this._logical.clear();
        return this._this;
    }

    // Moves to root logical
    done(): T {
        while (this._logical.getParent() !== this._this) {
            this.up();
        }
        return this._this;
    }

    // Moves to parent logical, or builder itself if at root level.
    up(): T {
        if (this._logical.getParent() === this._this) {
            return this._this;
        }
        this._logical = this._logical.getParent() as Logical;
        return this._this;
    }

    // Clones builder
    clone(): T {
        return Util.classOf(this._this).fromJson(this._this.toJson());
    }

    // Adds another builder
    addBuilder(builder: T): T {
        this._logical.add(builder._logical);
        return this._this;
    }

    // Returns keys with values. Useful when working with json dumps.
    getKeysAndValues() {
        let dict = {};
        Util.forEach(this._logical, operator => {
            if (!(operator instanceof Logical)) {
                const kv = operator as unknown as KeyValue;
                // If we have the same key, make value an array
                dict[kv.key] = dict[kv.key]
                    ? Array.isArray(dict[kv.key])
                        ? dict[kv.key].concat(kv.value)
                        : [dict[kv.key], kv.value]
                    : kv.value;
            }
        });
        return dict;
    }

    // Logical operators
    and(): T {
        this._logical = this._logical.add(new LogicalAnd(this._logical)) as Logical;
        return this._this;
    }

    or(): T {
        this._logical = this._logical.add(new LogicalOr(this._logical)) as Logical;
        return this._this;
    }

    not(): T {
        this._logical = this._logical.add(new LogicalNot(this._logical)) as Logical;
        return this._this;
    }

    // Comparison operators
    equals(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonEquals(property, value));
        return this._this;
    }
    eq = this.equals;

    isNull(property: string): T {
        this._logical.add(new ComparisonIsNull(property, null));
        return this._this;
    }

    greaterThan(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThan(property, value));
        return this._this;
    }
    gt = this.greaterThan;

    greaterThanEquals(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThanEquals(property, value));
        return this._this;
    }
    gte = this.greaterThanEquals;

    lessThan(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThan(property, value));
        return this._this;
    }
    lt = this.lessThan;

    lessThanEquals(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThanEquals(property, value));
        return this._this;
    }
    lte = this.lessThanEquals;

    like(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(property, value, { matchCase: true }));
        return this._this;
    }

    ilike(property: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(property, value, { matchCase: false }));
        return this._this;
    }

    any(property: string, values: PrimitiveThing[]): T {
        if (values.length) {
            let or = this._logical.add(new LogicalOr(this._logical)) as Logical;
            values.forEach(value => or.add(new ComparisonEquals(property, value)));
        }
        return this._this;
    }
}

export class BuilderCore extends BuilderCoreBase<BuilderCore> {
    protected getClassDict(): IDictionary<Function> {
        return {};
    }
    protected getBuilder(): BuilderCore {
        return this;
    }
}
