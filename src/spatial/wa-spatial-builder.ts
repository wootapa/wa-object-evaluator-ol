import { ValueOrGetter } from "../base/wa-contracts";
import { ComparisonBuilder } from "../comparison/wa-comparison-builder";
import { ISpatial, SpatialIntersects } from "./wa-spatial";

export class SpatialBuilder extends ComparisonBuilder implements ISpatial {

    intersects(property: string, value: ValueOrGetter): SpatialBuilder {
        this._logical.add(new SpatialIntersects(property, value));
        return this;
    }
}