# Object Evaluator - Openlayers
This is an extension of https://github.com/wootapa/wa-object-evaluator and evaluates objects of type ol/Feature.

[Demo](https://i5u5c.csb.app/)

## Installation

New browsers and bundlers (es):
```shell
$ npm install --save @wootapa/object-evaluator-ol
```

Old browsers (umd):
```javascript
<script src="https://unpkg.com/@wootapa/object-evaluator-ol"></script>
// waoe.ol.and() ...
```

## Dependencies
OpenLayers 6+

## Methods
On top of the [existing](https://github.com/wootapa/wa-object-evaluator/blob/master/README.md) library, the following is added.

### Spatial operators
* `intersects(property?, value)` - True if feature.get(property) intersects value. Property is optional and defaults to 'geometry'. Value can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon). Chainable.


### Ogc filter methods
* `asOgcCql()` - Outputs as CQL.
* `asOgcXML()` - Outputs as XML.

Don't forget to wrap in  `encodeURI` to avoid encoding issues.

## Objects
Just as operator values, it's not required to pass an ol/Feature as the evaluation object. However, if you want to compare anything else than geometries, an ol/Feature is required. That said, object can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon).

## An example
So maybe you have a bunch of features and Johnny asked you for all wells.
```javascript
const oe = and().eq('type', 'well').done();
```
You figure the depth must at least 32 meters
```javascript
oe.gte('depth', 32).done()
```
Franz says it must be drilled before 1998 
```javascript
oe.lte('drilled', new Date(1998,0)).done()
```
Werner gives you the extent of the wells
```javascript
oe.intersects([13.8517, 55.9646, 14.3049, 56.1017]).done() // <- You have options here. See Objects above.
```
In the end, this is the result.
```javascript
const oe = and()
    .eq('type', 'well')
    .gte('depth', 32)
    .lte('drilled', new Date(1998,0))
    .intersects([13.8517, 55.9646, 14.3049, 56.1017])
    .done();
```
Apply on client features...
```javascript
const features = [...];
const wells = features.filter(oe.evaluate);
```
...or output as CQL/XML.
```javascript
const cql = oe.asOgcCql();
const xml = oe.asOgcXml();
```

