import { expect } from 'chai';
import { Feature } from 'ol';
import { Extent, getBottomRight, getCenter, getTopLeft } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import { fromExtent } from 'ol/geom/Polygon';
import { and, defaultProjection, fromJson } from '../src/waoe.ol';

defaultProjection('EPSG:3857');

const polyExtent: Extent = [1558356.9283, 7559163.7738, 1581670.2220, 7573457.4981];
const poly = fromExtent(polyExtent);
const polyWkt = new WKT().writeGeometry(poly);
const polyJson = new GeoJSON().writeGeometry(poly);
const polyFeature = new Feature(poly);
const pointCenter = new Point(getCenter(poly.getExtent()));
const lineCrosses = new LineString([getTopLeft(polyExtent), getBottomRight(polyExtent)]);

describe('ol', () => {
    it('polys of different formats intersects', () => {
        const result = and()
            .intersects(polyExtent)
            .intersects(poly)
            .intersects(polyWkt)
            .intersects(polyJson)
            .done()
            .evaluate(polyFeature);

        expect(result).true;
    });

    it('nondefault geometryname', () => {
        const polyFeatureCustomName = new Feature({ 'the_geom': poly });
        polyFeatureCustomName.setGeometryName('the_geom');

        const result = and()
            .intersects(polyFeatureCustomName)
            .done()
            .evaluate(polyFeatureCustomName);

        expect(result).true;
    });

    it('point of poly centroid intersects', () => {
        const result = and()
            .intersects(pointCenter)
            .done()
            .evaluate(poly);

        expect(result).true;
    });

    it('line crossing poly intersects', () => {
        const result = and()
            .intersects(lineCrosses)
            .done()
            .evaluate(poly);

        expect(result).true;
    });

    it('builder and json-builder evaluates same', () => {
        const builder1 = and()
            .intersects(lineCrosses)
            .disjoint(lineCrosses)
            .within(poly)
            .contains(poly)
            .distanceWithin(pointCenter, 100)
            .distanceWithin(pointCenter, 500)
            .done();

        const builder2 = fromJson(builder1.asJson());

        const result1 = builder1.evaluate(poly);
        const result2 = builder2.evaluate(poly);
        expect(result1).eq(result2);
    });

    it('point is within poly', () => {
        const builder = and()
            .within(poly)
            .done();

        const result = builder.evaluate(pointCenter);
        expect(result).true;
    });

    it('poly contains point', () => {
        const builder = and()
            .contains(pointCenter)
            .done();

        const result = builder.evaluate(poly);
        expect(result).true;
    });

    it('distance approximation', () => {

        const p1 = [1559500, 7565753]; // Home
        const p2 = [1575395, 7564424]; // Work
        const distance = 10000;

        const builder = and()
            .distanceWithin(p1, distance)
            .distanceBeyond(p1, distance / 2)
            .done();

        const result = builder.evaluate(p2);
        expect(result).true;
    });
});