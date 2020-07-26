
import { KeyValue } from '../core/wa-comparison';
import { IEvaluatable, IJson, IJsonDump, IReport } from '../core/wa-contracts';
import { Reporter } from '../core/wa-util';
import { BuilderOl } from './wa-builder-ol';
import { FeatureThing, IDistanceOpts, IOlOpts } from './wa-contracts';
import { WAFeature } from './wa-feature';

// Base class for all operators
export abstract class OlBase extends KeyValue implements IEvaluatable, IJson {
    static alias: string;
    protected _feature: WAFeature;
    protected _opts: IOlOpts;
    protected _reporter: Reporter;

    constructor(value: FeatureThing, opts: IOlOpts) {
        const feature = WAFeature.factory(value);

        // Defined when restoring from json
        if (opts.geometryName) {
            feature.setGeometryName(opts.geometryName);
        }

        super(feature.getGeometryName(), feature.asWkt());
        this._feature = feature;
        this._opts = { geometryName: feature.getGeometryName(), ...opts };
        this._reporter = new Reporter(`${this.getAlias()}:${this.key}`);
    }

    get feature(): WAFeature {
        return this._feature;
    }

    get opts(): IOlOpts {
        return this._opts;
    }

    getAlias(): string {
        return (this.constructor as any).alias;
    }

    getReport(): IReport {
        return this._reporter.getReport();
    }

    resetReport(): void {
        this._reporter.reset();
    }

    asJson(): IJsonDump {
        return {
            type: this.getAlias(),
            ctorArgs: [this.value, this.opts]
        };
    }

    evaluate<FeatureThing>(obj: FeatureThing): boolean {
        const evalFeature = WAFeature.factory(obj);
        this._reporter.start();

        let result = false;
        const projCode = this._opts.builderOpts.projCode;

        if (this instanceof OlIntersects) {
            result = this._feature.intersects(evalFeature, projCode);
        }
        else if (this instanceof OlDisjoint) {
            result = !this._feature.intersects(evalFeature, projCode);
        }
        else if (this instanceof OlContains) {
            result = evalFeature.contains(this.feature, projCode);
        }
        else if (this instanceof OlWithin) {
            result = this._feature.contains(evalFeature, projCode);
        }
        else if (this instanceof OlDistanceWithin) {
            const opts = this._opts as IDistanceOpts;
            result = this._feature.dwithin(evalFeature, opts.distance, projCode);
        }
        else if (this instanceof OlDistanceBeyond) {
            const opts = this._opts as IDistanceOpts;
            result = !this._feature.dwithin(evalFeature, opts.distance, projCode);
        }

        this._reporter.stop(result);
        return result;
    }
}

// To be implemented in builder
export interface IOlOperators {
    intersects(value: FeatureThing): BuilderOl,
    disjoint(value: FeatureThing): BuilderOl,
    contains(value: FeatureThing): BuilderOl,
    within(value: FeatureThing): BuilderOl,
    distanceWithin(value: FeatureThing, distance: number): BuilderOl
    distanceBeyond(value: FeatureThing, distance: number): BuilderOl
}

export class OlIntersects extends OlBase {
    static alias = 'intersects';
}

export class OlDisjoint extends OlBase {
    static alias = 'disjoint';
}

export class OlContains extends OlBase {
    static alias = 'contains';
}

export class OlWithin extends OlBase {
    static alias = 'within';
}

export class OlDistanceWithin extends OlBase {
    static alias = 'dwithin';
}
export class OlDistanceBeyond extends OlBase {
    static alias = 'beyond';
}
