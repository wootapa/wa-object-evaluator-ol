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

### Statics
* `defaultProjection(projection)` - Sets default projection for all new builders. The projection is assumed to be known by OpenLayers and values are assumed to be transformed. Defaults to [EPSG:3857](http://epsg.io/3857).

### Spatial operators
Operator values can be an ol Feature/Geometry, WKT, GeoJSON or an array(2=point, 4=extent=polygon). 

* `intersects(value)` - True when object intersects value. 
* `disjoint(value)` - True when object do not intersects value (inverse of intersects).
* `contains(value)` - True when object completely contains value.
* `within(value)` - True when object is completely within value (inverse of contains).
* `distanceWithin(value, distance)` -  True when object is no more than specified distance (in meters) from value. Requires a correct projection.
* `distanceBeyond(value, distance)` -  True when object is more than specified distance (in meters) from value (inverse of dwithin). Requires a correct projection.

### Other
* `projection(projection)` - Overrides the default projection for current builder.
* `asOgcCql()` - Outputs operators as OGC CQL.
* `asOgcXML()` - Outputs operators as OGC XML. You might want to wrap output in `encodeURI` to avoid encoding issues.

OGC CQL/XML outputs the geometryname as `geometry`. To control it, use an ol/Feature as value with a [geometryName](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#setGeometryName).


## Evaluating objects
Just as operator values, it's not strictly required to pass an ol/Feature as the evaluation object; but you'll need it if you also want to compare attributes with the standard operators. That said, object can be an ol Feature/Geometry, WKT, GeoJSON or an array(2=point, 4=extent=polygon).

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
oe.intersects([13.8517, 55.9646, 14.3049, 56.1017]).done() // <- You have options what you pass here.
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

## Pro ol-tip!
To hide/show features based on the result you can do:
```javascript
source.forEachFeature(feature => {
    feature.setStyle(
        oe.evaluate(feature)
            ? null // visible (use layer style)
            : new Style() // hidden (overrides layer style)
        );
});
```