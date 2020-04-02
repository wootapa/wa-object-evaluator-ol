import { IWalkFunction, IWalkLogicalFunction, IDictionary, ThingOrThingGetter } from "./wa-contracts";
import { Logical } from "./wa-logical";

export class Util {
    static getDictValue = <T>(obj: IDictionary<T>, key: string): T => {
        return key
            .split('.')
            .reduce((obj, part) => obj[part], obj as any);
    }

    static resolveObjectValue<T>(key: string, obj: ThingOrThingGetter<T>) {
        return obj instanceof Function
            ? obj.apply(obj, [key])
            : Util.getDictValue(obj as IDictionary<T>, key);
    }

    static resolveCompareValue<T>(key: string, value: ThingOrThingGetter<T>): T {
        return value instanceof Function
            ? value.apply(value, [key])
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
