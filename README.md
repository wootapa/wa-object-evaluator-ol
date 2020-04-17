# Object Evaluator
Tests your objects for true/false with logical and comparison operators using a builder pattern.

Why?
Because common if/else blocks is not very portable, and passing around a common set of rules as a single object just makes things easier at times. Since it's also serializable you could stuff it in localstorage, database or a webworker and have the same rules apply when you parse it back.

## Methods

### Constructs
* `and()` - Creates new builder with a root 'and' logical operator. See logical below. Chainable.
* `or()` - Creates new builder with a root 'or' logical operator. See logical below. Chainable.
* `not()` - Creates new builder with a root 'not' logical operator. See logical below. Chainable.
* `fromJson(json)` - Creates new builder from a serialized builder. Chainable.

### Logical operators
* `and()` - True if all child operators are true. Chainable.
* `or()` - True if one of the child operators are true. Chainable.
* `not()` - True if all child operators are false. Chainable.

### Comparison operators
* `equals(property, value)` - True if object[property] equals to value. Chainable.
* `isNull(property)` - True if object[property] is null or undefined. Chainable.
* `greaterThan(property, value)` - True if object[property] is greater than value. Chainable.
* `gt(property, value)` - same as above. Chainable.
* `greaterThanEquals(property, value)` - True if object[property] is greater or equal to value. Chainable.
* `gte(property, value)` - same as above. Chainable.
* `lessThan(property, value)` - True if object[property] is less than value. Chainable.
* `lt(property, value)` - same as above. Chainable.
* `lessThanEquals(property, value)` - True if object[property] is less or equal to value. Chainable.
* `lte(property, value)` - same as above. Chainable.
* `like(property, value)` - True if object[property] is like value (case sensitive). Use * as wildcard. Chainable.
* `ilike(property, value)` - True if object[property] is like value (case insensitive). Use * as wildcard. Chainable.
* `any(property, values[])` - True if object[property] equals to any of values. Chainable.

### Evaluation
* `evaluate(object)` - Evaluates the object to true/false. Dont forget to call `done()` before if you want to evaluate all operators.

### Navigation
* `up()` - Moves up to parent logical. Chainable.
* `done()` - Moves to root logical. Chainable.

### Other
* `toJson()` - Serializes current level to json.
* `clone()` - Returns a deeply cloned builder.
* `clear()` - Clears all operators at current level and below. Chainable.
* `addBuilder(builder)` - Adds another builder at current level. Chainable.
* `getKeysAndValues()` - Returns keys and values for all comparison operators. This can be useful when restoring state to something (forms etc). If the same key has been used multiple times an array of values are returned.


## An example
So maybe you have a bunch of movies and you want some good comedies.
```javascript
const oe = and().eq('category', 'comedy').gte('ranking', 6).done();
```
However, you just realized you have issues with some actors.
```javascript
oe.not().any('actor', ['Jim Carrey', 'Ben Stiller']).done();
```
Its better, but you heard there will be kids around.
```javascript
oe.eq('rating', 'G').done();
```
Also, you know your buddy likes the old movies better.
```javascript
oe.gt('year', new Date(1990,0)).lt('year', new Date(2000,0)).done();
```

In the end, this is the result.
```javascript
const oe = and()  // <- Will only return true if all children do
    .eq('category', 'comedy') // <- category must be comedy
    .gte('ranking', 6) // <- ranking must be greater than 6
    .not() // <- Will only return true if children are false
        .any('actor', ['Jim Carrey', 'Ben Stiller']) // <- actors must not be these
        .up() // <- Moves back to and operator
    .eq('rating', 'G') // <- rating must be G
    .gt('year', new Date(1990,0)) // <- year must be greater than 1990
    .lt('year', new Date(2000,0)) // <- year must be less than 2000
    .done() // <- moves to the root 'and' operator (which is unnecessary here but good practise)

const movies = [...];
const comedies = movies.filter(oe.evaluate);
```

## Evaluating objects
The evaluating object can be a plain dict, have nested properties...or be a function.
So, given the following:
```javascript
const person = {
    name: {
        first: 'Nariyoshi',
        last: 'Miyagi'
    },
    age: () => 60
};
```
Nested properties will resolve.
```javascript
and().eq('name.first', 'Nariyoshi').done().evaluate(person); // => true
```

Property functions also resolves.
```javascript
and().gte('age', 50).done().evaluate(person); // => true
```

You can also pass a function and resolve values anyway you want. Property is passed as argument.
```javascript
and().eq('name.first', 'Nariyoshi').done().evaluate(property => {
    if (property === 'name.first') {
        return person.name.first;
    }
}); // => true
```
Which then means you can have nonexistent properties if you want.
```javascript
and().eq('isKarateMan', true).done().evaluate(property => {
    if (property === 'isKarateMan') {
        return person.name.first === 'Nariyoshi' && person.name.last === 'Miyagi';
    }
}); // => true
```