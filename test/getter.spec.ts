import { expect } from 'chai';
import { Builder } from '../src/main';

const score = {
    discus: 43,
    javelin: 77,
    hammer: 88
};

describe("getters", () => {
    it("should call object and comparison functions to resolve values", () => {
        const result = Builder.and()
            // mean should be greater than lowest score
            .gt('mean', () => Math.min(...Object.values(score)))
            .done()
            .evaluate(score, (prop) => {
                // score contains no mean property, so we calculate it
                if (prop == 'mean') {
                    const allScores = Object.values(score);
                    return allScores.reduce((total, score) => total + score, 0) / allScores.length;
                }
                return score[prop];
            });

        expect(result).true;
    });
});