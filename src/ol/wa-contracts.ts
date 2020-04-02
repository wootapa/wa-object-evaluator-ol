import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { ThingOrThingGetter } from '../core/wa-contracts';

export type FeatureThing = ThingOrThingGetter<Feature | Geometry | string>;
