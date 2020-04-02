import { expect } from 'chai';
import { Builder } from '../src/waoe';
import { Feature } from 'ol';
import Polygon from 'ol/geom/Polygon';

const a = new Feature({
    age: 20,
    geometry: new Polygon([
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
        ]
    ])
});
const b = new Feature({
    age: 10,
    geometry: new Polygon([
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
        ]
    ])
});

describe("ol", () => {
    it("should intersect", () => {
        const result = Builder.and()
            .equals('age', 20)
            .intersects(b)
            .done()
            .evaluate(a);

        expect(result).true;
    });
});