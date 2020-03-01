import { IEvaluatable, ObjectOrDict, IValueGetter, ValueOrGetter } from "../base";
import { SpatialBuilder } from "./wa-spatial-builder";

export abstract class SpatialBase implements IEvaluatable {
    private _property: string;
    private _value: ValueOrGetter;

    constructor(property: string, value: ValueOrGetter) {
        this._property = property;
        this._value = value;
    }
    
    evaluate(object: ObjectOrDict, getter?: IValueGetter): boolean {
        //if (this instanceof SpatialIntersects) {
        //}
        throw new Error("Not implemented");
    }
}

// Exports
export interface ISpatial {
    intersects(property: string, value: ValueOrGetter): SpatialBuilder
}
export class SpatialIntersects extends SpatialBase { }