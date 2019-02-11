/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = {
  map: {}
};
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

  if(this.MaxBounds){
    options.maxBounds = this.MaxBounds;
  }
  if(Number.isNumber(this.MinZoom)){
    options.minZoom = this.MinZoom;
    options.zoom = this.MinZoom;
  }
  if(Number.isNumber(this.MaxZoom)){
    options.maxZoom = this.MaxZoom;
  }

  var map = this.DoCreateMap(options);
  if(!map){return false;}
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
bbbfly.map.map._setCenter = function(coordinates){
  return this.SetView(coordinates,null);
};
bbbfly.map.map._getCenter = function(){
  var map = this.GetMap();
  if(map){return map.getCenter();}
  return null;
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
bbbfly.Map = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      MaxBounds: null,
      MinZoom: null,
      MaxZoom: null,
      Animate: true,
      _map: null
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
      GetCenter: bbbfly.map.map._getCenter
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_map'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Map',bbbfly.Map);
  }
};