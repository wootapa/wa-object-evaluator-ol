import { ValueOrGetter, IWalkFunction, IWalkLogicalFunction, IDictionary, Primitive, ObjectOrDict, IValueGetter } from "./wa-contracts";
import { Logical } from "./wa-logical";

export class Util {
    static getDictValue = (obj: IDictionary<Primitive>, key: string): Primitive => {
        return key
            .split('.')
            .reduce((obj, part) => obj[part], obj as any);
    }

    static resolveObjectValue(key: string, obj: ObjectOrDict, getter?: IValueGetter) {
        return getter instanceof Function
            ? getter.apply(obj, [key])
            : Util.getDictValue(obj as IDictionary<Primitive>, key);
    }

    static resolveCompareValue(key: string, value: ValueOrGetter): Primitive {
        return value instanceof Function
            ? (value as IValueGetter)(key)
            : value;
    }

    static classOf<T>(o: T): any {
        return o.constructor;
    }

    static walk(logical: Logical, callBack: IWalkFunction): void {
        callBack(logical);
        logical.getOperators().forEach(operator => {
            callBack(operator);
            if (operator instanceof Logical) {
                return Util.walk(operator, callBack);
            }
        });
    }

    static forEachLogical(logical: Logical, callBack: IWalkLogicalFunction) {
        return Util.walk(logical, f => {
            if (f instanceof Logical) {
                callBack(f);
            }
        });
    }

    static forEach(logical: Logical, callBack: IWalkFunction) {
        return Util.walk(logical, callBack);
    }
}
