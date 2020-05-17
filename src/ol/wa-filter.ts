import { Comparison, ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonIsNull, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike } from '../core/wa-comparison';
import { Operator } from '../core/wa-contracts';
import { Logical, LogicalAnd, LogicalNot, LogicalOr } from '../core/wa-logical';
import { OpenLayersIntersects } from './wa-ol';

export class WAFilter {

    private constructor() { }

    static asOgcCql = (logical: Logical): string => {
        const walk = (operator: Operator): string => {
            // Openlayers
            if (operator instanceof OpenLayersIntersects) {
                return `INTERSECTS(${operator.key}, ${operator.feature.toWkt()})`;
            }
            // Comparison
            if (operator instanceof Comparison) {
                const value = operator.value instanceof Date
                    ? operator.value.toISOString()
                    : typeof (operator.value) == 'string'
                        ? `'${operator.value}'`
                        : operator.value;

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
                return `(NOT ${operator.getOperators().map(walk).join(' AND NOT ')})`
            }
        };
        return walk(logical);
    }

    static asOgcXml = (logical: Logical): string => {
        const walk = (operator: Operator): string => {
            // Openlayers
            if (operator instanceof OpenLayersIntersects) {
                const property = `<ogc:PropertyName>${operator.key}</ogc:PropertyName>`;
                return `<ogc:Intersects>${property}${operator.feature.toGml()}</ogc:Intersects>`;
            }
            // Comparison
            if (operator instanceof Comparison) {
                const property = `<ogc:PropertyName>${operator.key}</ogc:PropertyName>`;
                const value = `<ogc:Literal>${operator.value instanceof Date ? operator.value.toISOString() : operator.value}</ogc:Literal>`;

                if (operator instanceof ComparisonEquals) {
                    return `<ogc:PropertyIsEqualTo matchCase="true">${property}${value}</ogc:PropertyIsEqualTo>`;
                }
                if (operator instanceof ComparisonIsNull) {
                    return `<ogc:PropertyIsNull>${property}</ogc:PropertyIsNull>`;
                }
                if (operator instanceof ComparisonGreaterThan) {
                    return `<ogc:PropertyIsGreaterThan>${property}${value}</ogc:PropertyIsGreaterThan>`;
                }
                if (operator instanceof ComparisonGreaterThanEquals) {
                    return `<ogc:PropertyIsGreaterThanOrEqualTo>${property}${value}</ogc:PropertyIsGreaterThanOrEqualTo>`;
                }
                if (operator instanceof ComparisonLessThan) {
                    return `<ogc:PropertyIsLessThan>${property}${value}</ogc:PropertyIsLessThan>`;
                }
                if (operator instanceof ComparisonLessThanEquals) {
                    return `<ogc:PropertyIsLessThanOrEqualTo>${property}${value}</ogc:PropertyIsLessThanOrEqualTo>`;
                }
                if (operator instanceof ComparisonLike) {
                    return `<ogc:PropertyIsLike matchCase="${operator.opts.matchCase}" wildCard="${operator.opts.wildCard}" escapeChar="\\" singleChar=".">${property}${value}</ogc:PropertyIsLike>`;
                }
            }
            // Logical            
            if (operator instanceof LogicalAnd) {
                return `<ogc:And>${operator.getOperators().map(walk).join('')}</ogc:And>`;
            }
            if (operator instanceof LogicalOr) {
                return `<ogc:Or>${operator.getOperators().map(walk).join('')}</ogc:Or>`;
            }
            if (operator instanceof LogicalNot) {
                return `<ogc:Not>${operator.getOperators().map(walk).join('')}</ogc:Not>`;
            }
        };
        return `<ogc:Filter xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc">${walk(logical)}</ogc:Filter>`;
    }
}