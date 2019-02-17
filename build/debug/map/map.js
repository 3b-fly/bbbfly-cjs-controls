/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.map = {};
bbbfly.map.map._onCreated = function(map){
  map.CreateMap();
  return true;
};
bbbfly.map.map._onUpdated = function(){
  var map = this.GetMap();
  if(map && (typeof map.invalidateSize === 'function')){
    map.invalidateSize();
  }
};
bbbfly.map.map._dispose = function(){
  this.DestroyMap();
  this.Dispose.callParent();
};
bbbfly.map.map._getMap = function(){
  return this._map;
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
  if(Number.isNumber(this.MinZoom)){
    options.minZoom = this.MinZoom;
    options.zoom = this.MinZoom;
  }
  if(Number.isNumber(this.MaxZoom)){
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
  if(!this.GetMap() && this.Controls.Map){
    var map = L.map(this.Controls.Map.ID,options);

    if(map){
      map.Owner = this;
      map.on('zoomend',bbbfly.map.map._onMapZoomEnd);

      this._map = map;
      return map;
    }
  }
  return null;
};
bbbfly.map.map._destroyMap = function(){
  var map = this.GetMap();
  if(map){
    map.remove();
    return true;
  }
  return false;
};
bbbfly.map.map._setMaxBounds = function(bounds){
  this.MaxBounds = bounds;

  var map = this.GetMap();
  if(map){map.setMaxBounds(bounds);}
  return true;
};
bbbfly.map.map._setMinZoom = function(zoom){
  if(Number.isNumber(zoom)){
    this.MinZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMinZoom(zoom);}
    return true;
  }
  return false;
};
bbbfly.map.map._setMaxZoom = function(zoom){
  if(Number.isNumber(zoom)){
    this.MaxZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMaxZoom(zoom);}
    return true;
  }
  return false;
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
  if(map && (typeof map.getZoom === 'function')){

    var widget = map.Owner;
    if(widget && (typeof widget.OnZoomChanged === 'function')){
      widget.OnZoomChanged(map.getZoom());
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
bbbfly.map.map._addLayers = function(defs){
  if(!Array.isArray(defs)){return false;}

  for(var i in defs){
    if(!this.AddLayer(defs[i])){
      return false;
    }
  }
  return true;
};
bbbfly.map.map._addLayer = function(def){
  if(!Object.isObject(def) || !String.isString(def.Url)){return false;}

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
bbbfly.map.map._removeLayers = function(ids){
  if(Array.isArray(ids)){
    for(var i in ids){
      if(!this.RemoveLayer(ids[i])){
        return false;
      }
    }
  }
  else{
    for(var id in this._layers){
      if(!this.RemoveLayer(id)){
        return false;
      }
    }
  }
  return true;
};
bbbfly.map.map._removeLayer = function(id){
  if(String.isString(id)){return false;}

  var layer = this._layers[id];
  if(layer){
    delete this._layers[id];
    if(typeof layer.remove === 'function'){
      layer.remove();
    }
    return true;
  }
  return false;
};
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
bbbfly.Map = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      MaxBounds: null,
      MinZoom: null,
      MaxZoom: null,
      Animate: true,
      Crs: bbbfly.Map.crs.PseudoMercator,

      DefaultLayer: {
        ZIndex: 1,
        Opacity: 1,
        ClassName: '',
        CrossOrigin: false
      },

      Layers: [],
      _map: null,
      _layers: {},
      _layerId: 1
    },
    OnCreated: bbbfly.map.map._onCreated,
    ControlsPanel: {
      ScrollBars: ssNone
    },
    Controls: {
      Map: {
        Type: 'ngPanel',
        L:0,R:0,T:0,B:0,
        style: {zIndex: 1}
      }
    },
    Events: {
      OnUpdated: bbbfly.map.map._onUpdated,
      OnZoomChanged: null
    },
    Methods: {
      Dispose: bbbfly.map.map._dispose,
      LayerInterface: bbbfly.map.map._layerInterface,
      GetMap: bbbfly.map.map._getMap,
      CreateMap: bbbfly.map.map._createMap,
      DoCreateMap: bbbfly.map.map._doCreateMap,
      DestroyMap: bbbfly.map.map._destroyMap,
      SetMaxBounds: bbbfly.map.map._setMaxBounds,
      SetMinZoom: bbbfly.map.map._setMinZoom,
      SetMaxZoom: bbbfly.map.map._setMaxZoom,
      EnableAnimation: bbbfly.map.map._enableAnimation,
      SetView: bbbfly.map.map._setView,
      SetZoom: bbbfly.map.map._setZoom,
      GetZoom: bbbfly.map.map._getZoom,
      ZoomIn: bbbfly.map.map._zoomIn,
      ZoomOut: bbbfly.map.map._zoomOut,
      SetCenter: bbbfly.map.map._setCenter,
      GetCenter: bbbfly.map.map._getCenter,
      AddLayers: bbbfly.map.map._addLayers,
      AddLayer: bbbfly.map.map._addLayer,
      RemoveLayers: bbbfly.map.map._removeLayers,
      RemoveLayer: bbbfly.map.map._removeLayer
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};
bbbfly.Map.layer = {
  image: 'ImageLayer',
  tile: 'TileLayer',
  wms: 'WMSLayer',

  arcgis_online: 'ArcGISOnlineLayer',
  arcgis_server: 'ArcGISServerLayer',
  arcgis_enterprise: 'ArcGISEnterpriseLayer'
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