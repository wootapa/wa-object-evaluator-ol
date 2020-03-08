import { Logical } from "./wa-logical";
import { IBuilder } from "./wa-builder-core";

export interface IDictionary<T> {
    [key: string]: T;
}

export interface IValueGetter {
    (key: string): Primitive;
}

export interface IJsonDump { 
    type: string
    ctorArgs?: any[]
    isLogical?: boolean
    operators?: IJsonDump[]
}

export interface IToJson {
    toJson(): IJsonDump
}

export interface IEvaluatable {
    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean
}

export interface IWalkFunction {
    (operator: Operator): void
}

export interface IWalkLogicalFunction {
    (logical: Logical): void
}

export type Operator = IEvaluatable & IToJson;
export type Parent = IBuilder | Logical;
export type ValueOrGetter = Primitive | IValueGetter;
export type Primitive = string | number | boolean | Date;
export type PrimitiveDict = IDictionary<Primitive>;
export type ObjectOrDict = object | PrimitiveDict;
export type ClassDict = IDictionary<any>;
