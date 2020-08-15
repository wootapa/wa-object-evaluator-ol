import { ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonILike, ComparisonIsNull, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike, IComparison, KeyValue } from './wa-comparison';
import { ClassDict, IEvaluatorOpts, IDictionary, IJsonDump, IReportSummary, IRuntimeOperatorCallback, Operator, Primitive, PrimitiveThing } from './wa-contracts';
import { Logical, LogicalAnd, LogicalNot, LogicalOr } from './wa-logical';
import { RuntimeOperator, RuntimeOperatorDef } from './wa-runtime';
import { Util } from './wa-util';

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
    [ComparisonLike.alias]: ComparisonLike,
    [ComparisonILike.alias]: ComparisonILike
};

export interface IEvaluator { }
export abstract class EvaluatorBase<T extends EvaluatorBase<T>> implements IEvaluator, IComparison<T> {
    // Root logical operator.
    protected _logical: Logical;

    // The instance we return from evaluator
    protected _this: T;

    // Provided by subclass so we can return the correct type
    protected abstract _getEvaluator(): T;

    // Provided by subclass so we know how to create unknown operators
    protected abstract _getClassDict(): ClassDict;

    // Provides configuration for subclass when restoring from json
    protected abstract _setConfiguration(config: IEvaluatorOpts): void;

    // Gets configuration from subclass when serializing to json
    protected abstract _getConfiguration(): IEvaluatorOpts;

    constructor() {
        this._this = this._getEvaluator();
        // Use AND by default. Overridden in static constructors.
        this._logical = new LogicalAnd(this._this);
        // Merge base and implementation classmaps
        clazzDict = { ...clazzDict, ...this._this._getClassDict() };
    }

    /**
     * Creates new evaluator from JSON.
     *
     * @param json - JSON (or stringified) output from an evaluator
     * @returns Evaluator
     */
    static fromJson<T extends EvaluatorBase<T>>(this: { new(): T }, json: IJsonDump | string): T {
        const jsonParsed = (typeof json === 'string' ? JSON.parse(json) : json) as IJsonDump;
        const evaluator = new this();
        evaluator._setConfiguration(jsonParsed.evaluatorOpts);
        evaluator._logical = Logical.fromJson(jsonParsed, clazzDict, evaluator);
        return evaluator;
    }

    /**
     * Creates a new evaluator with a root `and` operator (True when all child operators are true).
     *
     * @returns Evaluator
     */
    static and<T extends EvaluatorBase<T>>(this: { new(): T }): T {
        const evaluator = new this();
        evaluator._logical = new LogicalAnd(evaluator);
        return evaluator;
    }

    /**
     * Creates a new evaluator with a root `or` operator (True when any child operator is true).
     *
     * @returns Evaluator
     */
    static or<T extends EvaluatorBase<T>>(this: { new(): T }): T {
        const evaluator = new this();
        evaluator._logical = new LogicalOr(evaluator);
        return evaluator;
    }

    /**
     * Creates a new evaluator with a root `not` operator (True when all child operators are false).
     *
     * @returns Evaluator
     */
    static not<T extends EvaluatorBase<T>>(this: { new(): T }): T {
        const evaluator = new this();
        evaluator._logical = new LogicalNot(evaluator);
        return evaluator;
    }

    /**
     * Defines a custom operator.
     *
     * @param alias - The name of the operator
     * @param func - The function to be called
     */
    static define<T extends EvaluatorBase<T>>(alias: string, func: IRuntimeOperatorCallback): void {
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
    static getOperatorAlias(): string[] {
        return Object.keys(clazzDict).sort();
    }

    /**
     * Serializes evaluator as JSON.
     *
     * @returns Evaluator as JSON
     */
    asJson(): IJsonDump {
        return { ...this._logical.asJson(), evaluatorOpts: this._getConfiguration() };
    }

    /**
     * Returns evaluator as a human readable tree.
     *
     * @returns evaluator as a human readable tree
     */
    asTree(): string {
        const pad = '#';
        const walk = (operator: Operator, indent = 0): string => {
            if (operator instanceof Logical) {
                return `${pad.repeat(indent)}${operator.getAlias()}↘
                    ${operator.getOperators().map(op => walk(op, indent + operator.getAlias().length)).join('\n')}`;
            }
            const kv = operator as unknown as KeyValue;
            return `${pad.repeat(indent)}${kv.key} ${operator.getAlias()} ${kv.value ?? ''}`;
        };
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
     * @returns Evaluator
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
    evaluate(obj: PrimitiveThing): boolean {
        return this._logical.evaluate(obj);
    }

    /**
     * Clears all operators in current logical and below.
     *
     * @returns Evaluator
     */
    clear(): T {
        this._logical.clear();
        return this._this;
    }

    /**
     * Moves to root logical.
     *
     * @returns Evaluator
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
     * @returns Evaluator
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
     * @returns Evaluator
     */
    down(): T {
        const childLogical = this._logical.getOperators().find((op) => op instanceof Logical) as Logical;
        if (childLogical) {
            this._logical = childLogical;
        }
        return this._this;
    }

    /**
     * Moves to next logical sibling (if any).
     *
     * @returns Evaluator
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
     * @returns Evaluator
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
     * Returns a clone of evaluator.
     *
     * @returns A new Evaluator
     */
    clone(): T {
        return Util.classOf(this._this).fromJson(this._this.asJson());
    }

    /**
     * Adds another evaluator.
     *
     * @param evaluator - The evaluator to add
     *
     * @returns Evaluator
     */
    addEvaluator(evaluator: T): T {
        this._logical.add(evaluator._logical);
        return this._this;
    }

    /**
     * Returns keys and values for non logical operators.
     *
     * @returns Keys and values for non logical operators
     */
    getKeysAndValues(): IDictionary<Primitive> {
        const dict = {};
        const walk = (operators: Operator[]) => {
            operators.forEach((operator) => {
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
        };
        walk(this._logical.getOperators());
        return dict;
    }

    /**
     * Returns true when all child operators are true.
     *
     * @returns Evaluator
     */
    and(): T {
        this._logical = this._logical.add(new LogicalAnd(this._logical)) as Logical;
        return this._this;
    }

    /**
     * Returns true when at least one child operator is true.
     *
     * @returns Evaluator
     */
    or(): T {
        this._logical = this._logical.add(new LogicalOr(this._logical)) as Logical;
        return this._this;
    }

    /**
     * Returns true when all child operators are false.
     *
     * @returns Evaluator
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
     * @returns Evaluator
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
     * @returns Evaluator
     */
    eq(key: string, value: PrimitiveThing): T {
        return this.equals(key, value);
    }

    /**
     * Returns true when object[key] is null or undefined.
     *
     * @param key - The key/property to evaluate
     *
     * @returns Evaluator
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
     * @returns Evaluator
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
     * @returns Evaluator
     */
    gt(key: string, value: PrimitiveThing): T {
        return this.greaterThan(key, value);
    }

    /**
     * Returns true when object[key] is greater or equal to value.
     *
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     *
     * @returns Evaluator
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
     * @returns Evaluator
     */
    gte(key: string, value: PrimitiveThing): T {
        return this.greaterThanEquals(key, value);
    }

    /**
     * Returns true when object[key] is less than value.
     *
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     *
     * @returns Evaluator
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
     * @returns Evaluator
     */
    lt(key: string, value: PrimitiveThing): T {
        return this.lessThan(key, value);
    }

    /**
     * Returns true when object[key] is less or equal to value.
     *
     * @param key - The key/property to evaluate
     * @param value - The value to compare
     *
     * @returns Evaluator
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
     * @returns Evaluator
     */
    lte(key: string, value: PrimitiveThing): T {
        return this.lessThanEquals(key, value);
    }

    /**
     * Returns true when object[key] is similar to value.
     * Case sensitive.
     *
     * @param key - The key/property to evaluate
     * @param value - The value/pattern to compare
     *
     * @returns Evaluator
     */
    like(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonLike(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is similar to value.
     * Case insensitive.
     *
     * @param key - The key/property to evaluate
     * @param value - The value/pattern to compare
     *
     * @returns Evaluator
     */
    ilike(key: string, value: PrimitiveThing): T {
        this._logical.add(new ComparisonILike(key, value));
        return this._this;
    }

    /**
     * Returns true when object[key] is found in values.
     *
     * @param key - The key/property to evaluate
     * @param values - The values to compare
     *
     * @returns Evaluator
     */
    any(key: string, values: Primitive[]): T {
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
     * @param value - Optional value to compare
     * @param opts - Optional operator options
     *
     * @returns Evaluator
     */
    operator(alias: string, key: string, value?: PrimitiveThing, opts?: unknown): T {
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
     * @returns Evaluator
     */
    op(alias: string, key: string, value?: PrimitiveThing, opts?: unknown): T {
        return this.operator(alias, key, value, opts);
    }
}

export class EvaluatorCore extends EvaluatorBase<EvaluatorCore> {
    protected _setConfiguration(): void {
        /* Empty */
    }

    protected _getConfiguration(): IEvaluatorOpts {
        return {};
    }

    protected _getClassDict(): ClassDict {
        return {};
    }

    protected _getEvaluator(): EvaluatorCore {
        return this;
    }
}
