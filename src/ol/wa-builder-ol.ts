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

    evaluate = (obj: FeatureThing) => {
        const olFeature = WAFeature.factory(obj).getFeature();
        const olPropertyGetter = olFeature.get.bind(olFeature);
        return this._logical.evaluate(olPropertyGetter);
    }

    intersects(value: FeatureThing): BuilderOl;
    intersects(propertyOrValue: string | FeatureThing, value?: FeatureThing): BuilderOl {
        this._logical.add(value
            ? new OpenLayersIntersects(propertyOrValue as string, value)
            : new OpenLayersIntersects(WAFeature.DEFAULT_GEOMETRYNAME, propertyOrValue)
        );
        return this;
    }

    asOgcCql = () => WAFilter.asOgcCql(this._logical);
    asOgcXml = () => WAFilter.asOgcXml(this._logical);
}