# Object Evaluator - Openlayers
This is an extension of https://github.com/wootapa/wa-object-evaluator and evaluates objects of type ol/Feature. 

Why? When building a webclient for GIS it's hard not to bloat code with logic to filter client features, WFS or WMS requests. Perhaps you render WFS when zoomed in and WMS when zoomed out? On top of that, you might have a form for attribute filtering and the map for spatial filtering? In a simple way, how do you combine and apply them? This is not a silver bullet; nor will it ever try to implement all spatial operators, but gives you a uniform way of building conditions and applying them regardless if it's on client features or as a CQL/XML filter on WFS/WMS requests.

You'll need OpenLayers 6+ installed.

## Methods
On top of the existing library, the following is added.

### Spatial operators
* `intersects(property?, value)` - True if object.get(property) intersects value. Property is optional and defaults to 'geometry'. Value can be an ol Feature/Geometry, geojson, wkt, geojson or an array(2=point, 4=extent=polygon). Chainable.


### WFS/WMS output methods
* `toOgcCql()` - Outputs as CQL.
* `toOgcXML()` - Outputs as XML.

Don't forget to wrap in  `encodeURI` to avoid encoding issues.

## Objects
Just as operator values it's not required to pass an ol/Feature as the evaluation object. However, if you want to compare anything else than geometries, an ol/Feature is required. That said, object can be an ol Feature/Geometry, geojson, wkt, geojson or an array(2=point, 4=extent=polygon).

## An example
So maybe you have a bunch of points and Johnny asked you for all wells.
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
