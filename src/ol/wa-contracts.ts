import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { IEvaluatorOpts, ThingOrThingGetter } from '../core/wa-contracts';

export type FeatureThing = ThingOrThingGetter<Feature | Geometry | Object | string>;

export interface IEvaluatorOlOpts extends IEvaluatorOpts {
    projCode: string
}

export interface IOlOpts {
    evaluatorOpts: IEvaluatorOlOpts,
    geometryName?: string,
    projCode?: string
}

export interface IDistanceOpts extends IOlOpts {
    distance: number
}

export interface IFilterOpts {
    geometryName?: string
}
