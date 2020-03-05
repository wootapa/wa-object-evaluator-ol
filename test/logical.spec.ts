import { expect } from 'chai';
import { Builder } from '../src/main';

const person = {
    fname: 'Andreas',
    lname: 'Petersson',
    address: {
        street: 151,
        town: 'Kristianstad'
    }
};

describe("and", () => {
    it("should equal fname and lname", () => {
        const result = Builder.create()
            .eq('fname', person.fname)
            .eq('lname', person.lname)
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should equal fname but not lname", () => {
        const result = Builder.create()
            .eq('fname', person.fname)
            .eq('lname', 'Miyagi')
            .done()
            .evaluate(person);

        expect(result).false;
    });
});

describe("or", () => {
    it("should equal fname or lname", () => {
        const result = Builder.create()
            .or()
            .eq('fname', person.fname)
            .eq('lname', 'Miyagi')
            .done()
            .evaluate(person);

        expect(result).true;
    });
    it("should equal fname but not lname but will short-circuit", () => {
        const result = Builder.create()
            .or()
            .eq('fname', person.fname)
            .eq('idontexistandwontbeevaluated', 'ok')
            .done()
            .evaluate(person);

        expect(result).true;
    });
});

describe("not", () => {
    it("should not equal fname", () => {
        const result = Builder.create()
            .not()
            .eq('fname', 'Doogie')
            .done()
            .evaluate(person);

        expect(result).true;
    });
});

describe("combinations", () => {
    it("should equal fname and any street but not town", () => {
        const result = Builder.create()
            .eq('fname', person.fname)
            //.any('address.street', [123,151,456])
            .or()
            .eq('address.street', 123)
            .eq('address.street', person.address.street)
            .eq('address.street', 456).up()
            .not()
            .eq('address.town', 'Vinslöv')
            .done()
            .evaluate(person);

        expect(result).true;
    });
});