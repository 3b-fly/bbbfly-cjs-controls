/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage map
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.map = {};
/** @ignore */
bbbfly.map.layer = {
  mapbox_tile: {},
  mapbox_style: {}
};

/** @ignore */
bbbfly.map.map._onCreated = function(map){
  map.CreateMap();
  return true;
};

/** @ignore */
bbbfly.map.map._onUpdated = function(){
  var map = this.GetMap();
  if(map && Function.isFunction(map.invalidateSize)){
    map.invalidateSize();
  }
};

/** @ignore */
bbbfly.map.map._dispose = function(){
  this.DestroyMap();
  this.Dispose.callParent();
};

/** @ignore */
bbbfly.map.map._getMap = function(){
  return this._Map;
};

/** @ignore */
bbbfly.map.map._createMap = function(){
  if(this.GetMap()){return true;}

  //create map
  var options = {
    center: [0,0],
	  zoom: 0,

    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true
  };

  if(Object.isObject(this.MaxBounds) || Array.isArray(this.MaxBounds)){
    options.maxBounds = this.MaxBounds;
  }
  if(Number.isInteger(this.MinZoom)){
    options.minZoom = this.MinZoom;
    options.zoom = this.MinZoom;
  }
  if(Number.isInteger(this.MaxZoom)){
    options.maxZoom = this.MaxZoom;
  }
  if(String.isString(this.Crs)){
    options.crs = L.CRS[this.Crs];
  }

  var map = this.DoCreateMap(options);
  if(!map){return false;}

  //add layers
  this.AddLayers(this.Layers);

  //propagate initial state
  if(map.getZoom && this.OnZoomChanged){
    this.OnZoomChanged(map.getZoom());
  }
  return true;
};

/** @ignore */
bbbfly.map.map._doCreateMap = function(options){
  if(this.GetMap() || !this.Controls.Map){return null;}
  var mapHolder = this.Controls.Map.GetControlsHolder();

  var map = L.map(mapHolder.ID,options);
  if(!map){return null;}

  map.Owner = this;
  map.on('zoomend',bbbfly.map.map._onMapZoomEnd);

  map.on('layeradd',bbbfly.map.map._onMapLayersChanged);
  map.on('layerremove',bbbfly.map.map._onMapLayersChanged);

  this._Map = map;
  return map;
};

/** @ignore */
bbbfly.map.map._destroyMap = function(){
  var map = this.GetMap();
  if(!map){return false;}

  map.remove();
  return true;
};

/** @ignore */
bbbfly.map.map._setMaxBounds = function(bounds){
  if(Array.isArray(bounds)){bounds = new L.LatLngBounds(bounds);}

  if(!(bounds instanceof L.LatLngBounds)){return false;}
  if(!bounds.isValid()){return false;}

  this.MaxBounds = bounds;

  var map = this.GetMap();
  if(map){map.setMaxBounds(bounds);}
  return true;
};

/** @ignore */
bbbfly.map.map._setBoundsPadding = function(padding){
  if(padding === null){
    this.BoundsPadding = null;
  }
  else if(Object.isObject(padding)){
    this.BoundsPadding = padding;
  }
  else if(Number.isInteger(padding)){
    this.BoundsPadding = {
      T:padding,R:padding,B:padding,L:padding
    };
  }
  else{
    return false;
  }
  return true;
};

/** @ignore */
bbbfly.map.map._getBoundsPadding = function(padding){
  if(!Object.isObject(padding)){padding = this.BoundsPadding;}
  if(!Object.isObject(padding)){return { T:0,R:0,B:0,L:0 };}

  return {
    T: (Number.isInteger(padding.T)) ? padding.T : 0,
    R: (Number.isInteger(padding.R)) ? padding.R : 0,
    B: (Number.isInteger(padding.B)) ? padding.B : 0,
    L: (Number.isInteger(padding.L)) ? padding.L : 0
  };
};

/** @ignore */
bbbfly.map.map._fitBounds = function(bounds,padding){
  var map = this.GetMap();
  if(!map){return false;}

  if(!bounds && this.MaxBounds){bounds = this.MaxBounds;}
  if(!(bounds instanceof L.LatLngBounds)){return false;}
  if(!bounds.isValid()){return false;}

  padding = this.GetBoundsPadding(padding);

  map.fitBounds(bounds,{
    paddingTopLeft: new L.Point(padding.L,padding.T),
    paddingBottomRight: new L.Point(padding.R,padding.B),
    animate: !!this.Animate
  });

  return true;
};

/** @ignore */
bbbfly.map.map._fitCoords = function(coords,padding){
  var map = this.GetMap();
  if(!map){return false;}

  if(!(coords instanceof L.LatLng)){return false;}

  padding = this.GetBoundsPadding(padding);

  map.panInside(coords,{
    paddingTopLeft: new L.Point(padding.L,padding.T),
    paddingBottomRight: new L.Point(padding.R,padding.B),
    animate: !!this.Animate
  });

  return true;
};

/** @ignore */
bbbfly.map.map._setMinZoom = function(zoom){
  if(Number.isInteger(zoom)){
    this.MinZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMinZoom(zoom);}
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._getMinZoom = function(){
  var map = this.GetMap();
  return (map) ? map.getMinZoom() : null;
};

/** @ignore */
bbbfly.map.map._setMaxZoom = function(zoom){
  if(Number.isInteger(zoom)){
    this.MaxZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMaxZoom(zoom);}
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._getMaxZoom = function(){
  var map = this.GetMap();
  return (map) ? map.getMaxZoom() : null;
};

/** @ignore */
bbbfly.map.map._enableAnimation = function(enable){
  if(enable === this.Animate){return false;}
  this.Animate = !!enable;
  return true;
};

/** @ignore */
bbbfly.map.map._setView = function(coords,zoom){
  var map = this.GetMap();
  if(map){
    if((typeof coords === 'undefined') || (coords === null)){
      coords = map.getCenter();
    }
    if((typeof zoom === 'undefined') || (zoom === null)){
      zoom = map.getZoom();
    }

    map.setView(coords,zoom,{animate: !!this.Animate});
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._setZoom = function(zoom){
  return this.SetView(null,zoom);
};

/** @ignore */
bbbfly.map.map._getZoom = function(){
  var map = this.GetMap();
  if(map){return map.getZoom();}
  return null;
};

/** @ignore */
bbbfly.map.map._zoomIn = function(zoomBy){
  var map = this.GetMap();
  if(map){
    map.zoomIn(zoomBy,{animate: !!this.Animate});
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._zoomOut = function(zoomBy){
  var map = this.GetMap();
  if(map){
    map.zoomOut(zoomBy,{animate: !!this.Animate});
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._onMapZoomEnd = function(event){
  var map = event.target;
  if(map && map.Owner){

    var mapCtrl = map.Owner;
    if(Function.isFunction(mapCtrl.OnZoomChanged)){
      mapCtrl.OnZoomChanged(map.getZoom());
    }
  }
};

/** @ignore */
bbbfly.map.map._setCenter = function(coords){
  return this.SetView(coords,null);
};

/** @ignore */
bbbfly.map.map._getCenter = function(){
  var map = this.GetMap();
  if(map){return map.getCenter();}
  return null;
};

/** @ignore */
bbbfly.map.map._beginLayersChanges = function(mapCtrl){
  if(++mapCtrl._LayersChanging < 1){mapCtrl._LayersChanging = 1;}
};

/** @ignore */
bbbfly.map.map._endLayersChanges = function(mapCtrl){
  if(--mapCtrl._LayersChanging < 0){mapCtrl._LayersChanging = 0;}
  bbbfly.map.map._layersChanged(mapCtrl);
};

/** @ignore */
bbbfly.map.map._layersChanged = function(mapCtrl){
  if(mapCtrl._LayersChanging > 0){return;}

  if(Function.isFunction(mapCtrl.OnLayersChanged)){
    mapCtrl.OnLayersChanged();
  }
};

/** @ignore */
bbbfly.map.map._layerInterface = function(iname,iface){
  if(!String.isString(iname)){return;}

  var ifc = bbbfly.Map[iname];
  if(!Object.isObject(ifc)){return;}

  if(Object.isObject(iface)){ng_MergeVar(iface,ifc);}
  else{iface = ng_CopyVar(ifc);}

  if(ifc.extends){
    this.LayerInterface(ifc.extends,iface);
  }
  return iface;
};

/** @ignore */
bbbfly.map.map._createLayer = function(def){
  if(!Object.isObject(def)){return null;}

  var map = this.GetMap();
  if(!map){return null;}

  var iface = this.LayerInterface(def.Type);
  if(!Object.isObject(iface)){return null;}

  if(Object.isObject(this.DefaultLayer)){
    ng_MergeVar(def,this.DefaultLayer);
  }

  var opts = {};
  if(Object.isObject(iface.options_map)){
    for(var defProp in iface.options_map){
      var optProp = iface.options_map[defProp];
      var propVal = def[defProp];

      if(typeof propVal !== 'undefined'){
        opts[optProp] = propVal;
      }
    }
  }

  if(Object.isObject(iface.options)){
    ng_MergeVar(opts,iface.options);
  }

  if(Function.isFunction(iface.onCreateOptions)){
    iface.onCreateOptions(opts);
  }

  var mapLayer = null;
  switch(iface.type){
    case 'L.bbbfly.ColorLayer':
      mapLayer = new L.bbbfly.ColorLayer(opts);
    break;
    case 'L.ImageOverlay':
      mapLayer = new L.ImageOverlay(opts.url,opts.bounds,opts);
    break;
    case 'L.TileLayer':
      mapLayer = new L.TileLayer(opts.url,opts);
    break;
    case 'L.TileLayer.wms':
      mapLayer = new L.TileLayer.WMS(opts.url,opts);
    break;
    case 'L.esri.TiledMapLayer':
      mapLayer = new L.esri.TiledMapLayer(opts);
    break;
    case 'L.esri.DynamicMapLayer':
      mapLayer = new L.esri.DynamicMapLayer(opts);
    break;
  }

  if(!mapLayer){return null;}

  return {
    Id: String.isString(def.Id) ? def.Id : '_L_'+(this._LayerId++),
    Display: def.Display ? def.Display : bbbfly.Map.Layer.display.fixed,
    NameRes: def.NameRes ? def.NameRes : null,
    Name: def.Name ? def.Name : null,

    Layer: mapLayer,
    Visible: false
  };
};

/** @ignore */
bbbfly.map.map._getLayers = function(){
  return Object.isObject(this._Layers) ? this._Layers : {};
};

/** @ignore */
bbbfly.map.map._getLayer = function(id){
  if(!String.isString(id)){return null;}

  var layers = this.GetLayers();
  var layer = layers[id];

  return Object.isObject(layer) ? layer : null;
};

/** @ignore */
bbbfly.map.map._addLayers = function(defs){
  if(!Array.isArray(defs)){return false;}

  bbbfly.map.map._beginLayersChanges(this);
  var result = true;

  for(var i in defs){
    if(!this.AddLayer(defs[i])){
      result = false;
    }
  }

  bbbfly.map.map._endLayersChanges(this);
  return result;
};

/** @ignore */
bbbfly.map.map._addLayer = function(def){
  var layer = this.CreateLayer(def);
  if(!layer){return false;}

    this.RemoveLayer(layer.Id);
    this._Layers[layer.Id] = layer;

    switch(layer.Display){
      case bbbfly.Map.Layer.display.fixed:
      case bbbfly.Map.Layer.display.visible:
        this.SetLayerVisible(layer.Id,true);
      break;
    }

    return true;
};

/** @ignore */
bbbfly.map.map._removeLayers = function(ids){
  bbbfly.map.map._beginLayersChanges(this);
  var result = true;

  if(Array.isArray(ids)){
    for(var i in ids){
      if(!this.RemoveLayer(ids[i])){
        result = false;
        break;
      }
    }
  }
  else{
    for(var id in this._Layers){
      if(!this.RemoveLayer(id)){
        result = false;
        break;
      }
    }
  }

  bbbfly.map.map._endLayersChanges(this);
  return result;
};

/** @ignore */
bbbfly.map.map._removeLayer = function(id){
  if(!String.isString(id)){return false;}

  if(this.SetLayerVisible(id,false)){
    delete this._Layers[id];
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._setLayerVisible = function(id,visible){
  var map = this.GetMap();
  if(!map){return false;}

  var layer = this.GetLayer(id);
  if(!layer){return false;}

  var mapLayer = layer.Layer;
  if(!mapLayer){return false;}

  visible = !!visible;
  if(visible === layer.Visible){return true;}

  if(!visible && (layer.Display === bbbfly.Map.Layer.display.fixed)){
    return false;
  }

  if(visible){
    if(Function.isFunction(mapLayer.addTo)){
      layer.Visible = true;
      mapLayer.addTo(map);
      return true;
    }
  }
  else{
    if(Function.isFunction(mapLayer.removeFrom)){
      layer.Visible = false;
      mapLayer.removeFrom(map);
      return true;
    }
  }
  return false;
};

/** @ignore */
bbbfly.map.map._onMapLayersChanged = function(event){
  if(event.target && event.target.Owner){
    bbbfly.map.map._layersChanged(event.target.Owner);
  }
};

/** @ignore */
bbbfly.map.map._getMapLayerName = function(mapLayer){
  if(!(mapLayer instanceof L.Layer)){return null;}

  var layers = this.GetLayers();
  for(var id in layers){
    var layer = layers[id];

    if(Object.isObject(layer) && (layer.Layer === mapLayer)){
      return this.DoGetLayerName(layer);
    }
  }
  return null;
};

/** @ignore */
bbbfly.map.map._getLayerName = function(id){
  var layer = this.GetLayer(id);
  return this.DoGetLayerName(layer);
};

/** @ignore */
bbbfly.map.map._doGetLayerName = function(layer){
  if(!Object.isObject(layer)){return null;}

  if(String.isString(layer.Name)){
    return layer.Name;
  }
  else if(Object.isObject(layer.Name)){
    var text = layer.Name[ngApp.Lang];
    if(String.isString(text)){return text;}
  }
  else if(String.isString(layer.NameRes)){
    return ngTxt(layer.NameRes);
  }

  return null;
};

/** @ignore */
bbbfly.map.map._getAttributions = function(){
  var map = this.GetMap();

  var data = {
    MapCtrl: this,
    Attributions: []
  };

  if(map){
    var callback = bbbfly.map.map._getLayerAttribution;
    map.eachLayer(callback,data);
  }
  return data.Attributions;
};

/** @ignore */
bbbfly.map.map._getLayerAttribution = function(layer){
  if(layer && Function.isFunction(layer.getAttribution)){
    var attributions = [];

    var attrs = layer.getAttribution();
    if(String.isString(attrs)){attrs = [attrs];}

    if(Array.isArray(attrs)){
      for(var i in attrs){
        var attr = attrs[i];
        if(String.isString(attr) && (attr !== '')){
          attributions.push(attr);
        }
      }
    }

    if(attributions.length > 0){
      this.Attributions.push({
        Name: this.MapCtrl.GetMapLayerName(layer),
        Attributions: attributions
      });
    }
  }
};

/** @ignore */
bbbfly.map.layer.mapbox_tile._oncreateOptions = function(options){
  if(!String.isString(options.url)){
    var r = (options.detectRetina) ? '{r}' : '';

    options.url = 'https://api.mapbox.com/v4/'
      +'{mapId}/{z}/{x}/{y}'+r+'.{format}'
      +'?access_token={accessToken}';
  }
};

/** @ignore */
bbbfly.map.layer.mapbox_style._oncreateOptions = function(options){
  if(!String.isString(options.url)){
    var parts = this.pattern.exec(options.styleUrl);

    if(Array.isArray(parts) && (parts.length === 3)){
      var r = (options.detectRetina) ? '{r}' : '';

      options.styleOwner = parts[1];
      options.styleId = parts[2];
      delete(options.styleUrl);

      options.url = 'https://api.mapbox.com/styles/v1/'
        +'{styleOwner}/{styleId}/tiles/{z}/{x}/{y}'+r
        +'?access_token={accessToken}';
    }
  }
  delete(options.styleUrl);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @description
 *   Map control providing easy way to handle Leaflet map.
 *
 * @inpackage map
 *
 * @param {bbbfly.Map.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.Map.crs} [Crs=PseudoMercator] - Default map coordinate reference system
 * @property {padding|px} [BoundsPadding=null] - Use this padding to fit bounds or coords
 *
 * @property {mapBounds} [MaxBounds=null] - Keep map within these bounds
 * @property {number} [MinZoom=null] - Map minimal zoom level
 * @property {number} [MaxZoom=null] - Map maximal zoom level
 * @property {number} [Animate=true] - If map animation is allowed
 *
 * @property {bbbfly.Map.Layer[]} [Layers=[]] - Map layers definition
 * @property {bbbfly.Map.Layer} DefaultLayer - Overrides layer type values
 *
 * @example
 * var appForm;
 * function ngMain(){
 *
 *   appForm = new ngControls({
 *     Map: {
 *       Type: 'bbbfly.Map',
 *       L:0,T:0,R:0,B:0,
 *       Data: {
 *         Layers: [
 *           ...
 *         ]
 *       }
 *     }
 *   });
 *
 *   appForm.Update();
 * }
 */
bbbfly.Map = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      Crs: bbbfly.Map.crs.PseudoMercator,
      BoundsPadding: null,

      MaxBounds: null,
      MinZoom: null,
      MaxZoom: null,
      Animate: true,

      Layers: [],
      DefaultLayer: null,

      /** @private */
      _Map: null,
      /** @private */
      _Layers: {},
      /** @private */
      _LayerId: 1,
      /** @private */
      _LayersChanging: 0
    },
    OnCreated: bbbfly.map.map._onCreated,
    Controls: {
      Map: {
        Type: 'bbbfly.Panel',
        L:0,R:0,T:0,B:0,
        style: {zIndex: 1}
      }
    },
    Events: {
      /** @private */
      OnUpdated: bbbfly.map.map._onUpdated,

      /**
       * @event
       * @name OnZoomChanged
       * @memberof bbbfly.Map#
       *
       * @param {number} zoom - Actual zoom level
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetZoom|SetZoom()}
       * @see {@link bbbfly.Map#GetZoom|GetZoom()}
       * @see {@link bbbfly.Map#ZoomIn|ZoomIn()}
       * @see {@link bbbfly.Map#ZoomOut|ZoomOut()}
       */
      OnZoomChanged: null,
      /**
       * @event
       * @name OnLayersChanged
       * @memberof bbbfly.Map#
       *
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       */
      OnLayersChanged: null
    },
    Methods: {
      /** @private */
      Dispose: bbbfly.map.map._dispose,
      /** @private */
      LayerInterface: bbbfly.map.map._layerInterface,

      /**
       * @function
       * @name GetMap
       * @memberof bbbfly.Map#
       *
       * @description Get Leaflet map.
       *
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       *
       * @see {@link bbbfly.Map#CreateMap|CreateMap()}
       * @see {@link bbbfly.Map#DoCreateMap|DoCreateMap()}
       * @see {@link bbbfly.Map#DestroyMap|DestroyMap()}
       */
      GetMap: bbbfly.map.map._getMap,
      /**
       * @function
       * @name CreateMap
       * @memberof bbbfly.Map#
       *
       * @description Create Leaflet map.
       *
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       *
       * @see {@link bbbfly.Map#GetMap|GetMap()}
       * @see {@link bbbfly.Map#DoCreateMap|DoCreateMap()}
       * @see {@link bbbfly.Map#DestroyMap|DestroyMap()}
       */
      CreateMap: bbbfly.map.map._createMap,
      /**
       * @function
       * @name DoCreateMap
       * @memberof bbbfly.Map#
       *
       * @description Do reate Leaflet map from its options.
       *
       * @param {object} options
       *   {@link https://leafletjs.com/reference-1.4.0.html#map-option/|Leaflet Map options}
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       *
       * @see {@link bbbfly.Map#GetMap|GetMap()}
       * @see {@link bbbfly.Map#CreateMap|CreateMap()}
       * @see {@link bbbfly.Map#DestroyMap|DestroyMap()}
       */
      DoCreateMap: bbbfly.map.map._doCreateMap,
      /**
       * @function
       * @name DestroyMap
       * @memberof bbbfly.Map#
       *
       * @description Destroy Leaflet map.
       *
       * @return {boolean} If map was destroyed
       *
       * @see {@link bbbfly.Map#GetMap|GetMap()}
       * @see {@link bbbfly.Map#CreateMap|CreateMap()}
       * @see {@link bbbfly.Map#DoCreateMap|DoCreateMap()}
       */
      DestroyMap: bbbfly.map.map._destroyMap,

      /**
       * @function
       * @name SetMaxBounds
       * @memberof bbbfly.Map#
       *
       * @description Set {@link bbbfly.Map#MaxBounds|maximal map bounds}.
       *
       * @param {mapBounds|array} bounds - Maximal bounds
       * @return {boolean} If bounds were set
       *
       * @see {@link bbbfly.Map#FitBounds|FitBounds()}
       */
      SetMaxBounds: bbbfly.map.map._setMaxBounds,
      /**
       * @function
       * @name SetBoundsPadding
       * @memberof bbbfly.Map#
       *
       * @description Set {@link bbbfly.Map#BoundsPadding|map bounds padding}.
       *
       * @param {padding|px} padding - Bounds padding
       * @return {boolean} If padding was set
       *
       * @see {@link bbbfly.Map#GetBoundsPadding|GetBoundsPadding()}
       * @see {@link bbbfly.Map#FitBounds|FitBounds()}
       */
      SetBoundsPadding: bbbfly.map.map._setBoundsPadding,
      /**
       * @function
       * @name SetBoundsPadding
       * @memberof bbbfly.Map#
       *
       * @description Get {@link bbbfly.Map#BoundsPadding|map bounds padding}.
       *
       * @param {padding} [padding=undefined] - Bounds padding
       * @return {padding} Bounds padding
       *
       * @see {@link bbbfly.Map#SetBoundsPadding|SetBoundsPadding()}
       * @see {@link bbbfly.Map#FitBounds|FitBounds()}
       */
      GetBoundsPadding: bbbfly.map.map._getBoundsPadding,
      /**
       * @function
       * @name FitBounds
       * @memberof bbbfly.Map#
       *
       * @description
       *   Pan and zoom map
       *   to fit certain {@link bbbfly.Map#MaxBounds|bounds}
       *   with {@link bbbfly.Map#BoundsPadding|padding}.
       *
       * @param {mapBounds} bounds - Bounds to fit
       * @param {padding} padding - Padding between map edge and bounds
       * @return {boolean} If fit was successful
       *
       * @see {@link bbbfly.Map#SetMaxBounds|SetMaxBounds()}
       * @see {@link bbbfly.Map#FitCoords|FitCoords()}
       */
      FitBounds: bbbfly.map.map._fitBounds,
      /**
       * @function
       * @name FitCoords
       * @memberof bbbfly.Map#
       *
       * @description
       *   Pan and zoom map
       *   to fit certain {@link bbbfly.Map#MaxBounds|bounds}
       *   with {@link bbbfly.Map#BoundsPadding|padding}.
       *
       * @param {mapPoint} coords - Coordinates to fit
       * @param {padding} padding - Padding between map edge and coords
       * @return {boolean} If fit was successful
       *
       * @see {@link bbbfly.Map#FitBounds|FitBounds()}
       */
      FitCoords: bbbfly.map.map._fitCoords,
      /**
       * @function
       * @name SetMinZoom
       * @memberof bbbfly.Map#
       *
       * @description
       *   Set {@link bbbfly.Map#MinZoom|minimal map zoom level}.
       *
       * @param {number} zoom - Zoom level
       * @return {boolean} If zoom was set
       *
       * @see {@link bbbfly.Map#GetMinZoom|GetMinZoom()}
       * @see {@link bbbfly.Map#GetMaxZoom|GetMaxZoom()}
       * @see {@link bbbfly.Map#SetMaxZoom|SetMaxZoom()}
       */
      SetMinZoom: bbbfly.map.map._setMinZoom,
      /**
       * @function
       * @name GetMinZoom
       * @memberof bbbfly.Map#
       *
       * @description Get map minimal zoom level.
       *
       * @return {number|null} zoom - Zoom level
       *
       * @see {@link bbbfly.Map#SetMinZoom|SetMinZoom()}
       * @see {@link bbbfly.Map#SetMaxZoom|SetMaxZoom()}
       * @see {@link bbbfly.Map#GetMaxZoom|GetMaxZoom()}
       */
      GetMinZoom: bbbfly.map.map._getMinZoom,
      /**
       * @function
       * @name SetMaxZoom
       * @memberof bbbfly.Map#
       *
       * @description
       *   Set {@link bbbfly.Map#MaxZoom|maximal map zoom level}.
       *
       * @param {number} zoom - Zoom level
       * @return {boolean} If zoom was set
       *
       * @see {@link bbbfly.Map#GetMaxZoom|GetMaxZoom()}
       * @see {@link bbbfly.Map#GetMinZoom|GetMinZoom()}
       * @see {@link bbbfly.Map#SetMinZoom|SetMinZoom()}
       */
      SetMaxZoom: bbbfly.map.map._setMaxZoom,
      /**
       * @function
       * @name GetMaxZoom
       * @memberof bbbfly.Map#
       *
       * @description Get map maximal zoom level.
       *
       * @return {number|null} zoom - Zoom level
       *
       * @see {@link bbbfly.Map#SetMaxZoom|SetMaxZoom()}
       * @see {@link bbbfly.Map#SetMinZoom|SetMinZoom()}
       * @see {@link bbbfly.Map#GetMinZoom|GetMinZoom()}
       */
      GetMaxZoom: bbbfly.map.map._getMaxZoom,
      /**
       * @function
       * @name EnableAnimation
       * @memberof bbbfly.Map#
       *
       * @description
       *   Enable or disable {@link bbbfly.Map#Animate|map animation}.
       *
       * @param {boolean} enable
       * @return {boolean} If state has changed
       */
      EnableAnimation: bbbfly.map.map._enableAnimation,
      /**
       * @function
       * @name SetView
       * @memberof bbbfly.Map#
       *
       * @description Set map position and zoom level.
       *
       * @param {mapPoint} coords - Center point
       * @param {number} zoom - Zoom level
       * @return {boolean} If view was set
       *
       * @see {@link bbbfly.Map#SetZoom|SetZoom()}
       * @see {@link bbbfly.Map#GetZoom|GetZoom()}
       * @see {@link bbbfly.Map#ZoomIn|ZoomIn()}
       * @see {@link bbbfly.Map#ZoomOut|ZoomOut()}
       * @see {@link bbbfly.Map#SetCenter|SetCenter()}
       * @see {@link bbbfly.Map#GetCenter|GetCenter()}
       * @see {@link bbbfly.Map#event:OnZoomChanged|OnZoomChanged}
       */
      SetView: bbbfly.map.map._setView,
      /**
       * @function
       * @name SetZoom
       * @memberof bbbfly.Map#
       *
       * @description Set map zoom level.
       *
       * @param {number} zoom - Zoom level
       * @return {boolean} If zoom was set
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#GetZoom|GetZoom()}
       * @see {@link bbbfly.Map#ZoomIn|ZoomIn()}
       * @see {@link bbbfly.Map#ZoomOut|ZoomOut()}
       * @see {@link bbbfly.Map#event:OnZoomChanged|OnZoomChanged}
       */
      SetZoom: bbbfly.map.map._setZoom,
      /**
       * @function
       * @name GetZoom
       * @memberof bbbfly.Map#
       *
       * @description Get map zoom level.
       *
       * @return {number|null} zoom - Zoom level
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetZoom|SetZoom()}
       * @see {@link bbbfly.Map#ZoomIn|ZoomIn()}
       * @see {@link bbbfly.Map#ZoomOut|ZoomOut()}
       */
      GetZoom: bbbfly.map.map._getZoom,
      /**
       * @function
       * @name ZoomIn
       * @memberof bbbfly.Map#
       *
       * @description Zoom map in.
       *
       * @param {number} zoomBy - Number of zoom levels
       * @return {boolean} If map was zoomed
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetZoom|SetZoom()}
       * @see {@link bbbfly.Map#GetZoom|GetZoom()}
       * @see {@link bbbfly.Map#ZoomOut|ZoomOut()}
       * @see {@link bbbfly.Map#event:OnZoomChanged|OnZoomChanged}
       */
      ZoomIn: bbbfly.map.map._zoomIn,
      /**
       * @function
       * @name ZoomOut
       * @memberof bbbfly.Map#
       *
       * @description Zoom map out.
       *
       * @param {number} zoomBy - Number of zoom levels
       * @return {boolean} If map was zoomed
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetZoom|SetZoom()}
       * @see {@link bbbfly.Map#GetZoom|GetZoom()}
       * @see {@link bbbfly.Map#ZoomIn|ZoomIn()}
       * @see {@link bbbfly.Map#event:OnZoomChanged|OnZoomChanged}
       */
      ZoomOut: bbbfly.map.map._zoomOut,
      /**
       * @function
       * @name SetCenter
       * @memberof bbbfly.Map#
       *
       * @description Set map position.
       *
       * @param {mapPoint} coords - Center point
       * @return {boolean} If center was set
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#GetCenter|GetCenter()}
       */
      SetCenter: bbbfly.map.map._setCenter,
      /**
       * @function
       * @name GetCenter
       * @memberof bbbfly.Map#
       *
       * @description Get map position.
       *
       * @return {mapPoint|null} Center point
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetCenter|SetCenter()}
       */
      GetCenter: bbbfly.map.map._getCenter,
      /**
       * @function
       * @name CreateLayer
       * @memberof bbbfly.Map#
       *
       * @description Create Leaflet layer wrapper.
       *
       * @param {bbbfly.Map.Layer} def
       * @return {bbbfly.Map.layer}
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       */
      CreateLayer: bbbfly.map.map._createLayer,
      /**
       * @function
       * @name GetLayers
       * @memberof bbbfly.Map#
       *
       * @description Get map layers.
       *
       * @return {bbbfly.Map.layer[]}
       *
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       */
      GetLayers: bbbfly.map.map._getLayers,
      /**
       * @function
       * @name GetLayer
       * @memberof bbbfly.Map#
       *
       * @description Get map layer.
       *
       * @param {string} id
       * @return {bbbfly.Map.layer}
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       */
      GetLayer: bbbfly.map.map._getLayer,
      /**
       * @function
       * @name AddLayers
       * @memberof bbbfly.Map#
       *
       * @description Add new map layers.
       *
       * @param {bbbfly.Map.Layer[]} defs
       * @return {boolean} - If all layers were added
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      AddLayers: bbbfly.map.map._addLayers,
      /**
       * @function
       * @name AddLayer
       * @memberof bbbfly.Map#
       *
       * @description Add new map layer.
       *
       * @param {bbbfly.Map.Layer} def
       * @return {boolean} - If layer was added
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      AddLayer: bbbfly.map.map._addLayer,
      /**
       * @function
       * @name RemoveLayers
       * @memberof bbbfly.Map#
       *
       * @description Remove map layers.
       *
       * @param {string[]} [ids=undefined] - All layers will be removed if no ID is passed
       * @return {boolean} - If all layers were removed
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayer|RemoveLayer()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      RemoveLayers: bbbfly.map.map._removeLayers,
      /**
       * @function
       * @name RemoveLayer
       * @memberof bbbfly.Map#
       *
       * @description Remove map layer.
       *
       * @param {string} id
       * @return {boolean} - If layer was removed
       *
       * @see {@link bbbfly.Map#GetLayers|GetLayers()}
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      RemoveLayer: bbbfly.map.map._removeLayer,
      /**
       * @function
       * @name SetLayerVisible
       * @memberof bbbfly.Map#
       *
       * @description Shows or hides map layer.
       *
       * @param {string} id
       * @param {boolean} visible
       * @return {boolean} - If layer visibility was set
       *
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      SetLayerVisible: bbbfly.map.map._setLayerVisible,
      /**
       * @function
       * @name GetMapLayerName
       * @memberof bbbfly.Map#
       *
       * @description Get map layer name for current language.
       *
       * @param {L.Layer} mapLayer
       * @return {string|null}
       */
      GetMapLayerName: bbbfly.map.map._getMapLayerName,
      /**
       * @function
       * @name GetLayerName
       * @memberof bbbfly.Map#
       *
       * @description Get layer name for current language.
       *
       * @param {string} id
       * @return {string|null}
       */
      GetLayerName: bbbfly.map.map._getLayerName,
      /**
       * @function
       * @name DoGetLayerName
       * @memberof bbbfly.Map#
       *
       * @description Get layer name for current language.
       *
       * @param {bbbfly.Map.layer} layer
       * @return {string|null}
       */
      DoGetLayerName: bbbfly.map.map._doGetLayerName,

      /**
       * @function
       * @name GetAttributions
       * @memberof bbbfly.Map#
       *
       * @description Get all layers attributions.
       *
       * @return {bbbfly.Map.attribution}
       *
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      GetAttributions: bbbfly.map.map._getAttributions
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @enum {string}
 *
 * @description
 *   Supported coordinate reference systems.
 */
bbbfly.Map.crs = {
  WorldMercator: 'EPSG3395',
  PseudoMercator: 'EPSG3857',
  WGS84: 'EPSG4326'
};

/**
 * @typedef {object} attribution
 * @memberof bbbfly.Map
 *
 * @description
 *   Layer attribution.
 *
 * @property {string} [Name=undefined]
 * @property {string[]} Attributions
 */

/**
 * @typedef {object} layer
 * @memberof bbbfly.Map
 *
 * @description
 *   Leaflet layer wrapper.
 *
 * @property {string} Id
 * @property {bbbfly.Map.Layer.display} Display
 * @property {string} [NameRes=undefined] - Layer name resource ID
 * @property {string|object} [Name=undefined] - Layer name by language in format {lang: 'name'}
 * @property {boolean} Visible
 * @property {mapLayer} Layer
 */

/**
 * @typedef {object} listener
 * @memberof bbbfly.Map
 *
 * @description
 *   Map Events listener.
 *
 * @property {string[]} Listen - Names of events to listen
 * @property {function} EventName... - Event function implementations
 */

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_map'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Map',bbbfly.Map);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Map
 * @extends bbbfly.Frame.Definition
 *
 * @description Map control definition
 */

/**
 * @interface Layer
 * @memberof bbbfly.Map
 *
 * @description
 *   Ancestor for all Leaflet layer definitions.
 *
 * @property {string} [Id=undefined]
 * @property {bbbfly.Map.Layer.type} Type
 * @property {bbbfly.Map.Layer.display} [Display=fixed]
 * @property {string} [NameRes=undefined] - Layer name resource ID
 * @property {string|object} [Name=undefined] - Layer name by language
 *
 * @property {number} [ZIndex=undefined] - Layer z-index
 * @property {number} [Opacity=undefined] - Layer opacity
 * @property {string} [ClassName=undefined] - Layer element CSS class name
 */
bbbfly.Map.Layer = {
  options_map: {
    ZIndex: 'zIndex',
    Opacity: 'opacity',
    ClassName: 'className'
  },
  options: {
    zIndex: 1,
    opacity: 1,
    className: ''
  }
};

/**
 * @enum {string}
 *
 * @description
 *   Supported map layer types.
 */
bbbfly.Map.Layer.type = {
  color: 'ColorLayer',

  image: 'ImageLayer',
  tile: 'TileLayer',
  wms: 'WMSLayer',

  arcgis_online: 'ArcGISOnlineLayer',
  arcgis_server: 'ArcGISServerLayer',
  arcgis_enterprise: 'ArcGISEnterpriseLayer',

  mapbox_tile: 'MapboxTileLayer',
  mapbox_style: 'MapboxStyleLayer'
};

/**
 * @enum {string}
 */
bbbfly.Map.Layer.display = {
  /** Always shown */
  fixed: 'fixed',
  /** Optional, shown as default */
  visible: 'visible',
  /** Optional, hidden as default */
  hidden: 'hidden'
};

/**
 * @interface ColorLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.Layer
 *
 * @property {bbbfly.Map.Layer.type} [Type=color]
 * @property {color} [Color=''] - Layer color
 */
bbbfly.Map.ColorLayer = {
  extends: 'Layer',
  type: 'L.bbbfly.ColorLayer',
  options_map: {
    Color: 'color'
  },
  options: {
    color: ''
  }
};

/**
 * @interface ExternalLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.Layer
 *
 * @description
 *   Ancestor for all Leaflet external layer definitions.
 *
 * @property {url} Url - Url used for tile requests
 * @property {string|string[]} [Attribution=undefined] - Layer copyright attribution
 * @property {boolean|string} [CrossOrigin=false] - Will be added to tile requests
 */
bbbfly.Map.ExternalLayer = {
  extends: 'Layer',
  options_map: {
    Url: 'url',
    Attribution: 'attribution',
    CrossOrigin: 'crossOrigin'
  },
  options: {
    crossOrigin: false
  }
};

/**
 * @interface ImageLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.ExternalLayer
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#imageoverlay|L.ImageOverlay}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=image
 * @property {url} [ErrorUrl=undefined] - Url used when tile request has failed
 * @property {mapBounds|array} Bounds - Place image within bounds
 *
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 */
bbbfly.Map.ImageLayer = {
  extends: 'ExternalLayer',
  type: 'L.ImageOverlay',
  options_map: {
    ErrorUrl: 'errorOverlayUrl',
    Bounds: 'bounds'
  }
};

/**
 * @interface TileLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.ExternalLayer
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#tilelayer|L.TileLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=tile
 * @property {url} [ErrorUrl=undefined] - Url used when tile request has failed
 * @property {mapBounds|array} [Bounds=undefined] - Display layer only in bounds
 * @property {number} [MinZoom=1] - Display layer from zoom level
 * @property {number} [MaxZoom=18] - Display layer to zoom level
 * @property {px} [TileSize=256] - Tile width and height
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'TileLayer',
 *   Url: 'http://tile.openstreetmap.org/{z}/{x}/{y}.png',
 *   Attribution: '&copy; OpenStreetMap contributors'
 * }]
 * ...
 */
bbbfly.Map.TileLayer = {
  extends: 'ExternalLayer',
  type: 'L.TileLayer',
  options_map: {
    ErrorUrl: 'errorTileUrl',
    Bounds: 'bounds',
    MinZoom: 'minZoom',
    MaxZoom: 'maxZoom',
    TileSize: 'tileSize'
  },
  options: {
    minZoom: 1,
    maxZoom: 18,
    tileSize: 256,
    detectRetina : true
  }
};

/**
 * @interface WMSLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.TileLayer
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#tilelayer-wms|L.TileLayer.wms}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=wms
 * @property {string} Layers - Comma-separated WMS layers
 * @property {string} [Styles=undefined] - Comma-separated WMS styles
 * @property {string} [Format='image/png32'] - WMS image format
 * @property {string} [Version='1.3.0'] - WMS service version
 * @property {boolean} [Transparent=true] - Allow WMS image transparency
 * @property {bbbfly.Map.crs} [crs=undefined] - CRS to use instead of map CRS.
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'WMSLayer',
 *   Url: 'http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi',
 *   Attribution: 'Weather data &copy; 2012 IEM Nexrad',
 *   Layers: 'nexrad-n0r-900913'
 * }]
 * ...
 */
bbbfly.Map.WMSLayer = {
  extends: 'TileLayer',
  type: 'L.TileLayer.wms',
  options_map: {
    Layers: 'layers',
    Styles: 'styles',
    Format: 'format',
    Version: 'version',
    Transparent: 'transparent',
    Crs: 'crs'
  },
  options: {
    format: 'image/png32',
    version: '1.3.0',
    transparent: true
  }
};

/**
 * @interface ArcGISOnlineLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.TileLayer
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/tiled-map-layer.html|L.esri.TiledMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=arcgis_online
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'ArcGISOnlineLayer',
 *   Url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer',
 *   Attribution: '&copy; US National Park Service'
 * }]
 * ...
 */
bbbfly.Map.ArcGISOnlineLayer = {
  extends: 'TileLayer',
  type: 'L.esri.TiledMapLayer'
};

/**
 * @interface ArcGISServerLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.TileLayer
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/tiled-map-layer.html|L.esri.TiledMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=arcgis_server
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'ArcGISServerLayer',
 *   Url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/',
 *   Attribution: ['&copy; Esri', '&copy; USGS', '&copy; NOAA']
 * }]
 * ...
 */
bbbfly.Map.ArcGISServerLayer = {
  extends: 'TileLayer',
  type: 'L.esri.TiledMapLayer'
};

/**
 * @interface ArcGISEnterpriseLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.ImageLayer
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/dynamic-map-layer.html|L.esri.DynamicMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.Layer.type} Type=arcgis_enterprise
 * @property {string} [Format='png32'] - Service image format
 * @property {array} Layers - An array of service layer IDs
 * @property {boolean} [Transparent=true] - Allow service image transparency
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'ArcGISEnterpriseLayer',
 *   Url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/',
 *   Attribution: 'unavailable'
 * }]
 * ...
 */
bbbfly.Map.ArcGISEnterpriseLayer = {
  extends: 'ImageLayer',
  type: 'L.esri.DynamicMapLayer',
  options_map: {
    Format: 'format',
    Layers: 'layers',
    Transparent: 'transparent'
  },
  options: {
    format: 'png32',
    transparent: true
  }
};

/**
 * @interface MapboxTileLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.TileLayer
 *
 * @property {bbbfly.Map.Layer.type} Type=mapbox_tile
 * @property {string} MapId - {@link https://docs.mapbox.com/help/glossary/map-id/|Mapbox map ID}
 * @property {string} AccessToken - {@link https://docs.mapbox.com/help/glossary/access-token/|Mapbox access token}
 * @property {string} [Format='png32'] - png, png32, png64, png128, png256, jpg70, jpg80, jpg90
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxStyleLayer|MapboxStyleLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'MapboxTileLayer',
 *   MapId: 'mapbox.streets',
 *   Attribution: ['&copy; Mapbox', '&copy; OpenStreetMap'],
 *   AccessToken: 'your access token'
 * }]
 * ...
 */
bbbfly.Map.MapboxTileLayer = {
  extends: 'TileLayer',
  options_map: {
    MapId: 'mapId',
    AccessToken: 'accessToken',
    Format: 'format'
  },
  options: {
    format: 'png32'
  },

  onCreateOptions: bbbfly.map.layer.mapbox_tile._oncreateOptions
};

/**
 * @interface MapboxStyleLayer
 * @memberof bbbfly.Map
 * @extends bbbfly.Map.TileLayer
 *
 * @property {bbbfly.Map.Layer.type} Type=mapbox_style
 * @property {string} StyleUrl - {@link https://docs.mapbox.com/help/glossary/style-url/|Mapbox style URL}
 * @property {string} AccessToken - {@link https://docs.mapbox.com/help/glossary/access-token/|Mapbox access token}
 * @property {string} [Format='png32'] - Service image format
 *
 * @see {@link bbbfly.Map.ImageLayer|ImageLayer}
 * @see {@link bbbfly.Map.TileLayer|TileLayer}
 * @see {@link bbbfly.Map.WMSLayer|WMSLayer}
 * @see {@link bbbfly.Map.ArcGISOnlineLayer|ArcGISOnlineLayer}
 * @see {@link bbbfly.Map.ArcGISServerLayer|ArcGISServerLayer}
 * @see {@link bbbfly.Map.ArcGISEnterpriseLayer|ArcGISEnterpriseLayer}
 * @see {@link bbbfly.Map.MapboxTileLayer|MapboxTileLayer}
 *
 * @example
 * ...
 * Layers: [{
 *   Type: 'MapboxStyleLayer',
 *   StyleUrl: 'mapbox://styles/mapbox/emerald-v8',
 *   Attribution: ['&copy; Mapbox', '&copy; OpenStreetMap'],
 *   AccessToken: 'your access token'
 * }]
 * ...
 */
bbbfly.Map.MapboxStyleLayer = {
  extends: 'TileLayer',
  options_map: {
    StyleUrl: 'styleUrl',
    AccessToken: 'accessToken',
    Format: 'format'
  },
  options: {
    tileSize: 512,
    zoomOffset: -1,
    minNativeZoom: 0
  },

  pattern: new RegExp('^mapbox://styles/([\\w-]+)/([a-z0-9]+).*$'),
  onCreateOptions: bbbfly.map.layer.mapbox_style._oncreateOptions
};
