import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { IBuilderOpts, ThingOrThingGetter } from '../core/wa-contracts';

export type FeatureThing = ThingOrThingGetter<Feature | Geometry | Object | string>;

export interface IOlBuilderOpts extends IBuilderOpts {
    projCode: string
}

export interface IOlOpts {
    builderOpts: IOlBuilderOpts,
    geometryName?: string,
    projCode?: string
}

export interface IDistanceOpts extends IOlOpts {
    distance: number
}
