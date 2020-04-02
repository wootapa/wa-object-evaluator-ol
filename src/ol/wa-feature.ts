import Geometry from "ol/geom/Geometry";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import { Feature } from "ol";
import lineIntersect  from '@turf/line-intersect'
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';

const formatWkt = new WKT();
const formatJson = new GeoJSON();

export class WAFeature {

    constructor(private _feature: Feature) { }

    getGeometry = () => this._feature.getGeometry();

    getFeature = () => this._feature;

    toWkt(): string {
        return formatWkt.writeGeometry(this.getGeometry());
    }

    toTurf(): any {
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
            coords[0] === coords[2] &&
            coords[1] === coords[7] &&
            coords[3] === coords[5] &&
            coords[4] === coords[6]);
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

        return lineIntersect(this.toTurf(), feature.toTurf()).features.length > 0;
    }
}