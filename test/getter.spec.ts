import { expect } from 'chai';
import { Builder } from '../src/main';

const score = {
    discus: 43,
    javelin: 77,
    hammer: 88
};

describe("getters", () => {
    it("should call object and comparison functions to resolve values", () => {
        const result = Builder.create()
            .gt('mean', () => Math.min(...Object.values(score)))
            .done()
            .evaluate(score, (prop) => {
                if (prop == 'mean') {
                    const allScores = Object.values(score);
                    return allScores.reduce((total, score) => total + score, 0) / allScores.length;
                }
                return score[prop];
            });

        expect(result).true;
    });
});