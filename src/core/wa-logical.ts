import { IEvaluatable, Parent, Operator, ClassDict, IJsonDump, ThingOrThingGetter, IJson } from "./wa-contracts";
import { RuntimeOperator } from "./wa-runtime";
import { Reporter } from "./wa-util";

export abstract class Logical implements IEvaluatable, IJson {
    private _operators: Operator[] = [];
    private _reporter: Reporter;
    static alias: string;

    constructor(private _parent: Parent) {
        this._reporter = new Reporter(`${this.getAlias()}`);
    }

    getParent = () => this._parent;

    getOperators(): Operator[] {
        return this._operators;
    }

    getOperatorsTree(): Operator[] {
        const operators: Operator[] = [];

        const walk = (logical: Logical) => {
            logical.getOperators().forEach(op => {
                operators.push(op);
                if (op instanceof Logical) {
                    walk(op);
                }
            });
        };
        walk(this);

        return operators;
    }

    add(operator: Operator) {
        this._operators.push(operator);
        return operator;
    }

    clear() {
        this._operators = [];
    }

    static fromJson(json: IJsonDump, classDict: ClassDict, parent: Parent): Logical {
        const logical = new classDict[json.type](parent) as Logical;
        json.operators.forEach(jsonOperator => {
            if (jsonOperator.isLogical) {
                return logical.add(Logical.fromJson(jsonOperator, classDict, logical));
            }
            if (jsonOperator.isRuntime) {
                return logical.add(RuntimeOperator.fromJson(jsonOperator, classDict));
            }
            const clazz = classDict[jsonOperator.type];
            logical.add(new clazz(...jsonOperator.ctorArgs));
        });
        return logical;
    }

    getAlias = () => (this.constructor as any).alias;

    getReport = () => this._reporter.getReport();

    resetReport = () => this._reporter.reset();

    asJson(): IJsonDump {
        return {
            type: this.getAlias(),
            isLogical: true,
            operators: this.getOperators().map(f => f.asJson())
        };
    }

    evaluate<T>(obj: ThingOrThingGetter<T>): boolean {
        let result = true;
        this._reporter.start();

        if (this._operators.length > 0) {
            if (this instanceof LogicalAnd) {
                result = this._operators.every(op => op.evaluate(obj));
            }
            if (this instanceof LogicalOr) {
                result = this._operators.some(op => op.evaluate(obj));
            }
            if (this instanceof LogicalNot) {
                result = this._operators.every(op => !op.evaluate(obj));
            }
        }

        this._reporter.stop(result);
        return result;
    }
}

export class LogicalAnd extends Logical {
    static alias = "and";
}
export class LogicalOr extends Logical {
    static alias = "or";
}
export class LogicalNot extends Logical {
    static alias = "not";
}
