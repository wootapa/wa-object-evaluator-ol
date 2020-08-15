import { IEvaluator } from './wa-evaluator';
import { Logical } from './wa-logical';

export interface IDictionary<T> {
    [key: string]: T;
}

export interface IThingGetter<T> {
    (key: string): T;
}

export interface IJsonDump {
    type: string;
    ctorArgs?: any[];
    isLogical?: boolean;
    isRuntime?: boolean;
    operators?: IJsonDump[];
    evaluatorOpts?: IEvaluatorOpts;
}

export interface IEvaluatorOpts { }

export interface IComparisonOpts {
    isDate?: boolean;
}
export interface ILikeOptions extends IComparisonOpts {
    matchCase: boolean;
    wildCard?: string;
}

export interface IJson {
    asJson(): IJsonDump;
}

export interface IReport {
    id: string;
    duration: number;
    truths: number;
    falses: number;
}
export interface IReportSummary {
    duration: number;
    truths: number;
    falses: number;
    details: IReport[];
}

export interface IRuntimeOperatorCallback {
    (value: PrimitiveThing): boolean;
}

export interface IEvaluatable {
    getAlias(): string;
    evaluate<T>(obj: ThingOrThingGetter<T>): boolean;
    getReport(): IReport;
    resetReport(): void;
}

export type ThingOrThingGetter<T> = T | IThingGetter<T> | IDictionary<T> | object;
export type Primitive = string | number | boolean | Date;
export type PrimitiveThing = ThingOrThingGetter<Primitive>;
export type Operator = IEvaluatable & IJson;
export type Parent = IEvaluator | Logical;
export type ClassDict = IDictionary<any>;
