import { ProjectionLike } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import { ClassDict } from '../core/wa-contracts';
import { EvaluatorBase } from '../core/wa-evaluator';
import { FeatureThing, IDistanceOpts, IEvaluatorOlOpts, IFilterOpts } from './wa-contracts';
import { WAFeature } from './wa-feature';
import { WAFilter } from './wa-filter';
import { IOlOperators, OlContains, OlDisjoint, OlDistanceBeyond, OlDistanceWithin, OlIntersects, OlWithin } from './wa-ol';

let DEFAULT_PROJECTION = 'EPSG:3857';

// Holds anything we want operators to know about
class EvaluatorOlOpts implements IEvaluatorOlOpts {
    projCode = DEFAULT_PROJECTION;
}

export class EvaluatorOl extends EvaluatorBase<EvaluatorOl> implements IOlOperators {
    private _opts = new EvaluatorOlOpts();

    protected _getConfiguration(): IEvaluatorOlOpts {
        return this._opts;
    }

    protected _setConfiguration(config: IEvaluatorOlOpts): void {
        this._opts = config;
    }

    protected _getEvaluator(): EvaluatorOl {
        return this;
    }

    protected _getClassDict(): ClassDict {
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
     * Sets default projection for all evaluators.
     * Default `EPSG:3857` (Web Mercator)
     *
     * @remarks Projection must be known.
     *
     * @param projection - Projection instance or code
     */
    static defaultProjection(projection: ProjectionLike): void {
        DEFAULT_PROJECTION = projection instanceof Projection ? projection.getCode() : projection;
    }

    /**
     * Sets projection for all child spatial operators.
     *
     * @remarks Projection must be known.
     *
     * @param projection - Projection instance or code
     *
     * @returns Evaluator
     */
    projection(projection: ProjectionLike): EvaluatorOl {
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
    evaluate(obj: FeatureThing): boolean {
        // To support all base operators, we need a dict or they can't resolve values
        const feature = WAFeature.factory(obj);
        const properties = feature.getProperties();

        // Attach helper property so spatial operators can later read the value
        properties[WAFeature.GEOMETRYNAME_HINT] = feature.getGeometryName();
        return this._logical.evaluate(properties);
    }

    /**
     * Returns true when object intersects value.
     *
     * @param value - The featurething to compare
     *
     * @returns Evaluator
     */
    intersects(value: FeatureThing): EvaluatorOl {
        this._logical.add(new OlIntersects(value, { evaluatorOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object do not intersects value.
     *
     * @param value - The featurething to compare
     *
     * @returns Evaluator
     */
    disjoint(value: FeatureThing): EvaluatorOl {
        this._logical.add(new OlDisjoint(value, { evaluatorOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object completely contains value.
     *
     * @param value - The featurething to compare
     *
     * @returns Evaluator
     */
    contains(value: FeatureThing): EvaluatorOl {
        this._logical.add(new OlContains(value, { evaluatorOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object is completely within value.
     *
     * @param value - The featurething to compare
     *
     * @returns Evaluator
     */
    within(value: FeatureThing): EvaluatorOl {
        this._logical.add(new OlWithin(value, { evaluatorOpts: this._opts }));
        return this;
    }

    /**
     * Returns true when object is no more than specified distance from value.
     *
     * @remarks Requires a correct projection.
     *
     * @param value - The featurething to compare
     * @param distance - Distance in meters
     *
     * @returns Evaluator
     */
    distanceWithin(value: FeatureThing, distance: number): EvaluatorOl {
        this._logical.add(new OlDistanceWithin(value, { evaluatorOpts: this._opts, distance: distance } as IDistanceOpts));
        return this;
    }

    /**
     * Returns true when object is more than specified distance from value.
     *
     * @remarks Requires a correct projection.
     *
     * @param value - The featurething to compare
     * @param distance - Distance in meters
     *
     * @returns Evaluator
     */
    distanceBeyond(value: FeatureThing, distance: number): EvaluatorOl {
        this._logical.add(new OlDistanceBeyond(value, { evaluatorOpts: this._opts, distance: distance } as IDistanceOpts));
        return this;
    }

    /**
     * Returns operators as an OGC CQL query.
     *
     * @param opts - Optional serializer settings.
     *
     * @returns OGC CQL query
     */
    asOgcCql(opts?: IFilterOpts): string {
        return WAFilter.asOgcCql(this._logical, opts);
    }

    /**
     * Returns operators as an OGC XML query.
     *
     * @remarks
     * Wrap in encodeURI to avoid encoding issues
     *
     * @param opts - Optional serializer settings.
     *
     * @returns OGC XML query
     */
    asOgcXml(opts?: IFilterOpts): string {
        return WAFilter.asOgcXml(this._logical, opts);
    }
}