
import { KeyValue } from "../core/wa-comparison";
import { IEvaluatable, IJsonDump, IJson } from "../core/wa-contracts";
import { BuilderOl } from "./wa-builder-ol";
import { FeatureThing } from "./wa-contracts";
import { WAFeature } from "./wa-feature";
import { Reporter } from "../core/wa-util";

export abstract class OpenLayersBase extends KeyValue implements IEvaluatable, IJson {
    static alias: string;
    public feature: WAFeature;
    protected _reporter: Reporter;

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
        this._reporter = new Reporter(`${this.getAlias()}:${this.key}`);

    }
    getAlias(): string {
        return (this.constructor as any).alias;
    }

    getReport() {
        return this._reporter.getReport();
    }

    resetReport() {
        this._reporter.reset();
    }

    asJson(): IJsonDump {
        return {
            type: this.getAlias(),
            ctorArgs: [this._key, this._value]
        };
    }

    evaluate<FeatureThing>(obj: FeatureThing): boolean {
        const evalFeature = WAFeature.factory(obj);
        let result = false;

        if (this instanceof OpenLayersIntersects) {
            result = evalFeature.intersects(this.feature);
        }

        this._reporter.stop(result);
        return result;
    }
}

// Exports to be implemented in builder
export interface IOpenLayers {
    intersects(value: FeatureThing): BuilderOl
}
export class OpenLayersIntersects extends OpenLayersBase {
    static alias = 'intersects'
}