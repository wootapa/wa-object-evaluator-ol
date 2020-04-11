import { BuilderCoreBase } from "../core/wa-builder-core";
import { Comparison, ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonIsNull, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike } from "../core/wa-comparison";
import { ClassDict, Operator } from "../core/wa-contracts";
import { LogicalAnd, LogicalNot, LogicalOr } from "../core/wa-logical";
import { FeatureThing } from "./wa-contracts";
import { WAFeature } from "./wa-feature";
import { IOpenLayers, OpenLayersIntersects } from "./wa-ol";

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

    toCqlFilter(): string {
        const walk = (operator: Operator): string => {
            // Openlayers
            if (operator instanceof OpenLayersIntersects) {
                return `INTERSECTS(${operator.key}, ${operator.feature.toWkt()})`;
            }
            // Comparison
            if (operator instanceof Comparison) {
                const value = typeof (operator.value) == 'string' ? `'${operator.value}'` : operator.value;

                if (operator instanceof ComparisonEquals) {
                    return `${operator.key} = ${value}`;
                }
                if (operator instanceof ComparisonIsNull) {
                    return `${operator.key} IS NULL`;
                }
                if (operator instanceof ComparisonGreaterThan) {
                    return `${operator.key} > ${value}`;
                }
                if (operator instanceof ComparisonGreaterThanEquals) {
                    return `${operator.key} >= ${value}`;
                }
                if (operator instanceof ComparisonLessThan) {
                    return `${operator.key} < ${value}`;
                }
                if (operator instanceof ComparisonLessThanEquals) {
                    return `${operator.key} <= ${value}`;
                }
                if (operator instanceof ComparisonLike) {
                    const reValue = operator.value.toString().replace(new RegExp(`\\${operator.opts.wildCard}`, 'g'), '%')
                    return `${operator.key} ${operator.opts.matchCase ? 'LIKE' : 'ILIKE'} '${reValue}'`;
                }
            }
            // Logical            
            if (operator instanceof LogicalAnd) {
                return `(${operator.getOperators().map(walk).join(' AND ')})`
            }
            if (operator instanceof LogicalOr) {
                return `(${operator.getOperators().map(walk).join(' OR ')})`
            }
            if (operator instanceof LogicalNot) {
                return `(${operator.getOperators().map(walk).join(' NOT ')})`
            }
        };
        return walk(this._logical);
    }

    toXmlFilter() {

    }
}