import booleanIntersects from '@turf/boolean-intersects';
import { Feature } from "ol";
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import Geometry from "ol/geom/Geometry";
import LineString from 'ol/geom/LineString';
import Point from "ol/geom/Point";
import Polygon, { fromExtent } from "ol/geom/Polygon";
import { FeatureThing } from "./wa-contracts";

const formatWkt = new WKT();
const formatJson = new GeoJSON();

export class WAFeature {

    constructor(private _feature: Feature) { }

    static readonly DEFAULT_GEOMETRYNAME = 'geometry';
    static readonly OBJECT_PIGGYBACK = 'waoe_geometry';

    static factory = (obj: FeatureThing): WAFeature => {
        if (obj instanceof Function) {
            return WAFeature.factory(obj.call(obj, WAFeature.DEFAULT_GEOMETRYNAME));
        }
        if (obj instanceof WAFeature) {
            return obj;
        }
        if (obj instanceof Feature) {
            return new WAFeature(obj).assertSimple();
        }
        if (obj instanceof Geometry) {
            return new WAFeature(new Feature(obj)).assertSimple();
        }
        if (obj instanceof Array) {
            if (obj.length == 2) {
                return new WAFeature(new Feature(new Point(obj)));
            }
            if (obj.length == 4) {
                return new WAFeature(new Feature(fromExtent(obj as Extent)));
            }
        }
        if (obj instanceof Object) {
            if (WAFeature.OBJECT_PIGGYBACK in obj) {
                const geometryKey = obj[WAFeature.OBJECT_PIGGYBACK];
                return WAFeature.factory(obj[geometryKey]);
            }
            return new WAFeature(formatJson.readFeature(obj)).assertSimple();
        }
        if (typeof (obj) === 'string') {
            return new WAFeature(obj.trimLeft().charAt(0) === '{'
                ? formatJson.readFeature(obj)
                : formatWkt.readFeature(obj)
            ).assertSimple();
        }
        throw new Error("Unsupported geometry type");
    }

    assertSimple = () => {
        if (this.isMulti()) {
            throw new Error("Multi-geometries not supported");
        }
        return this;
    }

    getGeometry() {
        return this._feature.getGeometry();;
    }

    getOlFeature() {
        return this._feature;
    }

    isMulti() {
        return this.getGeometry().getType().includes('Multi');
    }

    isPolygon() {
        return this.getGeometry().getType() === 'Polygon';
    }

    isLineString() {
        return this.getGeometry().getType() === 'LineString';
    }

    isPoint() {
        return this.getGeometry().getType() === 'Point';
    }

    isExtent(): boolean {
        if (!this.isPolygon()) {
            return false;
        }
        const poly = (this.getGeometry() as Polygon);
        const polyExtent = fromExtent(poly.getExtent());
        return poly.getArea() === polyExtent.getArea();
    }

    toWkt() {
        return formatWkt.writeGeometry(this.getGeometry());
    }

    toGeoJson() {
        return formatJson.writeGeometry(this.getGeometry());
    }

    toGeoJsonObject() {
        return formatJson.writeGeometryObject(this.getOlFeature().getGeometry());
    }

    toGml() {
        if (this.isPoint()) {
            return `<gml:Point><gml:pos>${(this.getGeometry() as Point).getFlatCoordinates().join(' ')}</gml:pos></gml:Point>`;
        }
        if (this.isLineString()) {
            return `<gml:LineString><gml:posList>${(this.getGeometry() as LineString).getFlatCoordinates().join(' ')}</gml:posList></gml:LineString>`;
        }
        if (this.isPolygon()) {
            const rings = (this.getGeometry() as Polygon).getLinearRings().map((ring, idx) => {
                const ringType = idx == 0 ? 'exterior' : 'interior';
                return `<gml:${ringType}><gml:LinearRing><gml:posList>${ring.getFlatCoordinates().join(' ')}</gml:posList></gml:LinearRing></gml:${ringType}>`;
            });
            return `<gml:Polygon>${rings.join('')}</gml:Polygon>`;
        }
    }

    intersects(feature: WAFeature): boolean {
        if (this.isPoint()) {
            return feature.getGeometry().intersectsCoordinate((this.getGeometry() as Point).getCoordinates());
        }
        if (feature.isPoint()) {
            return feature.intersects(this);
        }

        if (this.isExtent()) {
            return feature.getGeometry().intersectsExtent(this.getGeometry().getExtent());
        }
        if (feature.isExtent()) {
            return feature.intersects(this);
        }

        return booleanIntersects(this.toGeoJsonObject() as any, feature.toGeoJsonObject() as any);
    }
}