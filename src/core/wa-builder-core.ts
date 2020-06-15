import { ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonIsNull, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike, IComparison, KeyValue } from "./wa-comparison";
import { ClassDict, IBuilderOpts, IDictionary, IJsonDump, IReportSummary, IRuntimeOperatorCallback, Operator, PrimitiveThing } from "./wa-contracts";
import { Logical, LogicalAnd, LogicalNot, LogicalOr } from "./wa-logical";
import { RuntimeOperator, RuntimeOperatorDef } from "./wa-runtime";
import { Util } from "./wa-util";

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
    protected abstract _getBuilder(): T;

    // Provided by subclass so we know how to create unknown operators
    protected abstract _getClassDict(): ClassDict;

    // Provides configuration for subclass when restoring from json
    protected abstract _setConfiguration(config: IBuilderOpts): void;

    // Gets configuration from subclass when serializing to json
    protected abstract _getConfiguration(): IBuilderOpts;

    constructor() {
        this._this = this._getBuilder();
        // Use AND by default. Overridden in static constructors.
        this._logical = new LogicalAnd(this._this)
        // Merge base and implementation classmaps
        clazzDict = { ...clazzDict, ...this._this._getClassDict() };
    }

    /**
     * Creates new builder from JSON.
     *
     * @param json - JSON (or stringified) output from a builder
     * @returns Builder
     */
    static fromJson<T extends BuilderCoreBase<T>>(this: { new(): T }, json: IJsonDump | string) {
        const jsonParsed = (typeof (json) === 'string' ? JSON.parse(json) : json) as IJsonDump;
        const builder = new this();
        builder._setConfiguration(jsonParsed.builderOpts);
        builder._logical = Logical.fromJson(jsonParsed, clazzDict, builder);
        return builder;
    }

    /**
     * Creates a new builder with a root `and` operator (True when all child operators are true).
     *
     * @returns Builder
     */
    static and<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalAnd(builder);
        return builder;
    }

    /**
     * Creates a new builder with a root `or` operator (True when any child operator is true).
     *
     * @returns Builder
     */
    static or<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalOr(builder);
        return builder;
    }

    /**
     * Creates a new builder with a root `not` operator (True when all child operators are false).
     *
     * @returns Builder
     */
    static not<T extends BuilderCoreBase<T>>(this: { new(): T }) {
        const builder = new this();
        builder._logical = new LogicalNot(builder);
        return builder;
    }

    /**
     * Defines a custom operator.
     *
     * @param alias - The name of the operator
     * @param func - The function to be called
     */
    static define<T extends BuilderCoreBase<T>>(alias: string, func: IRuntimeOperatorCallback) {
        if (alias in clazzDict) {
            throw new Error(`Operator:${alias} already defined`);
        }
        clazzDict[alias] = new RuntimeOperatorDef(alias, func);
    }

    /**
     * Returns array of all operator aliases.
     * 
     * @returns All operator aliases
     */
    static getOperatorAlias() {
        return Object.keys(clazzDict);
    }

    /**
     * Serializes builder as JSON.
     * 
     * @returns builder as JSON
     */
    asJson(): IJsonDump {
        return { ...this._logical.asJson(), builderOpts: this._getConfiguration() };
    }

    /**
     * Returns builder as a human readable tree.
     * 
     * @returns builder as a human readable tree
     */
    asTree() {
        const pad = '#';
        const walk = (operator: Operator, indent = 0): string => {
            if (operator instanceof Logical) {
                return `${pad.repeat(indent)}${operator.getAlias()}↘
                    ${operator.getOperators().map(op => walk(op, indent + operator.getAlias().length)).join('\n')}`;
            }
            const kv = operator as unknown as KeyValue;
            return `${pad.repeat(indent)}${kv.key} ${operator.getAlias()} ${kv.value ?? ''}`;
        }
        return walk(this._logical)
            .split('\n')
            .map(v => v.trim().replace(new RegExp(pad, 'g'), ' '))
            .join('\n');
    }

    /**
     * Returns a report with evaluation statistics.
     * 
     * @returns A report with evaluation statistics
     */
    getReport(): IReportSummary {
        const report = this._logical.getReport();

        const summary: IReportSummary = {
            duration: report.duration,
            truths: report.truths,
            falses: report.falses,
            details: [report]
        };

        this._logical.getOperatorsTree().forEach(op => {
            const report = op.getReport();
            summary.duration += report.duration;
            summary.truths += report.truths;
            summary.falses += report.falses;
            summary.details.push(report);
        });
        return summary;
    }

    /**
     * Resets report statistics.
     * 
     * @returns Builder
     */
    resetReport(): T {
        this._logical.resetReport();
        this._logical.getOperatorsTree().forEach(op => op.resetReport());
        return this._this;
    }

    /**
     * Evaluates object.
     * 
     * @param obj - The object to evaluate
     * 
     * @returns True if object passed all child operators
     */
    evaluate(obj: PrimitiveThing) {
        return this._logical.evaluate(obj);
    }

    /**
     * Clears all operators in current logical and below.
     * 
     * @returns Builder
     */
    clear(): T {
        this._logical.clear();
        return this._this;
    }

    /**
     * Moves to root logical.
     * 
     * @returns Builder
     */
    done(): T {
        while (this._logical.getParent() !== this._this) {
            this.up();
        }
        return this._this;
    }

    /**
     * Moves to parent logical (if any).
     * 
     * @returns Builder
     */
    up(): T {
        if (this._logical.getParent() === this._this) {
            return this._this;
        }
        this._logical = this._logical.getParent() as Logical;
        return this._this;
    }

    /**
     * Moves to first child logical.
     * 
     * @returns Builder
     */
    down(): T {
        const childLogical = this._logical.getOperators().find(op => op instanceof Logical) as Logical;
        if (childLogical) {
            this._logical = childLogical;
        }
        return this._this;
    }

    /**
     * Moves to next logical sibling (if any).
     * 
     * @returns Builder
     */
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

    /**
     * Moves to previous logical sibling (if any).
     * 
     * @returns Builder
     */
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

    /**
     * Returns a clone of builder.
     * 
     * @returns A new builder
     */
    clone(): T {
        return Util.classOf(this._this).fromJson(this._this.asJson());
    }

    /**
     * Adds another builder.
     * 
     * @param builder - The builder to add
     * 
     * @returns Builder
     */
    addBuilder(builder: T): T {
        this._logical.add(builder._logical);
        return this._this;
    }

    /**
     * Returns keys and values for non logical operators.
     * 
     * @returns Keys and values for non logical operators
     */
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

    /**
     * Returns true when all child operators are true.
     * 
     * @returns Builder
     */
    and(): T {
        this._logical = this._logical.add(new LogicalAnd(this._logical)) as Logical;
        return this._this;
    }

    /**
     * Returns true when at least one child operator is true.
     * 
     * @returns Builder
     */
    or(): T {
        this._logical = this._logical.add(new LogicalOr(this._logical)) as Logical;
        return this._this;
    }

    /**
     * Returns true when all child operators are false.
     * 
     * @returns Builder
     */
    not(): T {
        this._logical = this._logical.add(new LogicalNot(this._logical)) as Logical;
        return this._this;
    }

    /**
     * Returns true when object[key] is equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    equals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonEquals(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    eq(key: string, value: PrimitiveThing) {
        return this.equals(key, value);
    }

    /**
     * Returns true when object[key] is null or undefined.
     * 
     * @param key - The key/property to evaluate
     * 
     * @returns Builder
     */
    isNull(key: string): T {
        this._logical.add(new ComparisonIsNull(key, null));
        return this._this;
    }

    /**
     * Returns true when object[key] is greater than value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    greaterThan(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThan(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is greater than value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    gt(key: string, value: PrimitiveThing) {
        return this.greaterThan(key, value);
    }

    /**
     * Returns true when object[key] is greater or equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    greaterThanEquals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonGreaterThanEquals(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is greater or equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    gte(key: string, value: PrimitiveThing) {
        return this.greaterThanEquals(key, value);
    }

    /**
     * Returns true when object[key] is less than value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    lessThan(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThan(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is less than value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    lt(key: string, value: PrimitiveThing) {
        return this.lessThan(key, value);
    }

    /**
     * Returns true when object[key] is less or equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    lessThanEquals(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLessThanEquals(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is less or equal to value.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
    lte(key: string, value: PrimitiveThing) {
        return this.lessThanEquals(key, value);
    }

    /**
     * Returns true when object[key] is similar to value. 
     * Case sensitive.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value/pattern to compare
     * 
     * @returns Builder
     */
    like(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(key, value, { matchCase: true }));
        return this._this;
    }

    /**
     * Returns true when object[key] is similar to value. 
     * Case insensitive.
     * 
     * @param key - The key/property to evaluate
     * @param value - The value/pattern to compare
     * 
     * @returns Builder
     */
    ilike(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(key, value, { matchCase: false }));
        return this._this;
    }

    /**
     * Returns true when object[key] is found in values.
     * 
     * @param key - The key/property to evaluate
     * @param values - The values to compare
     * 
     * @returns Builder
     */
    any(key: string, values: PrimitiveThing[]): T {
        if (values.length) {
            const or = this._logical.add(new LogicalOr(this._logical)) as Logical;
            values.forEach(value => or.add(new ComparisonEquals(key, value)));
        }
        return this._this;
    }

    /**
     * Adds an operator by its alias
     * 
     * @param alias - Alias of the operator
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     * 
     * @returns Builder
     */
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

    /**
     * Adds an operator by its alias
     * 
     * @param alias - Alias of the operator
     * @param key - The key/property to evaluate
     * @param value - Optional value to compare
     * @param opts - Optional operator options
     * 
     * @returns Builder
     */
    op(alias: string, key: string, value?: PrimitiveThing, opts?: any): T {
        return this.operator(alias, key, value, opts);
    }
}

export class BuilderCore extends BuilderCoreBase<BuilderCore> {

    protected _setConfiguration(config: IBuilderOpts): void { }

    protected _getConfiguration(): IBuilderOpts {
        return {};
    }

    protected _getClassDict(): IDictionary<Function> {
        return {};
    }

    protected _getBuilder(): BuilderCore {
        return this;
    }
}
