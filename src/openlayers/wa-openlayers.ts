import { OpenLayersBuilder } from "./wa-openlayers-builder";
import { KeyValue } from "../core/wa-comparison";
import { IEvaluatable, ValueOrGetter, IJsonDump, ObjectOrDict, IValueGetter } from "../core/wa-contracts";
import { ValueResolver } from "../core/wa-util";

export abstract class OpenLayersBase extends KeyValue implements IEvaluatable {
    constructor(key: string, value: ValueOrGetter) {
        super(key, value);
    }

    toJson(): IJsonDump {
        return {
            type: this.constructor.name,
            ctorArgs: [this._key, this._value]
        };
    }

    evaluate(obj: ObjectOrDict, getter?: IValueGetter): boolean {
        // Get object and compare values
        let objValue = ValueResolver.resolveObjectValue(this._key, obj, getter);;

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