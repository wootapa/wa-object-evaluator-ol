import { LogicalAnd, LogicalOr, LogicalNot, Logical } from "./wa-logical";
import { IDictionary, ClassDict, IJsonDump, PrimitiveThing, IRuntimeOperatorCallback, Operator } from "./wa-contracts";
import { ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike, IComparison, KeyValue, ComparisonIsNull } from "./wa-comparison";
import { Util } from "./wa-util";
import { RuntimeOperatorDef, RuntimeOperator } from "./wa-runtime";

// Dict with class constructors. Used when creating from a json dump.
let clazzDict: ClassDict = {
    [LogicalAnd.alias]: LogicalAnd,
    [LogicalOr.alias]: LogicalOr,
    [LogicalNot.alias]: LogicalNot,
    [ComparisonEquals.alias]: ComparisonEquals,
    [ComparisonIsNull.alias]: ComparisonIsNull,
    [ComparisonGreaterThan.alias]: ComparisonGreaterThan,
    [ComparisonGreaterThanEquals.alias]: ComparisonGreaterThanEquals,
    [ComparisonLessThan.alias]: ComparisonLessThan,
    [ComparisonLessThanEquals.alias]: ComparisonLessThanEquals,
    [ComparisonLike.alias]: ComparisonLike
};

export interface IBuilder { }
export abstract class BuilderCoreBase<T extends BuilderCoreBase<T>> implements IBuilder, IComparison<T> {
    // Root logical operator.
    protected _logical: Logical;

    // The instance we return from builder
    protected _this: T;

    // Provided by subclass so we can return the correct type
    protected abstract getBuilder(): T;

    // Provided by subclass so we know how to create unknown operators
    protected abstract getClassDict(): ClassDict;

    constructor() {
        this._this = this.getBuilder();
        // Use AND by default. Overridden in static constructors.
        this._logical = new LogicalAnd(this._this)
        // Merge base and implementation classmaps
        clazzDict = { ...clazzDict, ...this._this.getClassDict() };
    }

    // Static and preferable logical constructors
    static fromJson<T extends BuilderCoreBase<T>>(this: { new(): T }, json: IJsonDump | string) {
        const builder = new this();
        const jsonParsed = typeof (json) === 'string' ? JSON.parse(json) : json;
        builder._logical = Logical.fromJson(jsonParsed, clazzDict, builder);
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

    // Defines runtime operators
    static define<T extends BuilderCoreBase<T>>(alias: string, func: IRuntimeOperatorCallback) {
        if (alias in clazzDict) {
            throw new Error(`Operator:${alias} already defined`);
        }
        clazzDict[alias] = new RuntimeOperatorDef(alias, func);
    }

    // Exports to json
    toJson = () => this._logical.toJson();

    // Evaluates object
    evaluate = (obj: PrimitiveThing) => this._logical.evaluate(obj);

    // Destroys logical operators
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

    // Moves up to parent logical, or builder itself if at root level.
    up(): T {
        if (this._logical.getParent() === this._this) {
            return this._this;
        }
        this._logical = this._logical.getParent() as Logical;
        return this._this;
    }

    // Moves down to first child logical.
    down(): T {
        const childLogical = this._logical.getOperators().find(op => op instanceof Logical) as Logical;
        if (childLogical) {
            this._logical = childLogical;
        }
        return this._this;
    }

    // Moves to next sibling logical
    next(): T {
        const parent = this._logical.getParent();
        if (parent instanceof Logical) {
            const logicals = parent.getOperators().filter(op => op instanceof Logical) as Logical[];
            const idx = logicals.indexOf(this._logical);
            if (idx < logicals.length - 1) {
                this._logical = logicals[idx + 1];
            }
        }
        return this._this;
    }

    // Moves to previous sibling logical
    prev(): T {
        const parent = this._logical.getParent();
        if (parent instanceof Logical) {
            const logicals = parent.getOperators().filter(op => op instanceof Logical) as Logical[];
            const idx = logicals.indexOf(this._logical);
            if (idx > 0) {
                this._logical = logicals[idx - 1];
            }
        }
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
        const walk = (operators: Operator[]) => {
            operators.forEach(operator => {
                if (operator instanceof Logical) {
                    return walk(operator.getOperators());
                }
                const kv = operator as unknown as KeyValue;
                // If we have the same key, make value an array
                dict[kv.key] = dict[kv.key]
                    ? Array.isArray(dict[kv.key])
                        ? dict[kv.key].concat(kv.value)
                        : [dict[kv.key], kv.value]
                    : kv.value;
            });
        }
        walk(this._logical.getOperators());
        return dict;
    }

    static getOperatorAlias() {
        return Object.keys(clazzDict);
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
    equals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonEquals(key, value));
        return this._this;
    }
    eq = this.equals;

    isNull(key: string): T {
        this._logical.add(new ComparisonIsNull(key, null));
        return this._this;
    }

    greaterThan(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThan(key, value));
        return this._this;
    }
    gt = this.greaterThan;

    greaterThanEquals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThanEquals(key, value));
        return this._this;
    }
    gte = this.greaterThanEquals;

    lessThan(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThan(key, value));
        return this._this;
    }
    lt = this.lessThan;

    lessThanEquals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThanEquals(key, value));
        return this._this;
    }
    lte = this.lessThanEquals;

    like(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(key, value, { matchCase: true }));
        return this._this;
    }

    ilike(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(key, value, { matchCase: false }));
        return this._this;
    }

    any(key: string, values: PrimitiveThing[]): T {
        if (values.length) {
            const or = this._logical.add(new LogicalOr(this._logical)) as Logical;
            values.forEach(value => or.add(new ComparisonEquals(key, value)));
        }
        return this._this;
    }

    // Any operator by its alias
    operator(alias: string, key: string, value?: PrimitiveThing, opts?: any): T {
        if (!(alias in clazzDict)) {
            throw new Error(`Invalid operator alias:${alias}`);
        }

        const clazz = clazzDict[alias];
        const operator = clazz instanceof RuntimeOperatorDef
            ? new RuntimeOperator(key, clazz)
            : new clazz(key, value, opts);
        this._logical.add(operator);
        return this._this;
    }
    op = this.operator;
}

export class BuilderCore extends BuilderCoreBase<BuilderCore> {
    protected getClassDict(): IDictionary<Function> {
        return {};
    }
    protected getBuilder(): BuilderCore {
        return this;
    }
}
