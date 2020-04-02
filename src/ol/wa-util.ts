import Geometry from "ol/geom/Geometry";
import { Feature } from "ol";
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { WAFeature } from "./wa-feature";
import { FeatureThing } from "./wa-contracts";

export class Util {
    static formatWkt = new WKT();
    static formatJson = new GeoJSON();

    static resolveFeature = (obj: FeatureThing): WAFeature => {
        if (obj instanceof Function) {
            return Util.resolveFeature(obj.call(obj, 'geometry'));
        }
        if (obj instanceof Feature) {
            return new WAFeature(obj);
        }
        if (obj instanceof Geometry) {
            return new WAFeature(new Feature(obj));
        }
        return new WAFeature(Util.formatWkt.readFeature(obj));
    }

    static assertSimple(features: WAFeature[]): void {
        features.forEach(f => {
            if (f.isMulti()) throw new Error("Geometry is multidimensional");
        })
    }
}
