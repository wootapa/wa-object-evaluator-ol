import { IOpenLayers, OpenLayersIntersects } from "./wa-openlayers";
import { ComparisonEquals, ComparisonGreaterThan } from "../core/wa-comparison";
import { BuilderCoreBase } from "../core/wa-builder-core";
import { ClassDict, Operator, ValueOrGetter } from "../core/wa-contracts";
import { LogicalAnd, LogicalOr } from "../core/wa-logical";

export class OpenLayersBuilder extends BuilderCoreBase<OpenLayersBuilder> implements IOpenLayers {
    
    protected getBuilder(): OpenLayersBuilder {
        return this;
    }

    protected getClassDict(): ClassDict {
        return {
            OpenLayersIntersects
        };
    }

    toOgc(): string {
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
            // ...
        };
        return walk(this._logical);
    }

    intersects(property: string, value: ValueOrGetter): OpenLayersBuilder {
        this._logical.add(new OpenLayersIntersects(property, value));
        return this;
    }
}