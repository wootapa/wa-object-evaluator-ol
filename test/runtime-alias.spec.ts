import { expect } from 'chai';
import { and, define, fromJson } from '../src/waoe';

const person = {
    age: 42
};

define('even', (v: number) => v % 2 === 0);

describe('aliased operators', () => {
    it('should be even', () => {
        const result = and()
            .operator('even', 'age')
            .done()
            .evaluate(person);

        expect(result).true;
    });

    it('should survive serialization', () => {
        const evaluator1 = and().operator('even', 'name')
            .done();
        const evaluator2 = fromJson(JSON.stringify(evaluator1.asJson()));

        expect(evaluator1.evaluate(person))
            .eq(evaluator2.evaluate(person));
    });

    it('should be equivalent', () => {
        const evaluator1 = JSON.stringify(and()
            .eq('name', 'Foo')
            .gte('age', 20)
            .done()
            .asJson());
        const evaluator2 = JSON.stringify(and()
            .op('eq', 'name', 'Foo')
            .op('gte', 'age', 20)
            .done()
            .asJson());

        expect(evaluator1)
            .eq(evaluator2);
    });
});
