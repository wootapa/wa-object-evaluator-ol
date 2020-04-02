
import { BuilderOl } from "./wa-builder-ol";
import { Util } from "./wa-util";
import { WAFeature } from "./wa-feature";
import { FeatureThing } from "./wa-contracts";
import { KeyValue } from "../core/wa-comparison";
import { IEvaluatable, IJsonDump } from "../core/wa-contracts";

export abstract class OpenLayersBase extends KeyValue implements IEvaluatable {
    private feature: WAFeature;

    constructor(value: FeatureThing) {
        let feature = Util.resolveFeature(value);
        super(feature.getFeature().getGeometryName(), feature.toWkt());
        this.feature = feature;
    }

    toJson(): IJsonDump {
        return {
            type: this.constructor.name,
            ctorArgs: [this._key, this._value]
        };
    }

    evaluate<FeatureThing>(obj: FeatureThing): boolean {
        let evalFeature = Util.resolveFeature(obj as any);
        let compFeature = this.feature;

        Util.assertSimple([evalFeature, compFeature]);

        if (this instanceof OpenLayersIntersects) {
            return evalFeature.intersects(compFeature);
        }
    }
}

// Exports to be implemented in builder
export interface IOpenLayers {
    intersects(value: FeatureThing): BuilderOl
}
export class OpenLayersIntersects extends OpenLayersBase { }