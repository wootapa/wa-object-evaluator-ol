# Object Evaluator - Openlayers
This builds on top of https://github.com/wootapa/wa-object-evaluator with spatial operators for Openlayers and OGC query output.

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
* `intersects(value)` - True when object intersects value. Value can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon). Chainable.
* ...more to come

### Ogc query/filter methods
* `asOgcCql()` - Outputs as CQL.
* `asOgcXML()` - Outputs as XML.

By default the name of the geometry is `geometry`. Control it by passing an ol/Feature with a [geometryName](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#setGeometryName). Also, dont forget to wrap in  `encodeURI` to avoid encoding issues.

## Objects
Just as operator values, it's not strictly required to pass an ol/Feature as the evaluation object; but you'll need it if you also want to compare attributes with the standard operators. That said, object can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon).

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

