import { IOpenLayers, OpenLayersIntersects } from "./wa-ol";
import { FeatureThing } from "./wa-contracts";
import { BuilderCoreBase } from "../core/wa-builder-core";
import { ClassDict, Operator } from "../core/wa-contracts";
import { ComparisonEquals, ComparisonGreaterThan } from "../core/wa-comparison";
import { LogicalAnd, LogicalOr } from "../core/wa-logical";
import { Util } from "./wa-util";


export class BuilderOl extends BuilderCoreBase<BuilderOl> implements IOpenLayers {

    protected getBuilder(): BuilderOl {
        return this;
    }

    protected getClassDict(): ClassDict {
        return {
            OpenLayersIntersects
        };
    }

    evaluate = (obj: FeatureThing) => {
        const olFeature = Util.resolveFeature(obj).getFeature();
        const olPropertyGetter = olFeature.get.bind(olFeature);
        return this._logical.evaluate(olPropertyGetter);
    };

    toXmlFilter(): string {
        const walk = (operator: Operator): string => {
            if (operator instanceof ComparisonEquals) {
                return `<eq>${operator.key}:${operator.value}</eq>`;
            }
            if (operator instanceof ComparisonGreaterThan) {
                return `<gt>${operator.key}:${operator.value}</gt>`;
            }
            if (operator instanceof LogicalAnd) {
                return `<and>${operator.getOperators().map(walk).join('')}</and>`
            }
            if (operator instanceof LogicalOr) {
                return `<or>${operator.getOperators().map(walk).join('')}</or>`
            }
        };
        return walk(this._logical);
    }

    toCqlFilter() {

    }

    intersects(value: FeatureThing): BuilderOl {
        this._logical.add(new OpenLayersIntersects(value));
        return this;
    }
}