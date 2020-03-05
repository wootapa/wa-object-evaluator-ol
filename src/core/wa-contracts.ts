import { Logical } from "./wa-logical";
import { IBuilder } from "./wa-builder-core";

export interface IDictionary<T> {
    [key: string]: T;
}
export interface IValueGetter {
    (key: string): Primitive;
}

export interface IEvaluatable {
    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean
}
export type Filter = IEvaluatable // json, ogc, cql, json, graphql

export type Parent = IBuilder | Logical;
export type ValueOrGetter = Primitive | IValueGetter;
export type Primitive = string | number | boolean | Date;
export type PrimitiveDict = IDictionary<Primitive>;
export type ObjectOrDict = object | PrimitiveDict;
