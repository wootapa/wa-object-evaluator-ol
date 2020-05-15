
import { KeyValue } from "../core/wa-comparison";
import { IEvaluatable, IJsonDump } from "../core/wa-contracts";
import { BuilderOl } from "./wa-builder-ol";
import { FeatureThing } from "./wa-contracts";
import { WAFeature } from "./wa-feature";

export abstract class OpenLayersBase extends KeyValue implements IEvaluatable {
    static alias: string;
    public feature: WAFeature;

    constructor(key: string, value: FeatureThing) {
        let feature = WAFeature.factory(value);

        // If we have a key, we should set the geomtryname
        if (key && key !== WAFeature.DEFAULT_GEOMETRYNAME) {
            const olFeature = feature.getFeature();
            olFeature.set(key, olFeature.getGeometry());
            olFeature.unset(olFeature.getGeometryName());
            olFeature.setGeometryName(key);
        }

        super(feature.getFeature().getGeometryName(), feature.toWkt());
        this.feature = feature;
    }

    toJson(): IJsonDump {
        return {
            type: (this.constructor as any).alias,
            ctorArgs: [this._key, this._value]
        };
    }

    evaluate<FeatureThing>(obj: FeatureThing): boolean {
        const evalFeature = WAFeature.factory(obj);

        if (this instanceof OpenLayersIntersects) {
            return evalFeature.intersects(this.feature);
        }
    }
}

// Exports to be implemented in builder
export interface IOpenLayers {
    intersects(value: FeatureThing): BuilderOl
}
export class OpenLayersIntersects extends OpenLayersBase {
    static alias = 'intersects'
}