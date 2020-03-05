import { ValueOrGetter, BuilderBase } from "../core";
import { IOpenLayers, OpenLayersIntersects } from "./wa-openlayers";

export class OpenLayersBuilder extends BuilderBase<OpenLayersBuilder> implements IOpenLayers {
    
    protected getThisPointer(): OpenLayersBuilder {
        return this;
    }

    intersects(property: string, value: ValueOrGetter): OpenLayersBuilder {
        this._logical.add(new OpenLayersIntersects(property, value));
        return this;
    }
}