import { expect } from 'chai';
import { and } from '../src/waoe';

describe("getters", () => {
    it("should call object and comparison functions to resolve values", () => {
        const score = {
            discus: 43,
            javelin: 77,
            hammer: 88
        };

        const result = and()
            // mean should be greater than lowest score
            .gt('mean', () => Math.min(...Object.values(score)))
            .done()
            .evaluate((prop) => {
                // score contains no mean property, so we calculate it
                if (prop == 'mean') {
                    const allScores = Object.values(score);
                    return allScores.reduce((total, score) => total + score, 0) / allScores.length;
                }
                return score[prop];
            });

        expect(result).true;
    });

    it("should should resolve nested properties", () => {
        const person = {
            name: {
                first: 'Nariyoshi',
                last: 'Miyagi'
            },
            age: () => 60
        };
        
        const result = and()
            .gt('age', () => 50)
            .eq('name.first', person.name.first)
            .done()
            .evaluate(person);

        expect(result).true;
    });
});