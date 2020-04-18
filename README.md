# Object Evaluator - Openlayers
This is an extension of https://github.com/wootapa/wa-object-evaluator and evaluates objects of type ol/Feature. 

Avoid code bloat when filtering your client features or WFS/WMS requsts. Build your rules and apply them on client features, or output a CQL/XML filter for WFS/WMS requests.

You'll need OpenLayers 6+ installed.

## Methods
On top of the existing library, the following is added.

### Spatial operators
* `intersects(property?, value)` - True if feature.get(property) intersects value. Property is optional and defaults to 'geometry'. Value can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon). Chainable.


### WFS/WMS output methods
* `toOgcCql()` - Outputs as CQL.
* `toOgcXML()` - Outputs as XML.

Don't forget to wrap in  `encodeURI` to avoid encoding issues.

## Objects
Just as operator values it's not required to pass an ol/Feature as the evaluation object. However, if you want to compare anything else than geometries, an ol/Feature is required. That said, object can be an ol Feature/Geometry, wkt, geojson or an array(2=point, 4=extent=polygon).

## An example
So maybe you have a bunch of featuers and Johnny asked you for all wells.
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

const features = [...];
const wells = features.filter(oe.evaluate);
```
