import { Comparison, ComparisonEquals, ComparisonGreaterThan, ComparisonGreaterThanEquals, ComparisonIsNull, ComparisonLessThan, ComparisonLessThanEquals, ComparisonLike } from '../core/wa-comparison';
import { Operator } from '../core/wa-contracts';
import { Logical, LogicalAnd, LogicalNot, LogicalOr } from '../core/wa-logical';
import { IDistanceOpts, IFilterOpts } from './wa-contracts';
import { OlBase, OlContains, OlDisjoint, OlDistanceBeyond, OlDistanceWithin, OlIntersects, OlWithin } from './wa-ol';

export class WAFilter {

    private constructor() {
        /* Empty */
    }

    static asOgcCql = (logical: Logical, opts?: IFilterOpts): string => {
        const walk = (operator: Operator): string => {
            // Openlayers
            if (operator instanceof OlBase) {
                const property = opts?.geometryName ?? operator.key;
                const value = opts?.projection
                    ? operator.feature.asWkt(opts?.decimals, { sourceProj: operator.opts.evaluatorOpts.projCode, targetProj: opts.projection })
                    : operator.feature.asWkt(opts?.decimals);

                if (operator instanceof OlIntersects) {
                    return `INTERSECTS(${property}, ${value})`;
                }
                if (operator instanceof OlDisjoint) {
                    return `DISJOINT(${property}, ${value})`;
                }
                if (operator instanceof OlContains) {
                    return `CONTAINS(${property}, ${value})`;
                }
                if (operator instanceof OlWithin) {
                    return `WITHIN(${property}, ${value})`;
                }
                if (operator instanceof OlDistanceWithin) {
                    const opts = operator.opts as IDistanceOpts;
                    return `DWITHIN(${property}, ${value}, ${opts.distance}, m)`;
                }
                if (operator instanceof OlDistanceBeyond) {
                    const opts = operator.opts as IDistanceOpts;
                    return `BEYOND(${property}, ${value}, ${opts.distance}, m)`;
                }
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
            if (operator instanceof Logical) {
                const operators = operator.getOperators();
                if (operators.length > 0) {
                    if (operator instanceof LogicalAnd) {
                        return `(${operators.map(walk).join(' AND ')})`
                    }
                    if (operator instanceof LogicalOr) {
                        return `(${operators.map(walk).join(' OR ')})`
                    }
                    if (operator instanceof LogicalNot) {
                        return `(NOT ${operators.map(walk).join(' AND NOT ')})`
                    }
                }
                return '';
            }
        };
        return walk(logical);
    }

    static asOgcXml = (logical: Logical, opts?: IFilterOpts): string => {
        const walk = (operator: Operator): string => {
            // Openlayers
            if (operator instanceof OlBase) {
                const property = `<ogc:PropertyName>${opts?.geometryName ?? operator.key}</ogc:PropertyName>`;
                const value = opts?.projection
                    ? operator.feature.asGml(opts?.decimals, { sourceProj: operator.opts.evaluatorOpts.projCode, targetProj: opts.projection })
                    : operator.feature.asGml(opts?.decimals);

                if (operator instanceof OlIntersects) {
                    return `<ogc:Intersects>${property}${value}</ogc:Intersects>`;
                }
                if (operator instanceof OlDisjoint) {
                    return `<ogc:Disjoint>${property}${value}</ogc:Disjoint>`;
                }
                if (operator instanceof OlContains) {
                    return `<ogc:Contains>${property}${value}</ogc:Contains>`;
                }
                if (operator instanceof OlWithin) {
                    return `<ogc:Within>${property}${value}</ogc:Within>`;
                }
                if (operator instanceof OlDistanceWithin) {
                    const opts = operator.opts as IDistanceOpts;
                    const distance = `<Distance units="m">${opts.distance}</Distance>`;
                    return `<ogc:DWithin>${property}${value}${distance}</ogc:DWithin>`;
                }
                if (operator instanceof OlDistanceBeyond) {
                    const opts = operator.opts as IDistanceOpts;
                    const distance = `<Distance units="m">${opts.distance}</Distance>`;
                    return `<ogc:Beyond>${property}${value}${distance}</ogc:Beyond>`;
                }
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
            if (operator instanceof Logical) {
                const operators = operator.getOperators();
                if (operators.length > 0) {
                    if (operator instanceof LogicalAnd) {
                        return `<ogc:And>${operators.map(walk).join('')}</ogc:And>`;
                    }
                    if (operator instanceof LogicalOr) {
                        return `<ogc:Or>${operators.map(walk).join('')}</ogc:Or>`;
                    }
                    if (operator instanceof LogicalNot) {
                        return `<ogc:Not>${operators.map(walk).join('')}</ogc:Not>`;
                    }
                }
                return '';
            }
        };
        return `<ogc:Filter xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc">${walk(logical)}</ogc:Filter>`;
    }
}