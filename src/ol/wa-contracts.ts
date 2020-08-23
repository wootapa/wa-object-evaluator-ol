import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { ProjectionLike } from 'ol/proj';
import { IEvaluatorOpts, ThingOrThingGetter } from '../core/wa-contracts';

export type FeatureThing = ThingOrThingGetter<Feature | Geometry | Object | string>;

export interface IEvaluatorOlOpts extends IEvaluatorOpts {
    projCode: string
}

export interface IOlOpts {
    evaluatorOpts: IEvaluatorOlOpts,
    geometryName?: string
}

export interface IDistanceOpts extends IOlOpts {
    distance: number,
    greatCircle: boolean
}

export interface IFilterOpts {
    geometryName?: string,
    projection?: ProjectionLike,
    decimals?: number,
    // Will convert meters to projection units when using dwithin/beyond
    useProjectionUnitForDistance?: boolean
}

export interface ITransformOpts {
    sourceProj: ProjectionLike,
    targetProj: ProjectionLike
}
