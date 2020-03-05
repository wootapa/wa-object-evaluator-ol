import { IEvaluatable, ObjectOrDict, IValueGetter, ValueOrGetter, ValueResolver } from "../core";
import { OpenLayersBuilder } from "./wa-openlayers-builder";

export abstract class OpenLayersBase implements IEvaluatable {
    constructor(
        private _key: string,
        private _value: ValueOrGetter) { }
    
    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        // Get object and compare values
        let objValue = ValueResolver.resolveObjectValue(this._key, obj, getter);
        let cmpValue = ValueResolver.resolveCompareValue(this._key, this._value);
        
        if (this instanceof OpenLayersIntersects) {
            // To be implemented...
        }
        throw new Error("Not implemented");
    }
}

// Exports to be implemented in builder
export interface IOpenLayers {
    intersects(property: string, value: ValueOrGetter): OpenLayersBuilder
}
export class OpenLayersIntersects extends OpenLayersBase { }