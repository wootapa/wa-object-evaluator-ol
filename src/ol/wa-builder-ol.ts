import { BuilderCoreBase } from "../core/wa-builder-core";
import { ClassDict } from "../core/wa-contracts";
import { FeatureThing } from "./wa-contracts";
import { WAFeature } from "./wa-feature";
import { WAFilter } from "./wa-filter";
import { IOpenLayers, OpenLayersIntersects } from "./wa-ol";

export class BuilderOl extends BuilderCoreBase<BuilderOl> implements IOpenLayers {

    protected getBuilder(): BuilderOl {
        return this;
    }

    protected getClassDict(): ClassDict {
        return {
            [OpenLayersIntersects.alias]: OpenLayersIntersects
        };
    }

    /**
     * Evaluates featurething.
     * 
     * @param obj - The featurething to evaluate
     * 
     * @returns True if object passed all child operators
     */
    evaluate(obj: FeatureThing) {
        // To support all base operators, we need a dict or they can't resolve values
        const olFeature = WAFeature.factory(obj).getOlFeature();
        const olFeatureProps = olFeature.getProperties();

        // To support custom geometrynames we add a little helper property
        olFeatureProps[WAFeature.OBJECT_PIGGYBACK] = olFeature.getGeometryName();
        return this._logical.evaluate(olFeatureProps);
    }

    /**
     * Adds an `intersects` operator (True when featurething intersects).
     * 
     * @param value - The featurething to compare
     * 
     * @returns Builder
     */
    intersects(value: FeatureThing): BuilderOl {
        this._logical.add(new OpenLayersIntersects(value));
        return this;
    }

    /**
     * Returns builder as an OGC CQL query.
     * 
     * @returns builder as OGC CQL
     */
    asOgcCql() {
        return WAFilter.asOgcCql(this._logical);
    }

    /**
     * Returns builder as an OGC XML query.
     * 
     * @remarks
     * Wrap in encodeURI to avoid encoding issues
     * 
     * @returns builder as OGC XML
     */
    asOgcXml() {
        return WAFilter.asOgcXml(this._logical);
    }
}