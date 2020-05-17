import { expect } from 'chai';
import { and, fromJson } from '../src/waoe';

const person = {
    age: 20,
    weight: 30,
    height: 180
};

describe("builder", () => {
    const builder1 = and()
        .eq('age', 20)
        .or()
        .any('weight', [20, 30, 40])
        .done();

    const builder2 = fromJson(builder1.asJson());

    it("builder and json-builder evaluates same", () => {
        const result1 = builder1.evaluate(person);
        const result2 = builder2.evaluate(person);
        expect(result1).eq(result2);
    });
    it("builder and json-builder same json", () => {
        const result1 = JSON.stringify(builder1.asJson());
        const result2 = JSON.stringify(builder2.asJson());
        expect(result1).eq(result2);
    });
    it("builder and clone evaluates same", () => {
        const result1 = JSON.stringify(builder1.asJson());
        const result2 = JSON.stringify(builder1.clone().asJson());
        expect(result1).eq(result2);
    });
    it("addBuilder should evaluate new builder", () => {
        const builder3 = and()
            .eq('height', person.height)
            .done();
        
        const result = builder3.addBuilder(builder1).done().evaluate(person);
        expect(result).true;
    });
});