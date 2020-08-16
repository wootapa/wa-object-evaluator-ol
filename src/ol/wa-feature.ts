import booleanContains from '@turf/boolean-contains';
import booleanIntersects from '@turf/boolean-intersects';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Extent, getCenter } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import GML3 from 'ol/format/GML3';
import WKT from 'ol/format/WKT';
import Circle from 'ol/geom/Circle';
import Geometry from 'ol/geom/Geometry';
import GeometryLayout from 'ol/geom/GeometryLayout';
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPoint from 'ol/geom/MultiPoint';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Point from 'ol/geom/Point';
import Polygon, { fromCircle, fromExtent } from 'ol/geom/Polygon';
import { ProjectionLike } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { IDictionary } from '../core/wa-contracts';
import { FeatureThing, ITransformOpts } from './wa-contracts';

const formatWkt = new WKT();
const formatJson = new GeoJSON();
const formatGml = new GML3();

export class WAFeature {
    constructor(private _feature: Feature) { }

    static readonly GEOMETRYNAME_DEFAULT = 'geometry';
    static readonly GEOMETRYNAME_HINT = 'waoe_geometryname';
    static readonly WGS84_RADIUS = 6371008.8;
    static readonly WGS84_CODE = 'EPSG:4326';

    static factory = (obj: FeatureThing): WAFeature => {
        if (obj instanceof WAFeature) {
            return obj;
        }
        else if (obj instanceof Function) {
            return WAFeature.factory(obj.call(obj, WAFeature.GEOMETRYNAME_DEFAULT));
        }
        else if (obj instanceof Feature) {
            return new WAFeature(obj).assertValid();
        }
        else if (obj instanceof Geometry) {
            return new WAFeature(new Feature(obj)).assertValid();
        }
        else if (obj instanceof Array) {
            if (obj.length > 0 && obj.length % 2 === 0) {
                // Point?
                if (obj.length == 2) {
                    return new WAFeature(new Feature(new Point(obj, GeometryLayout.XY)));
                }
                // Extent->Polygon?
                if (obj.length == 4) {
                    return new WAFeature(new Feature(fromExtent(obj as Extent)));
                }
                // LineString?
                if (obj.length == 6) {
                    return new WAFeature(new Feature(new LineString(obj, GeometryLayout.XY)));
                }
                // Polygon or LineString?
                const [headX, headY] = obj.slice(0, 2);
                const [tailX, tailY] = obj.slice(-2);
                if (headX === tailX && headY === tailY) {
                    return new WAFeature(new Feature(new Polygon(obj, GeometryLayout.XY, [obj.length])));
                }
                return new WAFeature(new Feature(new LineString(obj, GeometryLayout.XY)));
            }
        }
        else if (obj instanceof Object) {
            // Resolving from a spatial operator?
            if (WAFeature.GEOMETRYNAME_HINT in obj) {
                const geometryKey = obj[WAFeature.GEOMETRYNAME_HINT];
                return WAFeature.factory(obj[geometryKey]);
            }
            // Resolving from evaluator?
            const candidate = Object.entries(obj).find(([, v]) => v instanceof Geometry);
            if (candidate) {
                const [key, geometry] = candidate;
                const feature = new Feature(obj);
                feature.setGeometryName(key);
                feature.setGeometry(geometry);
                return new WAFeature(feature).assertValid();
            }
            // Probably parsed geojson
            return new WAFeature(formatJson.readFeature(obj)).assertValid();
        }
        else if (typeof (obj) === 'string') {
            switch (obj.trimLeft().charAt(0)) {
                case '{': return new WAFeature(formatJson.readFeature(obj)).assertValid();
                default: return new WAFeature(formatWkt.readFeature(obj)).assertValid();
            }
        }
        throw new Error('Unsupported geometry type');
    }

    static transform(geometry: Geometry, sourceProjection: ProjectionLike, targetProjection: ProjectionLike): Geometry {
        return geometry.clone().transform(sourceProjection, targetProjection);
    }

    assertValid(): WAFeature {
        if (!(this.getGeometry() instanceof Geometry)) {
            throw new Error('Not a geometry');
        }
        if (this.isCircle()) {
            this._feature.setGeometry(fromCircle(this.getGeometry() as Circle));
        }
        return this;
    }

    getGeometry(): Geometry {
        return this._feature.getGeometry();
    }

    getGeometryTransformed(sourceProjection: ProjectionLike, targetProjection: ProjectionLike): Geometry {
        return WAFeature.transform(this.getGeometry(), sourceProjection, targetProjection);
    }

    getGeometryName(): string {
        return this._feature.getGeometryName();
    }

    setGeometryName(geometryName: string): void {
        if (geometryName !== this.getGeometryName()) {
            const olFeature = this.getOlFeature();
            olFeature.set(geometryName, olFeature.getGeometry());
            olFeature.unset(olFeature.getGeometryName());
            olFeature.setGeometryName(geometryName);
        }
    }

    getExtent(): Extent {
        return this.getGeometry().getExtent();
    }

    getProperties(): IDictionary<any> {
        return this._feature.getProperties();
    }

    getCenter(): Coordinate {
        return getCenter(this.getExtent());
    }

    getOlFeature(): Feature {
        return this._feature;
    }

    isMulti(): boolean {
        return this.getGeometry().getType().includes('Multi');
    }

    isCircle(): boolean {
        return this.getGeometry().getType() === 'Circle';
    }

    isPolygon(): boolean {
        return this.getGeometry().getType() === 'Polygon';
    }

    isMultiPolygon(): boolean {
        return this.getGeometry().getType() === 'MultiPolygon';
    }

    isLineString(): boolean {
        return this.getGeometry().getType() === 'LineString';
    }

    isMultiLineString(): boolean {
        return this.getGeometry().getType() === 'MultiLineString';
    }

    isPoint(): boolean {
        return this.getGeometry().getType() === 'Point';
    }

    isMultiPoint(): boolean {
        return this.getGeometry().getType() === 'MultiPoint';
    }

    isExtent(): boolean {
        if (!this.isPolygon()) {
            return false;
        }

        const poly = (this.getGeometry() as Polygon);
        const polyExtent = fromExtent(poly.getExtent());

        if (poly.getFlatCoordinates().length !== polyExtent.getFlatCoordinates().length) {
            return false;
        }
        // Could in theory be topologically different and produce the same area
        return poly.getArea() === polyExtent.getArea();
    }

    asWkt(decimals?: number, opts?: ITransformOpts): string {
        const geom = opts
            ? this.getGeometryTransformed(opts.sourceProj, opts.targetProj)
            : this.getGeometry();
        return formatWkt.writeGeometry(geom, { decimals: decimals });
    }

    asGeoJson(): string {
        return formatJson.writeGeometry(this.getGeometry());
    }

    asTurf(projCode: string): any {
        return formatJson.writeGeometryObject(this.getGeometryTransformed(projCode, WAFeature.WGS84_CODE)) as any;
    }

    asTurfArray(projCode: string): any[] {
        let geometries: any[];

        if (this.isMultiPolygon()) {
            geometries = (this.getGeometry() as MultiPolygon).getPolygons();
        }
        else if (this.isMultiLineString()) {
            geometries = (this.getGeometry() as MultiLineString).getLineStrings();
        }
        else if (this.isMultiPoint()) {
            geometries = (this.getGeometry() as MultiPoint).getPoints();
        }
        else {
            geometries = [this.getGeometry()];
        }

        return geometries.map(geometry => formatJson.writeGeometryObject(WAFeature.transform(geometry, projCode, WAFeature.WGS84_CODE)));
    }

    asGml(decimals?: number, opts?: ITransformOpts): string {
        const geom = opts
            ? this.getGeometryTransformed(opts.sourceProj, opts.targetProj)
            : this.getGeometry();
        return formatGml.writeGeometry(geom, { decimals: decimals });
    }

    intersects(feature: WAFeature, projCode: string): boolean {
        if (this.isPoint()) {
            return feature.getGeometry().intersectsCoordinate(this.getCenter());
        }
        if (feature.isPoint()) {
            return feature.intersects(this, projCode);
        }

        if (this.isExtent()) {
            return feature.getGeometry().intersectsExtent(this.getExtent());
        }
        if (feature.isExtent()) {
            return feature.intersects(this, projCode);
        }
        return booleanIntersects(this.asTurf(projCode), feature.asTurf(projCode));
    }

    contains(feature: WAFeature, projCode: string): boolean {
        if (feature.isPoint()) {
            return this.getGeometry().intersectsCoordinate(feature.getCenter());
        }
        // Turf contains cant understand multigeometries so we map...
        return this.asTurfArray(projCode).some(a => feature.asTurfArray(projCode).every(b => booleanContains(a, b)));
    }

    dwithin(feature: WAFeature, distance: number, projCode: string): boolean {
        const a = getCenter(this.getGeometryTransformed(projCode, WAFeature.WGS84_CODE).getExtent());
        const b = getCenter(feature.getGeometryTransformed(projCode, WAFeature.WGS84_CODE).getExtent());
        return getDistance(a, b, WAFeature.WGS84_RADIUS) <= distance;
    }
}