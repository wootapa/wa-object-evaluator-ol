import { IDictionary, Primitive, ObjectOrDict, IValueGetter } from ".";
import { ValueOrGetter } from "./wa-contracts";

export class ValueResolver {
    static getDictValue = (obj: IDictionary<Primitive>, key: string): Primitive => {
        return key
            .split('.')
            .reduce((obj, part) => obj[part], obj as any);
    };

    static resolveObjectValue(key: string, obj: ObjectOrDict, getter?: IValueGetter) {
        return typeof getter === "function"
            ? getter.apply(obj, [key])
            : this.getDictValue(obj as IDictionary<Primitive>, key);
    }

    static resolveCompareValue(key: string, value: ValueOrGetter): Primitive {
        return typeof value === "function"
            ? (value as IValueGetter)(key)
            : value;
    };
}