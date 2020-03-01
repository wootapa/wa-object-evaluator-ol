export interface IDictionary<T> {
    [Key: string]: T;
}
export interface IValueGetter {
    (property: string): Primitive;
}
export interface IEvaluatable {
    evaluate(object: ObjectOrDict, getter?: IValueGetter): boolean
}
export interface IParent { };
export type ValueOrGetter = Primitive | IValueGetter;
export type Primitive = string | number | boolean | Date;
export type ObjectOrDict = object | IDictionary<Primitive>;

// Need to solve generic subclass constraints
// https://stackoverflow.com/questions/51507036/typescript-equivalent-of-cs-generic-type-constraint-for-extending-class
export { Builder as ExportedBuilder } from "../main";