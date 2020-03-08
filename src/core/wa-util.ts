import { ValueOrGetter, IWalkFunction, IWalkLogicalFunction, IDictionary, Primitive, ObjectOrDict, IValueGetter } from "./wa-contracts";
import { Logical } from "./wa-logical";

export class ValueResolver {
    static getDictValue = (obj: IDictionary<Primitive>, key: string): Primitive => {
        return key
            .split('.')
            .reduce((obj, part) => obj[part], obj as any);
    }

    static resolveObjectValue(key: string, obj: ObjectOrDict, getter?: IValueGetter) {
        return getter instanceof Function
            ? getter.apply(obj, [key])
            : ValueResolver.getDictValue(obj as IDictionary<Primitive>, key);
    }

    static resolveCompareValue(key: string, value: ValueOrGetter): Primitive {
        return value instanceof Function
            ? (value as IValueGetter)(key)
            : value;
    }
}

export class Walker { 
    static walk(logical: Logical, callBack: IWalkFunction): void {
        callBack(logical);
        logical.getOperators().forEach(operator => {
            callBack(operator);
            if (operator instanceof Logical) {
                return Walker.walk(operator, callBack);
            }
        });
    }

    static forEachLogical(logical: Logical, callBack: IWalkLogicalFunction) {
        return Walker.walk(logical, f => {
            if (f instanceof Logical) {
                callBack(f);
            }
        });
    }

    static forEachOperator(logical: Logical, callBack: IWalkFunction) {
        return Walker.walk(logical, callBack);
    }
}