import { expect } from 'chai';
import { Feature } from 'ol';
import { getCenter } from 'ol/extent';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { Builder } from '../src/waoe';

const polyAFeature = new Feature({
    geometry: new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]])
});
const polyA = new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const polyAWkt = 'POLYGON((0 0,10 0,10 10,0 10,0 0))';
const centerA = new Point(getCenter(polyA.getExtent()));
const crossesA = new LineString([[15, 0], [0, 10]]);

describe("ol", () => {
    it("polys of different formats intersects", () => {
        const result = Builder.and()
            .intersects(polyA)
            .intersects(polyAWkt)
            .done()
            .evaluate(polyAFeature);

        expect(result).true;
    });

    it("point of poly centroid intersects", () => {
        const result = Builder.and()
            .intersects(centerA)
            .done()
            .evaluate(polyAFeature);

        expect(result).true;
    });

    it("line crossing poly intersects", () => {
        const result = Builder.and()
            .intersects(crossesA)
            .done()
            .evaluate(polyAFeature);

        expect(result).true;
    });

    it("builder and json-builder evaluates same", () => {
        const builder1 = Builder.and()
            .intersects(crossesA)
            .done();

        const builder2 = Builder.fromJson(builder1.toJson());

        const result1 = builder1.evaluate(polyAFeature);
        const result2 = builder2.evaluate(polyAFeature);
        expect(result1).eq(result2);
    });
});