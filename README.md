# Object Evaluator - Openlayers
Building code for webgis applications that needs feature-filtering on both client and server can be a pain. Instead of ending up with scattered javascript mixed with fragile XML/CQL generators, this library attempts to alleviate this by providing a single interface where you define your rules. When done, simply evaluate the features or generate the equivalent CQL/XML for your OGC compliant server.

This library extends https://github.com/wootapa/wa-object-evaluator with spatial operators and is intended to be used with Openlayers 6+.

See [Demo](https://wootapa.github.io/wa-object-evaluator-ol-demo/) with WFS/WMS side by side.

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

## Methods
Below is only the spatial methods. See [base](https://github.com/wootapa/wa-object-evaluator/blob/master/README.md) library for the standard operators available for comparing attributes.

### Statics
* `defaultProjection(projection)` - Sets default projection for all new builders. The projection is assumed to be known by OpenLayers and values are assumed to be transformed. Defaults to [EPSG:3857](http://epsg.io/3857).

### Spatial operators
An operator value = valid geometry. See below for options. 

* `intersects(value)` - True when object intersects value. 
* `disjoint(value)` - True when object do not intersects value.
* `contains(value)` - True when object completely contains value.
* `within(value)` - True when object is completely within value.
* `distanceWithin(value, distance, greatCircle?)` -  True when object is no more than specified distance (in meters) from value. Requires a correct projection. Uses greatCircle by default.
* `distanceBeyond(value, distance, greatCircle?)` -  True when object is more than specified distance (in meters) from value. Requires a correct projection. Uses greatCircle by default.

### Other
* `projection(projection)` - Overrides the default projection for current builder.
* `asOgcCql(opts?)` - Outputs as OGC CQL.
* `asOgcXML(opts?)` - Outputs as OGC XML.

CQL/XML serializers take an optional object:
```javascript
geometryName?, // Serializes operators with a different geometryName. Ex 'the_geom'.
projection?, // Serializes operators with a different projection. Ex 'EPSG:4326'.
decimals? // Rounds geometry decimal precision on serialized operators. Ex, 5.
useProjectionUnitForDistance? // Some backends ignores the unit part of dwithin/beyond filters. This converts meters to the unit of the projection.
```

## What is a geometry?
- ol/Feature (can carry attributes and respects geometryName)
- ol/Geometry
- An object with a valid ol/Geometry (ex ```feature.getProperties()```) (can carry attributes)
- WKT
- GeoJSON (can carry attributes)
- Array(2=point, 4=extent=polygon, 6=linestring, 8+=linestring/polygon)

## Evaluating
When evaluating, make sure you pass a geometry that can carry attributes; or you will not be able to compare attributes using the standard operators. Got it? Great!

## An example
So maybe you have a bunch of features and Günter asked you for all wells.
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
...or output as CQL/XML and pass it to your OGC compliant server.
```javascript
const opts = { geometryName: 'geom', projection: 'EPSG:3006', decimals: 0 }; // <- Optional
const cql = oe.asOgcCql(opts);
const xml = oe.asOgcXml(opts);
```

## Pro ol-tip!
To hide/show features based on the result you can do:
```javascript
const hiddenStyle = new Style();
source.forEachFeature(feature => {
    feature.setStyle(
        oe.evaluate(feature)
            ? null        // visible (use layer style)
            : hiddenStyle // hidden (overrides layer style)
        );
});
```