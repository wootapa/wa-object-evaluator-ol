import { IEvaluatable, Parent, Operator, ClassDict, IJsonDump, ThingOrThingGetter } from "./wa-contracts";
import { RuntimeOperator } from "./wa-runtime";

export abstract class Logical implements IEvaluatable {
    private _operators: Operator[] = [];
    static alias: string;

    constructor(private _parent: Parent) { }

    getParent = () => this._parent;

    getOperators(): Operator[] {
        return this._operators;
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

    toJson(): IJsonDump {
        return {
            type: (this.constructor as any).alias,
            isLogical: true,
            operators: this.getOperators().map(f => f.toJson())
        };
    }

    evaluate<T>(obj: ThingOrThingGetter<T>): boolean {
        if (this._operators.length == 0) {
            return true;
        }
        if (this instanceof LogicalAnd) {
            return this._operators.every(op => op.evaluate(obj));
        }
        if (this instanceof LogicalOr) {
            return this._operators.some(op => op.evaluate(obj));
        }
        if (this instanceof LogicalNot) {
            return this._operators.every(op => !op.evaluate(obj));
        }
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
