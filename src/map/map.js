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
bbbfly.map = {
  map: {}
};

/** @ignore */
bbbfly.map.map._onCreated = function(map){
  map.CreateMap();
  return true;
};

/** @ignore */
bbbfly.map.map._onUpdated = function(){
  var map = this.GetMap();
  if(map && (typeof map.invalidateSize === 'function')){
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

  //propagate initial state
  if(map.getZoom && this.OnZoomChanged){
    this.OnZoomChanged(map.getZoom());
  }
  return true;
};

/** @ignore */
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
  this.MaxBounds = bounds;

  var map = this.GetMap();
  if(map){map.setMaxBounds(bounds);}
  return true;
};

/** @ignore */
bbbfly.map.map._setMinZoom = function(zoom){
  if(Number.isNumber(zoom)){
    this.MinZoom = zoom;

    var map = this.GetMap();
    if(map){map.setMinZoom(zoom);}
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.map._setMaxZoom = function(zoom){
  if(Number.isNumber(zoom)){
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
bbbfly.map.map._onMapZoomEnd = function(event){
  var map = event.target;
  if(map && (typeof map.getZoom === 'function')){

    var widget = map.Owner;
    if(widget && (typeof widget.OnZoomChanged === 'function')){
      widget.OnZoomChanged(map.getZoom());
    }
  }
};

/**
 * @class
 * @type control
 * @extends ngGroup
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
 * @property {L.LatLngBounds} [MaxBounds=null]
 *   {@link http://leafletjs.com/reference-1.4.0.html#latlngbounds|Map pan limitation}
 * @property {number} [MinZoom=null] - Map minimal zoom level
 * @property {number} [MaxZoom=null] - Map maximal zoom level
 * @property {number} [Animate=true] - If map animation is allowed
 */
bbbfly.Map = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      MaxBounds: null,
      MinZoom: null,
      MaxZoom: null,
      Animate: true,

      /** @private */
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
      OnZoomChanged: null
    },
    Methods: {
      /** @private */
      Dispose: bbbfly.map.map._dispose,

      /**
       * @function
       * @name GetMap
       * @memberof bbbfly.Map#
       * @description Get Leaflet map
       *
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       */
      GetMap: bbbfly.map.map._getMap,
      /**
       * @function
       * @name CreateMap
       * @memberof bbbfly.Map#
       * @description Create Leaflet Map.
       *
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       */
      CreateMap: bbbfly.map.map._createMap,
      /**
       * @function
       * @name DoCreateMap
       * @memberof bbbfly.Map#
       * @description Create Leaflet Map.
       *
       * @param {object} options
       *   {@link https://leafletjs.com/reference-1.4.0.html#map-option/|Leaflet Map options}
       * @return {object}
       *   {@link http://leafletjs.com/reference-1.4.0.html#map-factory|Leaflet Map}
       */
      DoCreateMap: bbbfly.map.map._doCreateMap,
      /**
       * @function
       * @name DestroyMap
       * @memberof bbbfly.Map#
       * @description Destroy Leaflet map
       *
       * @return {boolean} If map was destroyed.
       */
      DestroyMap: bbbfly.map.map._destroyMap,

      /**
       * @function
       * @name SetMaxBounds
       * @memberof bbbfly.Map#
       * @description Set maximal map bounds
       *
       * @param {L.LatLngBounds} bounds
       * @return {boolean} If bounds were set.
       */
      SetMaxBounds: bbbfly.map.map._setMaxBounds,
      /**
       * @function
       * @name SetMinZoom
       * @memberof bbbfly.Map#
       * @description Set minimal map zoom level
       *
       * @param {number} zoom - Zoom level
       * @return {boolean} If zoom was set.
       */
      SetMinZoom: bbbfly.map.map._setMinZoom,
      /**
       * @function
       * @name SetMaxBounds
       * @memberof bbbfly.Map#
       * @description Set maximal map zoom level
       *
       * @param {number} zoom - Zoom level
       * @return {boolean} If zoom was set.
       */
      SetMaxZoom: bbbfly.map.map._setMaxZoom,
      /**
       * @function
       * @name EnableAnimation
       * @memberof bbbfly.Map#
       * @description Enable or disable map animation
       *
       * @param {boolean} enable
       * @return {boolean} If state has changed.
       */
      EnableAnimation: bbbfly.map.map._enableAnimation,

      /**
       * @function
       * @name SetView
       * @memberof bbbfly.Map#
       * @description Set map position and zoom level
       *
       * @param {L.LatLng|null} coordinates
       * @param {number|null} zoom - Zoom level
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
       * @description Set map zoom level
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
       * @description Get map zoom level
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
       * @description Zoom map in
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
       * @description Zoom map out
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
       * @description Set map position
       *
       * @param {L.LatLng} coordinates
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
       * @description Get map position
       *
       * @return {L.LatLng|null} coordinates
       *
       * @see {@link bbbfly.Map#SetView|SetView()}
       * @see {@link bbbfly.Map#SetCenter|SetCenter()}
       */
      GetCenter: bbbfly.map.map._getCenter
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_map'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Map',bbbfly.Map);
  }
};