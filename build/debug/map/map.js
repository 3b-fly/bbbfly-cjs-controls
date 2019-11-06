/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.map = {};
bbbfly.map.layer = {
  mapbox_tile: {},
  mapbox_style: {}
};
bbbfly.map.map._onCreated = function(map){
  bbbfly.MapRegistry.RegisterMap(map);

  var cHolder = map.GetControlsHolder();
  cHolder.SetScrollBars(ssNone);

  map.CreateMap();
  return true;
};
bbbfly.map.map._onUpdate = function(){
  if(!this._MapControlsRegistered){
    this.RegisterControls();
    this._MapControlsRegistered = true;
  }
  return true;
};
bbbfly.map.map._onUpdated = function(){
  var map = this.GetMap();
  if(map && Function.isFunction(map.invalidateSize)){
    map.invalidateSize();
  }
};
bbbfly.map.map._registerControls = function(){
  if(!this.Controls){return;}

  for(var i in this.Controls){
    var ctrl = this.Controls[i];

    if(!String.isString(ctrl.MapID)){ctrl.MapID = this.ID;}
    bbbfly.MapRegistry.RegisterControl(ctrl);
  }
};
bbbfly.map.map._dispose = function(){
  this.DestroyMap();
  this.Dispose.callParent();
};
bbbfly.map.map._getMap = function(){
  return this._Map;
};
bbbfly.map.map._createMap = function(){
  if(this.GetMap()){return true;}
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
  this.AddLayers(this.Layers);
  if(map.getZoom && this.OnZoomChanged){
    this.OnZoomChanged(map.getZoom());
  }
  return true;
};
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
bbbfly.map.map._destroyMap = function(){
  var map = this.GetMap();
  if(map){
    map.remove();
    return true;
  }
  return false;
};
bbbfly.map.map._linkMapControl = function(type,ctrl){
  if(!String.isString(type) || !ctrl){return false;}
  if(!Function.isFunction(ctrl.GetListener)){return false;}
  if(!Function.isFunction(this.AddListener)){return false;}

  var listener = ctrl.GetListener();
  if(listener && !this.AddListener(listener.Listen,listener)){
    return false;
  }

  if(!Array.isArray(this._MapControls[type])){
    this._MapControls[type] = [];
  }

  var stack = this._MapControls[type];
  if(!stack.includes(ctrl)){stack.push(ctrl);}
  return true;
};
bbbfly.map.map._unlinkMapControl = function(type,ctrl){
  if(!String.isString(type) || !ctrl){return false;}
  if(!Function.isFunction(ctrl.GetListener)){return false;}
  if(!Function.isFunction(this.RemoveListener)){return false;}

  var listener = ctrl.GetListener();
  if(listener && !this.RemoveListener(listener.Listen,listener)){
    return false;
  }

  var stack = this._MapControls[type];
  var idx = Array.indexOf(stack,ctrl);
  if(idx > 0){stack.splice(idx,1);}
  return true;
};
bbbfly.map.map._getMapControls = function(type){
  var ctrls = [];
  var ids = {};

  for(var tp in this._MapControls){
    if(String.isString(type) && (tp !== type)){continue;}

    var stack = this._MapControls[type];
    if(!Array.isArray(stack)){continue;}

    for(var i in stack){
      var ctrl = stack[i];

      if(String.isString(ctrl.ID)){
        if(ids[ctrl.ID]){continue;}
        ids[ctrl.ID] = true;
      }

      ctrls.push(ctrl);
    }
  }
  return ctrls;
};
bbbfly.map.map._setMapControlsVisible = function(type,visible){
  if(!String.isString(type)){return false;}
  if(!Boolean.isBoolean(visible)){visible = true;}

  var ctrls = this.GetMapControls(type);
  for(var i in ctrls){
    var ctrl = ctrls[i];
    if(ctrl && Function.isFunction(ctrl.SetVisible)){
      ctrl.SetVisible(visible);
    }
  }
};
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
bbbfly.map.map._setBoundsPadding = function(padding){
  if(Number.isInteger(padding)){
    this.BoundsPadding = padding;
    return true;
  }
  return false;
};
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
bbbfly.map.map._setMinZoom = function(zoom){
  if(Number.isInteger(zoom)){
    this.MinZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMinZoom(zoom);}
    return true;
  }
  return false;
};
bbbfly.map.map._getMinZoom = function(){
  var map = this.GetMap();
  return (map) ? map.getMinZoom() : null;
};
bbbfly.map.map._setMaxZoom = function(zoom){
  if(Number.isInteger(zoom)){
    this.MaxZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMaxZoom(zoom);}
    return true;
  }
  return false;
};
bbbfly.map.map._getMaxZoom = function(){
  var map = this.GetMap();
  return (map) ? map.getMaxZoom() : null;
};
bbbfly.map.map._enableAnimation = function(enable){
  if(enable === this.Animate){return false;}
  this.Animate = !!enable;
  return true;
};
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
bbbfly.map.map._setZoom = function(zoom){
  return this.SetView(null,zoom);
};
bbbfly.map.map._getZoom = function(){
  var map = this.GetMap();
  if(map){return map.getZoom();}
  return null;
};
bbbfly.map.map._zoomIn = function(zoomBy){
  var map = this.GetMap();
  if(map){
    map.zoomIn(zoomBy,{animate: !!this.Animate});
    return true;
  }
  return false;
};
bbbfly.map.map._zoomOut = function(zoomBy){
  var map = this.GetMap();
  if(map){
    map.zoomOut(zoomBy,{animate: !!this.Animate});
    return true;
  }
  return false;
};
bbbfly.map.map._onMapZoomEnd = function(event){
  var map = event.target;
  if(map && map.Owner){

    var mapCtrl = map.Owner;
    if(Function.isFunction(mapCtrl.OnZoomChanged)){
      mapCtrl.OnZoomChanged(map.getZoom());
    }
  }
};
bbbfly.map.map._setCenter = function(coordinates){
  return this.SetView(coordinates,null);
};
bbbfly.map.map._getCenter = function(){
  var map = this.GetMap();
  if(map){return map.getCenter();}
  return null;
};
bbbfly.map.map._beginLayersChanges = function(mapCtrl){
  if(++mapCtrl._LayersChanging < 1){mapCtrl._LayersChanging = 1;}
};
bbbfly.map.map._endLayersChanges = function(mapCtrl){
  if(--mapCtrl._LayersChanging < 0){mapCtrl._LayersChanging = 0;}
  bbbfly.map.map._layersChanged(mapCtrl);
};
bbbfly.map.map._layersChanged = function(mapCtrl){
  if(mapCtrl._LayersChanging > 0){return;}

  if(Function.isFunction(mapCtrl.OnLayersChanged)){
    mapCtrl.OnLayersChanged();
  }
};
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
    case 'L.ImageOverlay':
      mapLayer = L.tileLayer.wms(opts.url,opts.bounds,opts);
    break;
    case 'L.TileLayer':
      mapLayer = L.tileLayer(opts.url,opts);
    break;
    case 'L.TileLayer.wms':
      mapLayer = L.tileLayer.wms(opts.url,opts);
    break;
    case 'L.esri.TiledMapLayer':
      mapLayer = L.esri.tiledMapLayer(opts);
    break;
    case 'L.esri.DynamicMapLayer':
      mapLayer = L.esri.dynamicMapLayer(opts);
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
bbbfly.map.map._getLayers = function(){
  return Object.isObject(this._Layers) ? this._Layers : {};
};
bbbfly.map.map._getLayer = function(id){
  if(!String.isString(id)){return null;}

  var layers = this.GetLayers();
  var layer = layers[id];

  return Object.isObject(layer) ? layer : null;
};
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
bbbfly.map.map._removeLayer = function(id){
  if(!String.isString(id)){return false;}

  if(this.SetLayerVisible(id,false)){
    delete this._Layers[id];
    return true;
  }
  return false;
};

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
bbbfly.map.map._onMapLayersChanged = function(event){
  if(event.target && event.target.Owner){
    bbbfly.map.map._layersChanged(event.target.Owner);
  }
};
bbbfly.map.map._getLayerName = function(id){
  var layer = this.GetLayer(id);
  if(!layer){return null;}

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
bbbfly.map.map._getAttributions = function(){
  var map = this.GetMap();
  var attributions = [];

  if(map){
    var callback = bbbfly.map.map._getLayerAttributions;
    map.eachLayer(callback,attributions);
  }
  return attributions;
};
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
bbbfly.map.layer.mapbox_tile._oncreateOptions = function(options){
  if(!String.isString(options.url)){
    var r = (options.detectRetina) ? '{r}' : '';

    options.url = 'https://api.mapbox.com/v4/'
      +'{mapId}/{z}/{x}/{y}'+r+'.{format}'
      +'?access_token={accessToken}';
  }
};
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

      Layers: [],
      DefaultLayer: null,
      _Map: null,
      _Layers: {},
      _LayerId: 1,
      _LayersChanging: 0,
      _MapControls: {},
      _MapControlsRegistered: false
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
      OnUpdate: bbbfly.map.map._onUpdate,
      OnUpdated: bbbfly.map.map._onUpdated,
      OnZoomChanged: null,
      OnLayersChanged: null
    },
    Methods: {
      Dispose: bbbfly.map.map._dispose,
      LayerInterface: bbbfly.map.map._layerInterface,
      RegisterControls: bbbfly.map.map._registerControls,
      GetMap: bbbfly.map.map._getMap,
      CreateMap: bbbfly.map.map._createMap,
      DoCreateMap: bbbfly.map.map._doCreateMap,
      DestroyMap: bbbfly.map.map._destroyMap,
      LinkMapControl: bbbfly.map.map._linkMapControl,
      UnlinkMapControl: bbbfly.map.map._unlinkMapControl,
      GetMapControls: bbbfly.map.map._getMapControls,
      SetMapControlsVisible: bbbfly.map.map._setMapControlsVisible,
      SetMaxBounds: bbbfly.map.map._setMaxBounds,
      SetBoundsPadding: bbbfly.map.map._setBoundsPadding,
      FitBounds: bbbfly.map.map._fitBounds,
      SetMinZoom: bbbfly.map.map._setMinZoom,
      GetMinZoom: bbbfly.map.map._getMinZoom,
      SetMaxZoom: bbbfly.map.map._setMaxZoom,
      GetMaxZoom: bbbfly.map.map._getMaxZoom,
      EnableAnimation: bbbfly.map.map._enableAnimation,
      SetView: bbbfly.map.map._setView,
      SetZoom: bbbfly.map.map._setZoom,
      GetZoom: bbbfly.map.map._getZoom,
      ZoomIn: bbbfly.map.map._zoomIn,
      ZoomOut: bbbfly.map.map._zoomOut,
      SetCenter: bbbfly.map.map._setCenter,
      GetCenter: bbbfly.map.map._getCenter,
      CreateLayer: bbbfly.map.map._createLayer,
      GetLayers: bbbfly.map.map._getLayers,
      GetLayer: bbbfly.map.map._getLayer,
      AddLayers: bbbfly.map.map._addLayers,
      AddLayer: bbbfly.map.map._addLayer,
      RemoveLayers: bbbfly.map.map._removeLayers,
      RemoveLayer: bbbfly.map.map._removeLayer,
      SetLayerVisible: bbbfly.map.map._setLayerVisible,
      GetLayerName: bbbfly.map.map._getLayerName,
      GetAttributions: bbbfly.map.map._getAttributions
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
bbbfly.Map.crs = {
  WorldMercator: 'EPSG3395',
  PseudoMercator: 'EPSG3857',
  WGS84: 'EPSG4326'
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_map'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Map',bbbfly.Map);
  }
};

bbbfly.Map.Layer = {
  options_map: {
    Url: 'url',
    ZIndex: 'zIndex',
    Opacity: 'opacity',
    ClassName: 'className',
    Attribution: 'attribution',
    CrossOrigin: 'crossOrigin'
  },
  options: {
    zIndex: 1,
    opacity: 1,
    className: '',
    crossOrigin: false
  }
};
bbbfly.Map.Layer.type = {
  image: 'ImageLayer',
  tile: 'TileLayer',
  wms: 'WMSLayer',

  arcgis_online: 'ArcGISOnlineLayer',
  arcgis_server: 'ArcGISServerLayer',
  arcgis_enterprise: 'ArcGISEnterpriseLayer',

  mapbox_tile: 'MapboxTileLayer',
  mapbox_style: 'MapboxStyleLayer'
};
bbbfly.Map.Layer.display = {
  fixed: 'fixed',
  visible: 'visible',
  hidden: 'hidden'
};
bbbfly.Map.ImageLayer = {
  extends: 'Layer',
  type: 'L.ImageOverlay',
  map: {
    ErrorUrl: 'errorOverlayUrl',
    Bounds: 'bounds'
  }
};
bbbfly.Map.TileLayer = {
  extends: 'Layer',
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
bbbfly.Map.ArcGISOnlineLayer = {
  extends: 'TileLayer',
  type: 'L.esri.TiledMapLayer'
};
bbbfly.Map.ArcGISServerLayer = {
  extends: 'TileLayer',
  type: 'L.esri.TiledMapLayer'
};
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
