import { ProjectionLike } from "ol/proj";
import Projection from "ol/proj/Projection";
import { BuilderCoreBase } from "../core/wa-builder-core";
import { ClassDict } from "../core/wa-contracts";
import { FeatureThing, IDistanceOpts, IOlBuilderOpts } from "./wa-contracts";
import { WAFeature } from "./wa-feature";
import { WAFilter } from "./wa-filter";
import { IOlOperators, OlContains, OlDisjoint, OlDistanceBeyond, OlDistanceWithin, OlIntersects, OlWithin } from "./wa-ol";

let DEFAULT_PROJECTION = 'EPSG:3857';

// Holds anything we want operators to know about
class BuilderOlOpts implements IOlBuilderOpts {
    projCode = DEFAULT_PROJECTION;
}

export class BuilderOl extends BuilderCoreBase<BuilderOl> implements IOlOperators {
    _opts = new BuilderOlOpts();

    protected getConfiguration(): IOlBuilderOpts {
        return this._opts;
    }

    protected setConfiguration(config: IOlBuilderOpts): void {
        this._opts = config;
    }

    protected getBuilder(): BuilderOl {
        return this;
    }

    protected getClassDict(): ClassDict {
        return {
            [OlIntersects.alias]: OlIntersects,
            [OlDisjoint.alias]: OlDisjoint,
            [OlContains.alias]: OlContains,
            [OlWithin.alias]: OlWithin,
            [OlDistanceWithin.alias]: OlDistanceWithin,
            [OlDistanceBeyond.alias]: OlDistanceBeyond
        };
    }

    /**
     * Sets default projection for all builders.
     * Default `EPSG:3857` (Web Mercator)
     * 
     * @remarks Projection must be known.
     * 
     * @param projection - Projection instance or code
     */
    static defaultProjection(projection: ProjectionLike) {
        DEFAULT_PROJECTION = projection instanceof Projection ? projection.getCode() : projection;
    }

    /**
     * Sets projection for all child spatial operators.
     * 
     * @remarks Projection must be known.
     * 
     * @param projection - Projection instance or code
     * 
     * @returns Builder
     */
    projection(projection: ProjectionLike) {
        this._opts.projCode = projection instanceof Projection ? projection.getCode() : projection;
        return this;
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
        const feature = WAFeature.factory(obj);
        const properties = feature.getProperties();

        // Attach helper property so spatial operators can later read the value
        properties[WAFeature.GEOMETRYNAME_HINT] = feature.getGeometryName();
        return this._logical.evaluate(properties);
    }

    /**
     * Returns true when object intersects value.
     * Inverse of `disjoint`.
     * 
     * @param value - The featurething to compare
     * 
     * @returns Builder
     */
    intersects(value: FeatureThing): BuilderOl {
        this._logical.add(new OlIntersects(value, { builderOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object do not intersects value.
     * Inverse of `intersects`.
     *  
     * @param value - The featurething to compare
     * 
     * @returns Builder
     */
    disjoint(value: FeatureThing): BuilderOl {
        this._logical.add(new OlDisjoint(value, { builderOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object completely contains value.
     * Inverse of `within`.
     * 
     * @param value - The featurething to compare
     * 
     * @returns Builder
     */
    contains(value: FeatureThing): BuilderOl {
        this._logical.add(new OlContains(value, { builderOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object is completely within value.
     * Inverse of `contains`.
     * 
     * @param value - The featurething to compare
     * 
     * @returns Builder
     */
    within(value: FeatureThing): BuilderOl {
        this._logical.add(new OlWithin(value, { builderOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object is no more than specified distance from value.
     * Inverse of `distanceBeyond`.
     * 
     * @remarks Requires a correct projection.
     * 
     * @param value - The featurething to compare
     * @param distance - Distance in meters
     * 
     * @returns Builder
     */
    distanceWithin(value: FeatureThing, distance: number): BuilderOl {
        this._logical.add(new OlDistanceWithin(value, { builderOpts: this._opts, distance: distance } as IDistanceOpts));
        return this;
    }

    /**
     * Returns true when object is more than specified distance from value.
     * Inverse of `distanceWithin`.
     * 
     * @remarks Requires a correct projection.
     * 
     * @param value - The featurething to compare
     * @param distance - Distance in meters
     * 
     * @returns Builder
     */
    distanceBeyond(value: FeatureThing, distance: number): BuilderOl {
        this._logical.add(new OlDistanceBeyond(value, { builderOpts: this._opts, distance: distance } as IDistanceOpts));
        return this;
    }

    /**
     * Returns operators as an OGC CQL query.
     * 
     * @returns OGC CQL query
     */
    asOgcCql() {
        return WAFilter.asOgcCql(this._logical);
    }

    /**
     * Returns operators as an OGC XML query.
     * 
     * @remarks
     * Wrap in encodeURI to avoid encoding issues
     * 
     * @returns OGC XML query
     */
    asOgcXml() {
        return WAFilter.asOgcXml(this._logical);
    }
}