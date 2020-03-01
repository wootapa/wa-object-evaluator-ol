import { IEvaluatable, IValueGetter, ObjectOrDict, IParent, ExportedBuilder } from "./wa-contracts";
import { BuilderBase } from "./wa-builder-base";

export abstract class Logical implements IEvaluatable {
    private _parent: IParent;
    private _evaluatables: IEvaluatable[] = [];

    constructor(parent: IParent) {
        this._parent = parent;
    }

    getParent = () => this._parent;

    add(evaluatable: IEvaluatable) {
        this._evaluatables.push(evaluatable);
        return evaluatable;
    }

    evaluate(object: ObjectOrDict, getter?: IValueGetter): boolean {
        let result = false;
        if (this instanceof LogicalAnd) {
            for (let i = 0; i < this._evaluatables.length; i++) {
                result = this._evaluatables[i].evaluate(object, getter);
                if (!result) {
                    break;
                }
            }
            return result;
        } else if (this instanceof LogicalOr) {
            for (let i = 0; i < this._evaluatables.length; i++) {
                result = this._evaluatables[i].evaluate(object, getter);
                if (result) {
                    break;
                }
            }
            return result;
        } else if (this instanceof LogicalNot) {
            for (let i = 0; i < this._evaluatables.length; i++) {
                result = this._evaluatables[i].evaluate(object, getter);
                if (result) {
                    break;
                }
            }
            return !result;
        }
        return result;
    }
}

// Exports
export interface ILogical<T = ExportedBuilder> {
    and(): T;
    or(): T;
    not(): T;
}
export class LogicalAnd extends Logical { }
export class LogicalOr extends Logical { }
export class LogicalNot extends Logical { }