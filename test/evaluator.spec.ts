import { expect } from 'chai';
import { and, fromJson } from '../src/waoe';

const person = {
    age: 20,
    weight: 30,
    height: 180
};

describe('evaluator', () => {
    const evaluator1 = and()
        .eq('age', 20)
        .or()
        .any('weight', [20, 30, 40])
        .done();

    const evaluator2 = fromJson(evaluator1.asJson());

    it('evaluator and json-evaluator evaluates same', () => {
        const result1 = evaluator1.evaluate(person);
        const result2 = evaluator2.evaluate(person);
        expect(result1)
            .eq(result2);
    });
    it('evaluator and json-evaluator same json', () => {
        const result1 = JSON.stringify(evaluator1.asJson());
        const result2 = JSON.stringify(evaluator2.asJson());
        expect(result1)
            .eq(result2);
    });
    it('evaluator and clone evaluator same', () => {
        const result1 = JSON.stringify(evaluator1.asJson());
        const result2 = JSON.stringify(evaluator1.clone()
            .asJson());
        expect(result1)
            .eq(result2);
    });
    it('addEvaluator should evaluate new evaluator', () => {
        const evaluator3 = and()
            .eq('height', person.height)
            .done();

        const result = evaluator3.addEvaluator(evaluator1)
            .done()
            .evaluate(person);
        expect(result).true;
    });
});
