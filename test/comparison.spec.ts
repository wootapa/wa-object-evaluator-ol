import { expect } from 'chai';
import { Builder } from '../src/waoe';

const person = {
    name: 'Mr Miyagi',
    age: 42
};

describe("equal", () => {
    it("should equal", () => {
        const result = Builder.and()
            .eq('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not equal", () => {
        const result = Builder.and()
            .eq('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("greater", () => {
    it("should be greater", () => {
        const result = Builder.and()
            .gt('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be greater", () => {
        const result = Builder.and()
            .gt('age', person.age)
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should be greater or equal", () => {
        const result = Builder.and()
            .gte('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be greater or equal", () => {
        const result = Builder.and()
            .gte('age', person.age + 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("less", () => {
    it("should be less", () => {
        const result = Builder.and()
            .lt('age', person.age + 1)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be less", () => {
        const result = Builder.and()
            .lt('age', person.age)
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should be less or equal", () => {
        const result = Builder.and()
            .lte('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be less or equal", () => {
        const result = Builder.and()
            .lte('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("like", () => {
    it("should contain word", () => {
        const result = Builder.and()
            .like('name', person.name.slice(3, 6))
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not contain word", () => {
        const result = Builder.and()
            .like('name', person.name.slice(3, 6).toUpperCase())
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should contain word case insensitive", () => {
        const result = Builder.and()
            .ilike('name', person.name.slice(3, 6).toUpperCase())
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should contain words case insensitive and wildcards", () => {
        const result = Builder.and()
            .ilike('name', `mr*mi*gi*`)
            .done()
            .evaluate(person);

        expect(result).true;
    });
});