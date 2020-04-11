import lineIntersect from '@turf/line-intersect';
import { Feature } from "ol";
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { FeatureThing } from "./wa-contracts";

const formatWkt = new WKT();
const formatJson = new GeoJSON();

export class WAFeature {

    constructor(private _feature: Feature) { }

    static DEFAULT_GEOMETRYNAME = 'geometry';

    static factory = (obj: FeatureThing): WAFeature => {
        if (obj instanceof WAFeature) {
            return obj;
        }
        if (obj instanceof Feature) {
            return new WAFeature(obj);
        }
        if (obj instanceof Geometry) {
            return new WAFeature(new Feature(obj));
        }
        if (obj instanceof Function) {
            return WAFeature.factory(obj.call(obj, WAFeature.DEFAULT_GEOMETRYNAME));
        }
        return new WAFeature(formatWkt.readFeature(obj));
    }

    assertSimple = () => {
        if (this.isMulti()) {
            throw new Error("Geometry is multidimensional");
        }
        return this;
    };

    getGeometry = () => this._feature.getGeometry();

    getFeature = () => this._feature;

    toWkt(): string {
        return formatWkt.writeGeometry(this.getGeometry());
    }

    toJsonFeature(): any {
        return formatJson.writeFeatureObject(this.getFeature());
    }

    isMulti(): boolean {
        return this.getGeometry().getType().includes('Multi');
    }

    isPolygon(): boolean {
        return this.getGeometry().getType() === 'Polygon';
    }

    isLineString(): boolean {
        return this.getGeometry().getType() === 'LineString';
    }

    isPoint(): boolean {
        return this.getGeometry().getType() === 'Point';
    }

    isSquare(): boolean {
        if (!this.isPolygon()) {
            return false;
        }

        const coords = (this.getGeometry() as Polygon).getFlatCoordinates();

        return (coords.length == 10 &&
            coords[0] === coords[6] && // ulx == llx
            coords[2] === coords[4] && // urx = lrx
            coords[1] === coords[3] && // uly == ury 
            coords[6] === coords[8]); // lly == lry
    }

    intersects(feature: WAFeature): boolean {
        if (this.isPoint()) {
            return feature.getGeometry().intersectsCoordinate((this.getGeometry() as Point).getCoordinates());
        }
        if (feature.isPoint()) {
            return feature.intersects(this);
        }

        if (this.isSquare()) {
            return feature.getGeometry().intersectsExtent(this.getGeometry().getExtent());
        }
        if (feature.isSquare()) {
            return feature.intersects(this);
        }

        return lineIntersect(this.toJsonFeature(), feature.toJsonFeature()).features.length > 0;
    }
}