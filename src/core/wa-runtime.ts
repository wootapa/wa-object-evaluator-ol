import { Primitive, IJsonDump, IEvaluatable, IRuntimeOperatorCallback, IJson, ClassDict } from "./wa-contracts";
import { Util, Reporter } from "./wa-util";
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

export class RuntimeOperator extends KeyValue implements IEvaluatable, IJson {
    private _def: RuntimeOperatorDef;
    private _reporter: Reporter;

    constructor(key: string, def: RuntimeOperatorDef) {
        super(key, def.func.toString())
        this._def = def;
        this._reporter = new Reporter(`${this.getAlias()}:${this.key}`);
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

    getAlias = () => this._def.alias;

    getReport = () => this._reporter.getReport();

    resetReport = () => this._reporter.reset();

    asJson(): IJsonDump {
        return {
            isRuntime: true,
            type: this.getAlias(),
            ctorArgs: [this.key, this._def.func.toString()]
        };
    }

    evaluate<PrimitiveThing>(obj: PrimitiveThing): boolean {
        let objValue = Util.resolveObjectValue<Primitive, PrimitiveThing>(this.key, obj);
        this._reporter.start();
        const result = !!this._def.func.apply(this._def.func, [objValue]);
        this._reporter.stop(result);
        return result;
    }
}
