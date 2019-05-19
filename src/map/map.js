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
  var cHolder = map.GetControlsHolder();
  cHolder.SetScrollBars(ssNone);

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
  return this._map;
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

  this._map = map;
  return map;
};

/** @ignore */
bbbfly.map.map._destroyMap = function(){
  var map = this.GetMap();
  if(map){
    map.remove();
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._setMaxBounds = function(bounds){
  if(Array.isArray(bounds)){
    bounds = new L.latLngBounds(bounds);
  }

  if(bounds && bounds.isValid && bounds.isValid()){
    this.MaxBounds = bounds;

    var map = this.GetMap();
    if(map){map.setMaxBounds(bounds);}
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._setBoundsPadding = function(padding){
  if(Number.isInteger(padding)){
    this.BoundsPadding = padding;
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._fitBounds = function(bounds,padding){
  var map = this.GetMap();
  if(!map){return false;}

  if(!bounds && this.MaxBounds){bounds = this.MaxBounds;}
  if(!padding && this.BoundsPadding){padding = this.BoundsPadding;}

  if(bounds && bounds.isValid && bounds.isValid()){
    if(!Number.isInteger(padding)){padding = 0;}

    map.fitBounds(bounds,{
      padding: [padding,padding],
      animate: !!this.Animate
    });

    return true;
  }

  return false;
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
bbbfly.map.map._enableAnimation = function(enable){
  if(enable === this.Animate){return false;}
  this.Animate = !!enable;
  return true;
};

/** @ignore */
bbbfly.map.map._setView = function(coordinates,zoom){
  var map = this.GetMap();
  if(map){
    if((typeof coordinates === 'undefined') || (coordinates === null)){
      coordinates = map.getCenter();
    }
    if((typeof zoom === 'undefined') || (zoom === null)){
      zoom = map.getZoom();
    }

    map.setView(coordinates,zoom,{animate: !!this.Animate});
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
bbbfly.map.map._setCenter = function(coordinates){
  return this.SetView(coordinates,null);
};

/** @ignore */
bbbfly.map.map._getCenter = function(){
  var map = this.GetMap();
  if(map){return map.getCenter();}
  return null;
};

/** @ignore */
bbbfly.map.map._beginLayersChanges = function(mapCtrl){
  if(++mapCtrl._layersChanging < 1){mapCtrl._layersChanging = 1;}
};

/** @ignore */
bbbfly.map.map._endLayersChanges = function(mapCtrl){
  if(--mapCtrl._layersChanging < 0){mapCtrl._layersChanging = 0;}
  bbbfly.map.map._layersChanged(mapCtrl);
};

/** @ignore */
bbbfly.map.map._layersChanged = function(mapCtrl){
  if(mapCtrl._layersChanging > 0){return;}

  if(Function.isFunction(mapCtrl.OnLayersChanged)){
    mapCtrl.OnLayersChanged();
  }
};

/** @ignore */
bbbfly.map.map._getLayer = function(id){
  if(!String.isString(id)){return null;}

  var layer = this._layers[id];
  return (layer) ? layer : null;
};

/** @ignore */
bbbfly.map.map._addLayers = function(defs){
  if(!Array.isArray(defs)){return false;}

  bbbfly.map.map._beginLayersChanges(this);
  var result = true;

  for(var i in defs){
    if(!this.AddLayer(defs[i])){
      result = false;
      break;
    }
  }

  bbbfly.map.map._endLayersChanges(this);
  return result;
};


/** @ignore */
bbbfly.map.map._addLayer = function(def){
  if(!Object.isObject(def)){return false;}

  var map = this.GetMap();
  if(!map){return false;}

  var iface = this.LayerInterface(def.Type);
  if(!Object.isObject(iface)){return false;}

  ng_MergeVar(def,this.DefaultLayer);

  var options = {};
  if(Object.isObject(iface.map)){
    for(var defProp in def){
      var optProp = iface.map[defProp];
      if(optProp){options[optProp] = def[defProp];}
    }
  }

  if(Object.isObject(iface.options)){
    ng_MergeVar(options,iface.options);
  }

  if(Function.isFunction(iface.onCreateOptions)){
    iface.onCreateOptions(options);
  }

  var layer = null;
  switch(iface.type){
    case 'L.ImageOverlay':
      layer = L.tileLayer.wms(options.url,options.bounds,options);
    break;
    case 'L.TileLayer':
      layer = L.tileLayer(options.url,options);
    break;
    case 'L.TileLayer.wms':
      layer = L.tileLayer.wms(options.url,options);
    break;
    case 'L.esri.TiledMapLayer':
      layer = L.esri.tiledMapLayer(options);
    break;
    case 'L.esri.DynamicMapLayer':
      layer = L.esri.dynamicMapLayer(options);
    break;
  }

  if(layer){
    if(String.isString(def.Id)){this.RemoveLayer(def.Id);}
    else{def.Id = '_L'+(this._layerId++);}

    layer.addTo(map);
    this._layers[def.Id] = layer;
    return true;
  }
  return false;
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
    for(var id in this._layers){
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

  var layer = this._layers[id];
  if(layer){
    delete this._layers[id];
    if(Function.isFunction(layer.remove)){
      layer.remove();
    }
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._layerInterface = function(iname,iface){
  if(!String.isString(iname)){return;}

  var ifc = bbbfly.Map[iname];
  if(!Object.isObject(ifc)){return;}

  if(Object.isObject(iface)){ng_MergeVar(iface,ifc);}
  else{iface = ifc;}

  if(ifc.extends){
    this.LayerInterface(ifc.extends,iface);
  }
  return iface;
};

/** @ignore */
bbbfly.map.map._onMapLayersChanged = function(event){
  if(event.target && event.target.Owner){
    bbbfly.map.map._layersChanged(event.target.Owner);
  }
};

/** @ignore */
bbbfly.map.map._getAttributions = function(){
  var map = this.GetMap();
  var attributions = [];

  if(map){
    var callback = bbbfly.map.map._getLayerAttributions;
    map.eachLayer(callback,attributions);
  }
  return attributions;
};

/** @ignore */
bbbfly.map.map._getLayerAttributions = function(layer){
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
      this.push(attributions);
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
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.Map.crs} [Crs=PseudoMercator] - Default map coordinate reference system
 * @property {integer} [BoundsPadding=1] - Use this padding to fit bounds
 *
 * @property {mapBounds} [MaxBounds=null] - Keep map within these bounds
 * @property {number} [MinZoom=null] - Map minimal zoom level
 * @property {number} [MaxZoom=null] - Map maximal zoom level
 * @property {number} [Animate=true] - If map animation is allowed
 *
 * @property {bbbfly.Map.Layer[]} [Layers=[]] - Map layers definition
 * @property {object} DefaultLayer - Default layer definition
 * @property {number} [DefaultLayer.ZIndex=1] - Layer z-index
 * @property {number} [DefaultLayer.Opacity=1] - Layer opacity
 * @property {string} [DefaultLayer.ClassName=''] - Layer element CSS class name
 * @property {boolean} [DefaultLayer.CrossOrigin=false] - Will be added to tile requests
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
      BoundsPadding: 1,

      MaxBounds: null,
      MinZoom: null,
      MaxZoom: null,
      Animate: true,

      DefaultLayer: {
        ZIndex: 1,
        Opacity: 1,
        ClassName: '',
        CrossOrigin: false
      },

      Layers: [],

      /** @private */
      _map: null,
      /** @private */
      _layers: {},
      /** @private */
      _layerId: 1,
      /** @private */
      _layersChanging: 0
    },
    OnCreated: bbbfly.map.map._onCreated,
    Controls: {
      Map: {
        Type: 'bbbfly.Frame',
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
       * @param {mapBounds} bounds - Maximal bounds
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
       * @param {integer} padding - Bounds padding
       * @return {boolean} If padding was set
       *
       * @see {@link bbbfly.Map#FitBounds|FitBounds()}
       */
      SetBoundsPadding: bbbfly.map.map._setBoundsPadding,

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
       * @param {integer} padding - Padding in all directions
       * @return {boolean} If fit was successful
       *
       * @see {@link bbbfly.Map#SetMaxBounds|SetMaxBounds()}
       */
      FitBounds: bbbfly.map.map._fitBounds,

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
       * @see {@link bbbfly.Map#SetMaxZoom|SetMaxZoom()}
       */
      SetMinZoom: bbbfly.map.map._setMinZoom,
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
       * @see {@link bbbfly.Map#SetMinZoom|SetMinZoom()}
       */
      SetMaxZoom: bbbfly.map.map._setMaxZoom,
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
       * @param {mapPoint} coordinates - Center point
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
       * @param {mapPoint} coordinates - Center point
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
       * @name GetLayer
       * @memberof bbbfly.Map#
       *
       * @description Get Leaflet layer.
       *
       * @param {string} id
       * @return {object} {@link https://leafletjs.com/reference-1.4.0.html#layer|L.Layer}
       *
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
       * @description Add new Leaflet layers.
       *
       * @param {bbbfly.Map.Layer[]} defs
       * @return {boolean} - If all layers were added
       *
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
       * @description Add new Leaflet layer.
       *
       * @param {bbbfly.Map.Layer} def
       * @return {boolean} - If layer was added
       *
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
       * @description Remove Leaflet layers.
       *
       * @param {string[]} [ids=undefined] - All layers will be removed if no ID is passed
       * @return {boolean} - If all layers were removed
       *
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
       * @description Remove Leaflet layer.
       *
       * @param {string} id
       * @return {boolean} - If layer was removed
       *
       * @see {@link bbbfly.Map#GetLayer|GetLayer()}
       * @see {@link bbbfly.Map#AddLayers|AddLayers()}
       * @see {@link bbbfly.Map#AddLayer|AddLayer()}
       * @see {@link bbbfly.Map#RemoveLayers|RemoveLayers()}
       * @see {@link bbbfly.Map#event:OnLayersChanged|OnLayersChanged}
       */
      RemoveLayer: bbbfly.map.map._removeLayer,
      /**
       * @function
       * @name GetAttributions
       * @memberof bbbfly.Map#
       *
       * @description Get all layers attributions.
       *
       * @return {string[][]} - Multidimensional array of attributions
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
 *   Supported map layer types.
 */
bbbfly.Map.layer = {
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
 *
 * @description
 *   Supported coordinate reference systems.
 */
bbbfly.Map.crs = {
  WorldMercator: 'EPSG3395',
  PseudoMercator: 'EPSG3857',
  WGS84: 'EPSG4326'
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_map'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Map',bbbfly.Map);
  }
};

/**
 * @interface Layer
 * @memberOf bbbfly.Map
 *
 * @description
 *   Ancestor for all Leaflet layer definitions.
 *
 * @property {string} Id - Layer can be accesses by this ID
 * @property {bbbfly.Map.layer} Type
 * @property {url} Url - Url used for tile requests
 * @property {boolean|string} [CrossOrigin=undefined] - Will be added to tile requests
 *
 * @property {number} [ZIndex=undefined] - Layer z-index
 * @property {number} [Opacity=undefined] - Layer opacity
 * @property {string} [ClassName=undefined] - Layer element CSS class name
 * @property {string|string[]} [Attribution=undefined] - Layer copyright attribution
 */

bbbfly.Map.Layer = {
  map: {
    Url: 'url',
    CrossOrigin: 'crossOrigin',

    ZIndex: 'zIndex',
    Opacity: 'opacity',
    ClassName: 'className',
    Attribution: 'attribution'
  },
  options: {
    crossOrigin: false,

    zIndex: 1,
    opacity: 1,
    className: ''
  }
};

/**
 * @interface ImageLayer
 * @extends bbbfly.Map.Layer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#imageoverlay|L.ImageOverlay}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=image
 * @property {url} [ErrorUrl=undefined] - Url used when tile request has failed
 * @property {mapBounds} Bounds - Place image within bounds
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
  extends: 'Layer',
  type: 'L.ImageOverlay',
  map: {
    ErrorUrl: 'errorOverlayUrl',
    Bounds: 'bounds'
  }
};

/**
 * @interface TileLayer
 * @extends bbbfly.Map.Layer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#tilelayer|L.TileLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=tile
 * @property {url} [ErrorUrl=undefined] - Url used when tile request has failed
 * @property {mapBounds} [Bounds=undefined] - Display layer only in bounds
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
  extends: 'Layer',
  type: 'L.TileLayer',
  map: {
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
 * @extends bbbfly.Map.TileLayer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://leafletjs.com/reference-1.4.0.html#tilelayer-wms|L.TileLayer.wms}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=wms
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
  map: {
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
 * @extends bbbfly.Map.TileLayer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/tiled-map-layer.html|L.esri.TiledMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=arcgis_online
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
 * @extends bbbfly.Map.TileLayer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/tiled-map-layer.html|L.esri.TiledMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=arcgis_server
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
 * @extends bbbfly.Map.ImageLayer
 * @memberOf bbbfly.Map
 *
 * @description
 *   {@link https://esri.github.io/esri-leaflet/api-reference/layers/dynamic-map-layer.html|L.esri.DynamicMapLayer}
 *   instance will be added to map.
 *
 * @property {bbbfly.Map.layer} Type=arcgis_enterprise
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
  map: {
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
 * @extends bbbfly.Map.TileLayer
 * @memberOf bbbfly.Map
 *
 * @property {bbbfly.Map.layer} Type=mapbox_tile
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
  map: {
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
 * @extends bbbfly.Map.TileLayer
 * @memberOf bbbfly.Map
 *
 * @property {bbbfly.Map.layer} Type=mapbox_style
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
  map: {
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