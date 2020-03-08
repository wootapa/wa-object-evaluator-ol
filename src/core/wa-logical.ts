import { IEvaluatable, IValueGetter, ObjectOrDict, Parent, Operator, ClassDict, IJsonDump } from "./wa-contracts";

export abstract class Logical implements IEvaluatable {
    private _operators: Operator[] = [];

    constructor(private _parent: Parent) { }

    getParent = () => this._parent;

    getOperators(): Operator[] {
        return this._operators;
    }

    add(operator: Operator) {
        this._operators.push(operator);
        return operator;
    }

    static fromJson(json: IJsonDump, classDict: ClassDict, parent: Parent): Logical {
        const logical = new classDict[json.type](parent) as Logical;
        json.operators.forEach(jsonOperator => {
            if (jsonOperator.isLogical) {
                return logical.add(Logical.fromJson(jsonOperator, classDict, logical));
            }
            const clazz = classDict[jsonOperator.type];            
            logical.add(new clazz(...jsonOperator.ctorArgs));
        });
        return logical;
    }

    toJson(): IJsonDump {
        return {
            type: this.constructor.name,
            isLogical: true,
            operators: this.getOperators().map(f => f.toJson())
        };
    }

    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        let result = false;
        if (this instanceof LogicalAnd) {
            for (let i = 0; i < this._operators.length; i++) {
                result = this._operators[i].evaluate(obj, getter);
                if (!result) {
                    break;
                }
            }
            return result;
        }
        if (this instanceof LogicalOr) {
            for (let i = 0; i < this._operators.length; i++) {
                result = this._operators[i].evaluate(obj, getter);
                if (result) {
                    break;
                }
            }
            return result;
        }
        if (this instanceof LogicalNot) {
            for (let i = 0; i < this._operators.length; i++) {
                result = this._operators[i].evaluate(obj, getter);
                if (result) {
                    break;
                }
            }
            return !result;
        }
        return result;
    }
}

export class LogicalAnd extends Logical { }
export class LogicalOr extends Logical { }
export class LogicalNot extends Logical { }