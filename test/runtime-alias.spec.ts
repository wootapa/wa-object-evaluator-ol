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
        const builder1 = and().operator('even', 'name')
            .done();
        const builder2 = fromJson(JSON.stringify(builder1.asJson()));

        expect(builder1.evaluate(person))
            .eq(builder2.evaluate(person));
    });

    it('should be equivalent', () => {
        const builder1 = JSON.stringify(and()
            .eq('name', 'Foo')
            .gte('age', 20)
            .done()
            .asJson());
        const builder2 = JSON.stringify(and()
            .op('eq', 'name', 'Foo')
            .op('gte', 'age', 20)
            .done()
            .asJson());

        expect(builder1)
            .eq(builder2);
    });
});
