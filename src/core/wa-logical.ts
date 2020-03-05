import { IEvaluatable, IValueGetter, ObjectOrDict, Parent, Filter } from "./wa-contracts";

export abstract class Logical implements IEvaluatable {
    private _filters: Filter[] = [];

    constructor(private _parent: Parent) { }

    getParent = () => this._parent;

    add(filter: Filter) {
        this._filters.push(filter);
        return filter;
    }

    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        let result = false;
        if (this instanceof LogicalAnd) {
            for (let i = 0; i < this._filters.length; i++) {
                result = this._filters[i].evaluate(obj, getter);
                if (!result) {
                    break;
                }
            }
            return result;
        }
        if (this instanceof LogicalOr) {
            for (let i = 0; i < this._filters.length; i++) {
                result = this._filters[i].evaluate(obj, getter);
                if (result) {
                    break;
                }
            }
            return result;
        }
        if (this instanceof LogicalNot) {
            for (let i = 0; i < this._filters.length; i++) {
                result = this._filters[i].evaluate(obj, getter);
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