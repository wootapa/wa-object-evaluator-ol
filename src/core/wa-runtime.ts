import { Primitive, IJsonDump, IEvaluatable, IRuntimeOperatorCallback, IToJson, ClassDict } from "./wa-contracts";
import { Util } from "./wa-util";
import { KeyValue } from "./wa-comparison";

export class RuntimeOperatorDef {
    private _alias: string;
    private _func: IRuntimeOperatorCallback;

    constructor(alias: string, func: IRuntimeOperatorCallback) {
        this._alias = alias;
        this._func = func;
    };

    get alias() {
        return this._alias;
    }

    get func() {
        return this._func;
    }
}

export class RuntimeOperator extends KeyValue implements IEvaluatable, IToJson {
    _def: RuntimeOperatorDef;

    constructor(key: string, def: RuntimeOperatorDef) {
        super(key, def.func.toString())
        this._def = def;
    }

    static fromJson(json: IJsonDump, classDict: ClassDict): RuntimeOperator {
        const [key, defFuncStr] = json.ctorArgs;

        // Construct the definition if not already
        if (!(json.type in classDict)) {
            const func = new Function(`return ${defFuncStr}`)() as IRuntimeOperatorCallback;
            classDict[json.type] = new RuntimeOperatorDef(json.type, func);
        }
        return new RuntimeOperator(key, classDict[json.type]);
    }

    toJson(): IJsonDump {
        return {
            isRuntime: true,
            type: this._def.alias,
            ctorArgs: [this.key, this._def.func.toString()]
        };
    }

    evaluate<PrimitiveThing>(obj: PrimitiveThing): boolean {
        let objValue = Util.resolveObjectValue<Primitive, PrimitiveThing>(this.key, obj);
        return !!this._def.func.apply(this._def.func, [objValue]);
    }
}
