import { expect } from 'chai';
import { Builder } from '../src/main';

const person = {
    name: 'Mr Miyagi',
    age: 42
};

describe("equal", () => {
    it("should equal", () => {
        const result = Builder.create()
            .eq('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not equal", () => {
        const result = Builder.create()
            .eq('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("greater", () => {
    it("should be greater", () => {
        const result = Builder.create()
            .gt('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be greater", () => {
        const result = Builder.create()
            .gt('age', person.age)
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should be greater or equal", () => {
        const result = Builder.create()
            .gte('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be greater or equal", () => {
        const result = Builder.create()
            .gte('age', person.age + 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("less", () => {
    it("should be less", () => {
        const result = Builder.create()
            .lt('age', person.age + 1)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be less", () => {
        const result = Builder.create()
            .lt('age', person.age)
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should be less or equal", () => {
        const result = Builder.create()
            .lte('age', person.age)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not be less or equal", () => {
        const result = Builder.create()
            .lte('age', person.age - 1)
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("like", () => {
    it("should contain word", () => {
        const result = Builder.create()
            .like('name', person.name.slice(3, 6))
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should not contain word", () => {
        const result = Builder.create()
            .like('name', person.name.slice(3, 6).toUpperCase())
            .done()
            .evaluate(person);

        expect(result).false;
    });
    it("should contain word case insensitive", () => {
        const result = Builder.create()
            .ilike('name', person.name.slice(3, 6).toUpperCase())
            .done()
            .evaluate(person);

        expect(result).true;
    });
});