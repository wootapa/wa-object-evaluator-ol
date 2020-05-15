import { Logical } from "./wa-logical";
import { IBuilder } from "./wa-builder-core";

export interface IDictionary<T> {
    [key: string]: T;
}

export interface IThingGetter<T> {
    (key: string): T;
}

export interface IJsonDump {
    type: string
    ctorArgs?: any[]
    isLogical?: boolean
    isRuntime?: boolean
    operators?: IJsonDump[]
}

export interface IToJson {
    toJson(): IJsonDump
}

export interface IRuntimeOperatorCallback {
    (value: PrimitiveThing): boolean
}

export interface IEvaluatable {
    evaluate<T>(obj: ThingOrThingGetter<T>): boolean
}

export type ThingOrThingGetter<T> = T | IThingGetter<T> | IDictionary<T> | object;
export type Primitive = string | number | boolean | Date;
export type PrimitiveThing = ThingOrThingGetter<Primitive>;
export type Operator = IEvaluatable & IToJson;
export type Parent = IBuilder | Logical;
export type ClassDict = IDictionary<any>;
