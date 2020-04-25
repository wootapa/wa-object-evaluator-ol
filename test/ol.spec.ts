import { expect } from 'chai';
import { Feature } from 'ol';
import { Extent, getCenter } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import { fromExtent } from 'ol/geom/Polygon';
import { and, fromJson } from '../src/waoe.ol';

const polyExtent: Extent = [0, 0, 10, 10];
const poly = fromExtent(polyExtent);
const polyWkt = new WKT().writeGeometry(poly);
const polyJson = new GeoJSON().writeGeometry(poly);
const polyFeature = new Feature(poly);

const pointCenter = new Point(getCenter(poly.getExtent()));
const lineCrosses = new LineString([[15, 0], [0, 10]]);

describe("ol", () => {
    it("polys of different formats intersects", () => {
        const result = and()
            .intersects(polyExtent)
            .intersects(poly)
            .intersects(polyWkt)
            .intersects(polyJson)
            .done()
            .evaluate(polyFeature);

        expect(result).true;
    });

    it("point of poly centroid intersects", () => {
        const result = and()
            .intersects(pointCenter)
            .done()
            .evaluate(poly);

        expect(result).true;
    });

    it("line crossing poly intersects", () => {
        const result = and()
            .intersects(lineCrosses)
            .done()
            .evaluate(poly);

        expect(result).true;
    });

    it("builder and json-builder evaluates same", () => {
        const builder1 = and()
            .intersects(lineCrosses)
            .done();

        const builder2 = fromJson(builder1.toJson());

        const result1 = builder1.evaluate(poly);
        const result2 = builder2.evaluate(poly);
        expect(result1).eq(result2);
    });
});