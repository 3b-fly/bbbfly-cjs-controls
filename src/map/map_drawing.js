/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage mapbox
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.drawing = {
  _leafletPrefix: 'bbbfly_map_drawing_lf-',
  _packagePrefix: 'bbbfly_map_drawing-',

  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  core: {},
  item: {
    style:{},
    iconstyle: {},
    geometrystyle: {}
  },
  cluster: {
    listener : {}
  },
  handler: {
    listener : {}
  }
};

/** @ignore */
bbbfly.map.drawing.utils.LeafletId = function(obj){
  var id = Object.isObject(obj) ? L.stamp(obj) : null;
  return Number.isInteger(id) ? bbbfly.map.drawing._leafletPrefix+id : id;
};

/** @ignore */
bbbfly.map.drawing.utils.DrawingId = function(options){
  var id = (options) ? options.ID : null;
  if(String.isString(id)){return id;}

  id = bbbfly.map.drawing._packagePrefix;
  return id+(++bbbfly.map.drawing._lastId);
};

/** @ignore */
bbbfly.map.drawing.utils.NormalizeGeoJSON = function(json){
  var features = [];

  var multiToSingle = function(feature,newType){
    if(!feature || !feature.geometry){return;}

    if(Array.isArray(feature.geometry.coordinates)){
      for(var i in feature.geometry.coordinates){
        features.push({
          type: 'Feature',
          properties: feature.properties,
          geometry: {
            type: newType,
            coordinates: feature.geometry.coordinates[i]
          }
        });
      }
    }
  };

  var normalizeCollection = function(json){
    if(!Object.isObject(json)){return;}

    switch(json.type){
      case 'FeatureCollection':
        if(Array.isArray(json.features)){
          for(var i in json.features){
            var feature = json.features[i];
            normalizeCollection(feature);
          }
        }
      break;
      case 'Feature':
        if(Object.isObject(json.geometry)){
          switch(json.geometry.type){
            case 'MultiLineString':
              multiToSingle(json,'LineString');
            break;
            case 'MultiPolygon':
              multiToSingle(json,'Polygon');
            break;
            case 'MultiPoint':
              multiToSingle(json,'Point');
            break;
            default:
              features.push(json);
            break;
          }
        }
      break;
    }
  };

  normalizeCollection(json);

  return {
    type: 'FeatureCollection',
    features: features
  };
};

/** @ignore */
bbbfly.map.drawing.utils.DenormalizeGeoJSON = function(json){
  var features = [];

  var lines = [];
  var polygons = [];
  var points = [];

  var multiToStack = function(geometry,stack){
    if(Array.isArray(geometry.coordinates)){
      for(var i in geometry.coordinates){
        stack.push(geometry.coordinates[i]);
      }
    }
  };

  var singleToStack = function(geometry,stack){
    if(Array.isArray(geometry.coordinates)){
      stack.push(geometry.coordinates);
    }
  };

  var normalizeCollection = function(json){
    if(!Object.isObject(json)){return;}

    switch(json.type){
      case 'FeatureCollection':
        if(Array.isArray(json.features)){
          for(var i in json.features){
            var feature = json.features[i];
            normalizeCollection(feature);
          }
        }
      break;
      case 'Feature':
        if(Object.isObject(json.geometry)){
          switch(json.geometry.type){
            case 'MultiLineString':
              multiToStack(json.geometry,lines);
            break;
            case 'MultiPolygon':
              multiToStack(json.geometry,polygons);
            break;
            case 'MultiPoint':
              multiToStack(json.geometry,points);
            break;
            case 'LineString':
              singleToStack(json.geometry,lines);
            break;
            case 'Polygon':
              singleToStack(json.geometry,polygons);
            break;
            case 'Point':
              singleToStack(json.geometry,points);
            break;
            default:
              features.push(json);
            break;
          }
        }
      break;
    }
  };

  normalizeCollection(json);

  if(lines.length > 0){
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: lines
      }
    });
  }

  if(polygons.length > 0){
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: polygons
      }
    });
  }

  if(points.length > 0){
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPoint',
        coordinates: points
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features: features
  };
};

/** @ignore */
bbbfly.map.drawing.utils.InitMouseEvents = function(layer,prefix,callback){
  if(!(layer instanceof L.Layer)){return;}
  if(!String.isString(prefix)){prefix = '';}

  if(!Function.isFunction(callback)){
    callback = bbbfly.map.drawing.layer._onMouseEvent;
  }

  layer.on(prefix+'mouseover',callback);
  layer.on(prefix+'mouseout',callback);
  layer.on(prefix+'click',callback);
  layer.on(prefix+'dblclick',callback);
  layer.on(prefix+'contextmenu',callback);
};

/** @ignore */
bbbfly.map.drawing.layer._onMouseEvent = function(event){
  var drawing = event.target.Owner;

  var callback = null;
  switch(event.type){
    case 'mouseover':
    case 'clustermouseover':
      callback = drawing.OnMouseEnter;
    break;
    case 'mouseout':
    case 'clustermouseout':
      callback = drawing.OnMouseLeave;
    break;
    case 'click':
    case 'clusterclick':
      callback = drawing.OnClick;
    break;
    case 'dblclick':
    case 'clusterdblclick':
      callback = drawing.OnDblClick;
    break;
    case 'contextmenu':
    case 'clustercontextmenu':
      callback = drawing.OnRightClick;
    break;
  }

  if(Function.isFunction(callback)){
    callback.apply(drawing,[event.sourceTarget]);
  }
};

/** @ignore */
bbbfly.map.drawing.core._initialize = function(){
  if(this._Initialized){return true;}

  if(!Function.isFunction(this.Create)){return false;}
  var layer = this.Create();

  if(Object.isObject(layer)){
    if(!this.DoInitialize(layer)){return false;}
  }
  else if(Array.isArray(layer)){
    for(var i in layer){
      if(!this.DoInitialize(layer[i])){return false;}
    }
  }
  else{
    return false;
  }

  this._Initialized = true;
  return true;
};

/** @ignore */
bbbfly.map.drawing.core._doInitialize = function(layer,prefix){
  if(!(layer instanceof L.Layer)){return false;}
  if(!String.isString(prefix)){prefix = '';}

  bbbfly.map.drawing.utils.InitMouseEvents(layer,prefix);

  L.Util.stamp(layer);
  layer.Owner = this;
  this._Layers.push(layer);

  return true;
};

bbbfly.map.drawing.core._checkEmpty = function(){
  if(this._Layers.length > 0){return false;}

  if(Function.isFunction(this.OnEmpty)){
    this.OnEmpty();
  }
  return true;
};

/** @ignore */
bbbfly.map.drawing.core._dispose = function(){
  var feature = this._ParentFeature;

  if(feature){
    this.Scan(function(layer){
      layer.removeFrom(feature);
    });
  }

  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
};

/** @ignore */
bbbfly.map.drawing.core._setHandler = function(handler){
  if(!(handler instanceof bbbfly.MapDrawingsHandler)){return false;}

  if(this._Handler && (this._Handler !== handler)){
    if(!this._Handler.RemoveDrawing(this)){return false;}
  }

  this._Handler = handler;
  return true;
};

/** @ignore */
bbbfly.map.drawing.core._addTo = function(feature){
  if(this._ParentFeature){return false;}

  if(
    (feature instanceof L.FeatureGroup)
    && this.Initialize()
  ){
    this._ParentFeature = feature;

    this.Scan(function(layer){
      layer.addTo(feature);
    });

    if(Function.isFunction(this.Update)){
      this.Update();
    }
    return true;
  }

  return false;
};

/** @ignore */
bbbfly.map.drawing.core._removeFrom = function(feature){
  if(!feature){feature = this._ParentFeature;}
  if(feature !== this._ParentFeature){return false;}

  this.Scan(function(layer){
    layer.removeFrom(feature);
  });

  this._ParentFeature = null;
  return true;
};

/** @ignore */
bbbfly.map.drawing.core._removeLayer = function(layer){
  if(layer instanceof L.Layer){
    var feature = this._ParentFeature;
    var cnt = this._Layers.length;

    for(var i=cnt-1;i>=0;i--){
      var childLayer = this._Layers[i];
      if(childLayer !== layer){continue;}

      if(feature){childLayer.removeFrom(feature);}
      this._Layers.splice(i,1);
      return true;
    }
  }

  return false;
};

/** @ignore */
bbbfly.map.drawing.core._scan = function(callback,def){
  if(!Boolean.isBoolean(def)){def = false;}

  if(Function.isFunction(callback)){
    var cnt = this._Layers.length;

    for(var i=cnt-1;i>=0;i--){
      var layer = this._Layers[i];
      var val = callback(layer,i,this._Layers);

      if(Boolean.isBoolean(val)){
        return val;
      }
    }
  }
  return def;
};

/** @ignore */
bbbfly.map.drawing.item._create = function(){
  var geom = this.Options.Geometry;
  var point = this.Options.Point;

  var hasGeom = Object.isObject(geom);
  var hasPoint = (point instanceof L.LatLng);

  var pointToCenter = this.Options.PointToGeoCenter;
  if(!Boolean.isBoolean(pointToCenter)){pointToCenter = false;}

  var showGeom = this.Options.ShowGeometry;
  if(!Boolean.isBoolean(showGeom)){showGeom = true;}

  this._GeoJSON = null;
  this._Marker = null;
  var layers = [];

  if(hasGeom){
    geom = bbbfly.map.drawing.utils.NormalizeGeoJSON(geom);
    var geometry = new L.GeoJSON(geom);

    if(showGeom){
      var gLayers = geometry.getLayers();
      var gStyle = this.GetGeometryStyle();

      var state = this.GetState();
      var style = gStyle ? gStyle.GetStyle(state) : null;

      for(var i in gLayers){
        var layer = gLayers[i];

        if(layer instanceof L.Path){
          layer.options.Owner = this;

          ng_OverrideMethod(
            layer,'_project',
            bbbfly.map.drawing.item._projectGeometry
          );

          if(style){layer.setStyle(style);}
          layers.push(layer);
        }
      }
    }

    this._GeoJSON = geometry;
  }

  if(!hasPoint && pointToCenter){
    point = this.GetGeometryCenter();
    if(point){hasPoint = true;}
  }

  if(hasPoint){
    var marker = L.marker(point,{
      riseOnHover: true,
      riseOffset: 999999
    });

    ng_OverrideMethod(
      marker,'_updateZIndex',
      bbbfly.map.drawing.item._updateIconZIndex
    );

    this._Marker = marker;
    layers.push(marker);
  }

  return layers;
};

/** @ignore */
bbbfly.map.drawing.item._updateIconZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};

/** @ignore */
bbbfly.map.drawing.item._projectGeometry = function(){
  this._project.callParent();

  var node = this.getElement();
  if(!node){return;}

  var drawing = this.options.Owner;
  var minSize = drawing.Options.MinGeometrySize;

  if(!Number.isInteger(minSize)){
    var handler = drawing._Handler;
    minSize = handler.Options.MinGeometrySize;
    if(!Number.isInteger(minSize)){minSize = 0;}
  }

  var geomSize = drawing.GetGeometrySize();
  if((geomSize <= 0) || (geomSize < minSize)){
    node.style.display = 'none';
    return;
  }

  node.style.display = 'block';
};

/** @ignore */
bbbfly.map.drawing.item._update = function(){
  var showGeom = this.Options.ShowGeometry;
  var state = this.GetState();

  if(this._Marker){
    var iStyle = this.GetIconStyle();
    var style = iStyle ? iStyle.GetStyle(state) : null;

    var over = state.mouseover;
    state.mouseover = false;

    var proxy = bbbfly.Renderer.StackProxy(style.images,state,this.ID+'_I');
    var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg');

    this._IconProxy = proxy;
    state.mouseover = over;

    if(html !== this._IconHtml){
      this._IconHtml = html;

      var icon = new L.DivIcon({
        iconSize: [proxy.W,proxy.H],
        iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
        className: style.className,
        html: html
      });

      this._Marker.setIcon(icon);

      if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
    }
  }

  if(this._GeoJSON && showGeom){
    var gLayers = this._GeoJSON.getLayers();
    var gStyle = this.GetGeometryStyle();

    if(gStyle){
      var style = gStyle.GetStyle(state);

      for(var i in gLayers){
        var layer = gLayers[i];

        if(layer instanceof L.Path){
          layer.setStyle(style);
        }
      }
    }
  }

  this.UpdateTooltip();
};

/** @ignore */
bbbfly.map.drawing.item._dispose = function(){
  if(this._Tooltip){this._Tooltip.Dispose();}
  this.Dispose.callParent();
};

/** @ignore */
bbbfly.map.drawing.item._getPoint = function(){
  return this._Marker ? this._Marker.getLatLng() : null;
};

/** @ignore */
bbbfly.map.drawing.item._getGeometry = function(){
  return this._GeoJSON ? this._GeoJSON.toGeoJSON() : null;
};

/** @ignore */
bbbfly.map.drawing.item._newIcon = function(state,id){
    if(!String.isString(id)){id = bbbfly.map.drawing.utils.DrawingId();}

    var iStyle = this.GetIconStyle();
    var style = iStyle ? iStyle.GetStyle(state) : null;

    var proxy = bbbfly.Renderer.StackProxy(style.images,state,id+'_I');
    var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg');

    return new L.DivIcon({
      iconSize: [proxy.W,proxy.H],
      iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
      className: style.className,
      html: html
    });
};

/** @ignore */
bbbfly.map.drawing.item._getIconStyle = function(){
  var type = bbbfly.MapDrawingItem.IconStyle;

  var iStyle = this.Options.IconStyle;
  if(iStyle instanceof type){return iStyle;}

  if(String.isString(iStyle)){
    iStyle = bbbfly.MapDrawingItem.Style.Get(iStyle);
  }

  return (iStyle instanceof type) ? iStyle : new type();
};

/** @ignore */
bbbfly.map.drawing.item._getGeometryStyle = function(){
  var type = bbbfly.MapDrawingItem.GeometryStyle;

  var gStyle = this.Options.GeometryStyle;
  if(gStyle instanceof type){return gStyle;}

  if(String.isString(gStyle)){
    gStyle = bbbfly.MapDrawingItem.Style.Get(gStyle);
  }

  return (gStyle instanceof type) ? gStyle : new type();
};

/** @ignore */
bbbfly.map.drawing.item._getGeometryCenter = function(){
  if(this._GeoJSON){
    var bounds = this._GeoJSON.getBounds();

    if(bounds.isValid()){
      var center = bounds.getCenter();
      return new L.LatLng(center.lat,center.lng);
    }
  }
  return null;
};

/** @ignore */
bbbfly.map.drawing.item._getGeometrySize = function(){
  if(!this._ParentFeature){return 0;}

  var map = this._ParentFeature._map;
  var geometry = this._GeoJSON;

  if(!map || !geometry){return 0;}
  var bounds = geometry.getBounds();

  var pxBounds = new L.Bounds(
    map.latLngToLayerPoint(bounds.getSouthWest()),
    map.latLngToLayerPoint(bounds.getNorthEast())
  );

  if(pxBounds && pxBounds.isValid()){
    var boundsSize = pxBounds.getSize();

    var size = 0;
    if(boundsSize.x){size += Math.pow(boundsSize.x,2);}
    if(boundsSize.y){size += Math.pow(boundsSize.y,2);}
    return Math.ceil(Math.sqrt(size));
  }

  return 0;
};

/** @ignore */
bbbfly.map.drawing.item._removeIcon = function(marker){
  if(marker && (marker !== this._Marker)){return false;}
  if(!this.RemoveLayer(this._Marker)){return false;}

  this._Marker = null;
  this.CheckEmpty();
  return true;
};

/** @ignore */
bbbfly.map.drawing.item._removeGeometry = function(layer){
  if(layer && !(layer instanceof L.Path)){return false;}
  if(!this._GeoJSON){return false;}

  if(layer){
    if(!this._GeoJSON.hasLayer(layer)){return false;}
    if(!this.RemoveLayer(layer)){return false;}

    this._GeoJSON.removeLayer(layer);
  }
  else{
    var layers = this._GeoJSON.getLayers();

    for(var i in layers){
      layer = layers[i];

      if(!this.RemoveLayer(layer)){return false;}
      this._GeoJSON.removeLayer(layer);
    };
  }

  this.CheckEmpty();
  return true;
};

/** @ignore */
bbbfly.map.drawing.item._setState = function(state,update){
  if(!Object.isObject(state)){return false;}
  var changed = false;

  for(var stateName in state){
    var stateConst = bbbfly.MapDrawingItem.state[stateName];
    var stateValue = state[stateName];

    if(!Number.isInteger(stateConst)){continue;}
    if(!Boolean.isBoolean(stateValue)){continue;}

    if(this.SetStateValue(stateConst,stateValue,false)){
      changed = true;
    }
  }

  if(changed && update){this.Update();}
  return changed;
};

/** @ignore */
bbbfly.map.drawing.item._getState = function(){
  var state = {
    mouseover: this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover),
    disabled: this.GetStateValue(bbbfly.MapDrawingItem.state.disabled),
    readonly: this.GetStateValue(bbbfly.MapDrawingItem.state.readonly),
    selected: this.GetStateValue(bbbfly.MapDrawingItem.state.selected),
    grayed: this.GetStateValue(bbbfly.MapDrawingItem.state.grayed)
  };

  if(state.disabled || state.readonly){
    state.mouseover = false;
  }
  return state;
};

/** @ignore */
bbbfly.map.drawing.item._getStateValue = function(state){
  return !!(this._State & state);
};

/** @ignore */
bbbfly.map.drawing.item._setStateValue = function(state,value,update){
  var hasState = !!(this._State & state);
  if(value === hasState){return false;}

  if(value){this._State = (this._State | state);}
  else{this._State = (this._State ^ state);}

  if(update){this.Update();}
  return true;
};

/** @ignore */
bbbfly.map.drawing.item._getSelected = function(){
  return this.GetStateValue(bbbfly.MapDrawingItem.state.selected);
};

/** @ignore */
bbbfly.map.drawing.item._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(this.GetSelected() === selected){return false;}

  if(Function.isFunction(this.OnSetSelected)){
    if(!this.OnSetSelected(this)){return false;}
  }

  var state = bbbfly.MapDrawingItem.state.selected;
  if(!Boolean.isBoolean(update)){update = true;}

  if(!this.SetStateValue(state,selected,update)){
    return false;
  }

  if(Function.isFunction(this.OnSelectedChanged)){
    this.OnSelectedChanged(this);
  }

  return true;
};

/** @ignore */
bbbfly.map.drawing.item._updateTooltip = function(){
  var state = this.GetState();

  if(state.selected || state.mouseover){this.ShowTooltip();}
  else{this.HideTooltip();}
};

/** @ignore */
bbbfly.map.drawing.item._showTooltip = function(){
  if(!this._Tooltip && this.Options.TooltipOptions){
    this._Tooltip = new bbbfly.MapTooltip(
      this.Options.TooltipOptions
    );
  }

  if(this._Tooltip){
    var layer = this._Marker || this._GeoJSON;
    this._Tooltip.Show(layer);
  }
};

/** @ignore */
bbbfly.map.drawing.item._hideTooltip = function(){
  if(this._Tooltip){this._Tooltip.Hide();}
};

/** @ignore */
bbbfly.map.drawing.item._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,true);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
  this.UpdateTooltip();
};

/** @ignore */
bbbfly.map.drawing.item._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,false);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
  this.UpdateTooltip();
};

/** @ignore */
bbbfly.map.drawing.item._onClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawingItem.selecttype.click)){
    this.SetSelected(!this.GetSelected(),true);
  }
};

/** @ignore */
bbbfly.map.drawing.item._onDblClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawingItem.selecttype.dblclick)){
    this.SetSelected(!this.GetSelected(),true);
  }
};

/** @ignore */
bbbfly.map.drawing.item.style._getClassName = function(suffix){
  return String.isString(suffix)
    ? this.BaseClassName+suffix
    : this.BaseClassName;
};

/** @ignore */
bbbfly.map.drawing.item.iconstyle._getImages = function(){
  if(!Object.isObject(this.Options)){return null;}

  var imgs = this.Options.Images;
  return Array.isArray(imgs) ? imgs : null;
};

/** @ignore */
bbbfly.map.drawing.item.iconstyle._getStyle = function(){
  return {
    images: this.GetImages(),
    className: this.GetClassName()
  };
};

/** @ignore */
bbbfly.map.drawing.item.geometrystyle._getStyle = function(state){
  var style = {
    weight: 1,
    color: '#000000',
    opacity: 1,
    fillColor: null,
    fillOpacity: 0.2,
    className: this.GetClassName()
  };

  var opts = this.Options;
  if(Object.isObject(opts)){
    var lWidth = bbbfly.Renderer.GetStateValue(opts,state,'LineWidth');
    var lColor = bbbfly.Renderer.GetStateValue(opts,state,'LineColor');
    var lOpacity = bbbfly.Renderer.GetStateValue(opts,state,'LineOpacity');
    var fColor = bbbfly.Renderer.GetStateValue(opts,state,'FillColor');
    var fOpacity = bbbfly.Renderer.GetStateValue(opts,state,'FillOpacity');

    if(Number.isInteger(lWidth)){style.weight = lWidth;}
    if(String.isString(lColor)){style.color = lColor;}
    if(Number.isNumber(lOpacity)){style.opacity = lOpacity;}
    if(String.isString(fColor)){style.fillColor = fColor;}
    if(Number.isNumber(fOpacity)){style.fillOpacity = fOpacity;}
  }

  style.stroke = !!((style.weight > 0) && (style.opacity > 0));
  style.fill = !!(style.fillColor && (style.fillOpacity > 0));

  return style;
};

/** @ignore */
bbbfly.map.drawing.cluster._create = function(){
  var sStyle = this.GetSpiderStyle();
  var drawing = this;

  var getMaxClusterRadius = function(){
    return bbbfly.map.drawing.cluster._maxClusterRadius(drawing);
  };

  var group = new L.MarkerClusterGroup({
    iconCreateFunction: bbbfly.map.drawing.cluster._createIcon,
    maxClusterRadius: getMaxClusterRadius,

    spiderLegPolylineOptions: sStyle,
    spiderfyOnMaxZoom: !!sStyle,

    removeOutsideVisibleBounds: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  group.on('spiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);
  group.on('unspiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);

  var fgroup = group._featureGroup;
  if(fgroup instanceof L.FeatureGroup){

    fgroup.on('layeradd',bbbfly.map.drawing.cluster._onClusterLayerAdd);
    fgroup.on('layerremove',bbbfly.map.drawing.cluster._onClusterLayerRemove);
  }

  this._ClusterGroup = group;

  return [group];
};

/** @ignore */
bbbfly.map.drawing.cluster._update = function(){
  if(this._ClusterGroup){this._ClusterGroup.refreshClusters();}
};

/** @ignore */
bbbfly.map.drawing.cluster._getState = function(cluster,def){
  var state = {};

  if(cluster instanceof L.MarkerCluster){
    var markers = cluster.getAllChildMarkers();

    for(var i in markers){
      var marker = markers[i];

      if(marker.Owner instanceof bbbfly.MapDrawingItem){
        var selected = marker.Owner.GetStateValue(
          bbbfly.MapDrawingItem.state.selected
        );

        if(selected){
          state.selected = true;
          break;
        }
      }
    }
  }

  if(Object.isObject(def)){
    ng_MergeVarReplace(state,def,true);
  }
  return state;
};

/** @ignore */
bbbfly.map.drawing.cluster._doInitialize = function(layer){
  return this.DoInitialize.callParent(layer,'cluster');
};

/** @ignore */
bbbfly.map.drawing.cluster._onMouseEnter = function(cluster){
  var state = this.GetState(cluster,{mouseover:true});
  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  bbbfly.Renderer.UpdateStackHTML(cluster._iconProxy,state,id);
};

/** @ignore */
bbbfly.map.drawing.cluster._onMouseLeave = function(cluster){
  var state = this.GetState(cluster,{mouseover:false});
  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  bbbfly.Renderer.UpdateStackHTML(cluster._iconProxy,state,id);
};

/** @ignore */
bbbfly.map.drawing.cluster._createIcon = function(cluster){
  var drawing = cluster._group.Owner;
  var childCnt = cluster.getChildCount();

  var state = drawing.GetState(cluster);
  var iStyle = drawing.GetIconStyle(childCnt);
  var style = iStyle ? iStyle.GetStyle(state) : null;


  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  var proxy = bbbfly.Renderer.StackProxy(style.images,state);
  var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg',id);

  var showNumber = drawing.Options.ShowNumber;
  if(!Boolean.isBoolean(showNumber)){showNumber = true;}

  if(showNumber){
    var imgCnt = Array.isArray(proxy.Imgs) ? proxy.Imgs.length : 0;

    var textStyle = {
      'display': 'block',
      'position': 'absolute',
      'text-align': 'center',
      'padding': bbbfly.Renderer.StyleDim(0),
      'margin': bbbfly.Renderer.StyleDim(0),
      'z-index': (imgCnt+1).toString()
    };

    textStyle = bbbfly.Renderer.StyleToString(textStyle);
    html += '<span id="'+id+'_T" class="MapIconText"'+textStyle+'>'
        +childCnt
      +'</span>';
  }

  cluster._iconProxy = proxy;

  return L.divIcon({
      iconSize: [proxy.W,proxy.H],
      iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
      className: style.className,
      html: html
    });
};

/** @ignore */
bbbfly.map.drawing.cluster._maxClusterRadius = function(drawing){
  var radius = drawing.Options.MaxClusterRadius;

  if(!Number.isInteger(radius)){
    var handler = drawing._Handler;
    radius = handler.Options.MaxClusterRadius;
  }
  if(!Number.isInteger(radius)){radius = null;}
  return radius;
};

/** @ignore */
bbbfly.map.drawing.cluster._onSpiderfyChanged = function(event){
  this.Owner.UpdateTooltip(event.cluster);
  this.Owner.Update();
};

/** @ignore */
bbbfly.map.drawing.cluster.listener._onSelectedChanged = function(drawing){
  var group = this.Owner._ClusterGroup;
  var marker = drawing._Marker;

  if(group && marker){
    var cluster = group.getVisibleParent(marker);
    this.Owner.UpdateTooltip(cluster);
  }
  this.Owner.Update();
};

/** @ignore */
bbbfly.map.drawing.cluster._onClusterLayerAdd = function(event){
  if(!(event.layer instanceof L.MarkerCluster)){return;}

  var drawing = event.layer._group.Owner;
  drawing.UpdateTooltip(event.layer);
};

/** @ignore */
bbbfly.map.drawing.cluster._onClusterLayerRemove = function(event){
  if(!(event.layer instanceof L.MarkerCluster)){return;}

  var drawing = event.layer._group.Owner;
  drawing.HideTooltip(event.layer);
};

/** @ignore */
bbbfly.map.drawing.cluster._getIconStyle = function(cnt){
  var type = bbbfly.MapDrawingItem.IconStyle;

  var iStyle = this.Options.IconStyle;
  if(iStyle instanceof type){return iStyle;}

  if(Array.isArray(iStyle) && Number.isInteger(cnt)){
    for(var i in iStyle){
      var styleDef = iStyle[i];
      var from = Number.isInteger(styleDef.from) ? styleDef.from : null;
      var to = Number.isInteger(styleDef.to) ? styleDef.to : null;

      if(
        ((from === null) || (cnt >= from))
        && ((to === null) || (cnt <= to))
      ){
        iStyle = styleDef.style;
        break;
      }
    }
  }

  if(String.isString(iStyle)){
    iStyle = bbbfly.MapDrawingItem.Style.Get(iStyle);
  }

  return (iStyle instanceof type) ? iStyle : new type();
};

/** @ignore */
bbbfly.map.drawing.cluster._getSpiderStyle = function(){
  var type = bbbfly.MapDrawingItem.GeometryStyle;

  var sStyle = this.Options.SpiderStyle;
  if(sStyle instanceof type){return sStyle;}

  if(String.isString(sStyle)){
    sStyle = bbbfly.MapDrawingItem.Style.Get(sStyle);
  }

  return (sStyle instanceof type) ? sStyle : new type();
};

/** @ignore */
bbbfly.map.drawing.cluster._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  if(this._DrawingListener){
    drawing.AddListener(
      this._DrawingListener.Listen,
      this._DrawingListener
    );
  }

  return this.Scan(function(layer){
    if(drawing.AddTo(layer)){return true;}
  },false);
};

/** @ignore */
bbbfly.map.drawing.cluster._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  if(this._DrawingListener){
    drawing.RemoveListener(
      this._DrawingListener.Listen,
      this._DrawingListener
    );
  }

  return this.Scan(function(layer){
    if(drawing.RemoveFrom(layer)){return true;}
  },false);
};

/** @ignore */
bbbfly.map.drawing.cluster._getTooltipOptions = function(cluster){

  if(cluster instanceof L.MarkerCluster){
    var markers = cluster.getAllChildMarkers();

    for(var i in markers){
      var marker = markers[i];

      if(marker.Owner instanceof bbbfly.MapDrawingItem){
        var selected = marker.Owner.GetStateValue(
          bbbfly.MapDrawingItem.state.selected
        );

        if(selected){
          var opts = this.Options.TooltipOptions;
          opts = opts ? ng_CopyVar(opts) : {};

          if(marker.Owner.Options.TooltipOptions){
            ng_MergeVar(opts,marker.Owner.Options.TooltipOptions);
          }
          return opts;
        }
      }
    }
  }
  return null;
};

/** @ignore */
bbbfly.map.drawing.cluster._updateTooltip = function(cluster){
  if(!(cluster instanceof L.MarkerCluster)){return;}

  var spiderfied = (cluster._group._spiderfied === cluster);
  if(spiderfied){this.HideTooltip(cluster);}
  else{this.ShowTooltip(cluster);}
};

/** @ignore */
bbbfly.map.drawing.cluster._showTooltip = function(cluster){
  if(!(cluster instanceof L.MarkerCluster)){return;}

  this.HideTooltip(cluster);
  var opts = this.GetTooltipOptions(cluster);

  if(Object.isObject(opts)){
    var tooltip = new bbbfly.MapTooltip(opts);
    if(tooltip){tooltip.Show(cluster);}
  }
};

/** @ignore */
bbbfly.map.drawing.cluster._hideTooltip = function(cluster){
  if(!(cluster instanceof L.MarkerCluster)){return;}

  cluster.closeTooltip();
  cluster.unbindTooltip();
};

/** @ignore */
bbbfly.map.drawing.handler._getDrawing = function(id){
  var drawing = this._Drawings[id];
  return (drawing instanceof bbbfly.MapDrawing) ? drawing : null;
};

/** @ignore */
bbbfly.map.drawing.handler._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  if(!String.isString(drawing.ID)){return false;}
  if(this._Drawings[drawing.ID]){return false;}
  if(!drawing.SetHandler(this)){return false;}

  var added = (this._CurrentCluster)
    ? this._CurrentCluster.AddDrawing(drawing)
    : drawing.AddTo(this._Feature);

  if(!added){return false;}

  if(drawing instanceof bbbfly.MapDrawingItem){
    drawing.AddListener(
      this._DrawingListener.Listen,
      this._DrawingListener
    );
  }

  this._Drawings[drawing.ID] = drawing;
  return true;
};

/** @ignore */
bbbfly.map.drawing.handler._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  if(drawing !== this._Drawings[drawing.ID]){return false;}

  if(drawing.RemoveFrom()){
    delete(this._Drawings[drawing.ID]);

    if(drawing instanceof bbbfly.MapDrawingItem){
      drawing.RemoveListener(
        this._DrawingListener.Listen,
        this._DrawingListener
      );
    }

    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.drawing.handler._getDrawings = function(){
  return this._Drawings;
};


/** @ignore */
bbbfly.map.drawing.handler._clearDrawings = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing.RemoveFrom()){
      delete(this._Drawings[id]);
      drawing.Dispose();
    }
  }
};

/** @ignore */
bbbfly.map.drawing.handler._getPoints = function(){
  var points = [];

  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing instanceof bbbfly.MapDrawingItem){
      var point = drawing.GetPoint();

      if(point instanceof L.LatLng){
        points.push(point);
      }
    }
  }
  return points;
};

/** @ignore */
bbbfly.map.drawing.handler._getGeometry = function(){
  var features = [];

  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing instanceof bbbfly.MapDrawingItem){
      var geom = drawing.GetGeometry();

      if(geom && Array.isArray(geom.features)){
        for(var i in geom.features){
          features.push(geom.features[i]);
        }
      }
    }
  }

  if(features.length > 0){
    return bbbfly.map.drawing.utils.DenormalizeGeoJSON({
      type: 'FeatureCollection',
      features: features
    });
  }
  return null;
};

/** @ignore */
bbbfly.map.drawing.handler._clearIcons = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];
    drawing.RemoveIcon();
  }
};

/** @ignore */
bbbfly.map.drawing.handler._clearGeometries = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];
    drawing.RemoveGeometry();
  }
};

/** @ignore */
bbbfly.map.drawing.handler._beginClustering = function(cluster){
  if(!cluster){return;}

  cluster.Initialize();
  this._CurrentCluster = cluster;
};

/** @ignore */
bbbfly.map.drawing.handler._endClustering = function(){
  if(!this._CurrentCluster){return false;}

  var cluster = this._CurrentCluster;
  this._CurrentCluster = null;

  return this.AddDrawing(cluster);
};

/** @ignore */
bbbfly.map.drawing.handler._select = function(drawing,selected){
  if(String.isString(drawing)){drawing = this.GetDrawing(drawing);}
  if(!(drawing instanceof bbbfly.MapDrawingItem)){return false;}

  this.BeginSelecting();

  if(!Boolean.isBoolean(selected)){selected = true;}
  drawing.SetSelected(selected,true);

  this.EndSelecting();
  return true;
};

/** @ignore */
bbbfly.map.drawing.handler._setSelected = function(drawings){
  if(!Array.isArray(drawings)){return false;}

  this.BeginSelecting();
  var setIds = {};

  for(var i in drawings){
    var drawing = drawings[i];

    if(String.isString(drawing)){drawing = this.GetDrawing(drawing);}
    if(!(drawing instanceof bbbfly.MapDrawingItem)){continue;}

    drawing.SetSelected(true,true);
    setIds[drawing.ID] = true;
  }

  for(var id in this._Selected){
    var drawing = this._Selected[id];
    if(setIds[id]){continue;}

    if(drawing instanceof bbbfly.MapDrawingItem){
      drawing.SetSelected(false,true);
    }
  }

  this.EndSelecting();
  return true;
};

/** @ignore */
bbbfly.map.drawing.handler._clearSelected = function(){
  this.BeginSelecting();

  for(var id in this._Selected){
    var drawing = this._Selected[id];

    if(drawing instanceof bbbfly.MapDrawingItem){
      drawing.SetSelected(false,true);
    }
  }

  this.EndSelecting();
};

/** @ignore */
bbbfly.map.drawing.handler._getSelected = function(selected){
  if(!Boolean.isBoolean(selected)){selected = true;}
  var drawings = [];

  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(
      (drawing instanceof bbbfly.MapDrawingItem)
      && (drawing.GetSelected() === selected)
    ){
      drawings.push(drawing);
    }
  }
  return drawings;
};

/** @ignore */
bbbfly.map.drawing.handler._beginSelecting = function(){
  this._IgnoreSelectChange++;
  this._SelectChanged = false;
};

/** @ignore */
bbbfly.map.drawing.handler._endSelecting = function(){
  if(--this._IgnoreSelectChange > 0){return;}

  if(this._SelectChanged){
    if(Function.isFunction(this.OnSelectedChanged)){
      this.OnSelectedChanged();
    }
  }

  this._SelectChanged = false;
  this._IgnoreSelectChange = 0;
};

/** @ignore */
bbbfly.map.drawing.handler.listener._onEmpty = function(){
  var drawing = this.EventSource;
  var handler = this.Owner;

  if(drawing && handler){
    delete(handler._Drawings[drawing.ID]);
    drawing.Dispose();
  }
};

/** @ignore */
bbbfly.map.drawing.handler.listener._onSetSelected = function(){
  var handler = this.Owner;

  switch(handler.Options.SelectType){
    case bbbfly.MapDrawingsHandler.selecttype.single:
    case bbbfly.MapDrawingsHandler.selecttype.multi:
      return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.drawing.handler.listener._onSelectedChanged = function(drawing){
  var handler = this.Owner;
  handler.BeginSelecting();

  if(drawing.GetSelected()){
    switch(handler.Options.SelectType){
      case bbbfly.MapDrawingsHandler.selecttype.single:
        handler.ClearSelected();
      case bbbfly.MapDrawingsHandler.selecttype.multi:
        handler._Selected[drawing.ID] = drawing;
      break;
    }
  }
  else{
    if(handler._Selected[drawing.ID] === drawing){
      delete(handler._Selected[drawing.ID]);
    }
  }

  handler._SelectChanged = true;
  handler.EndSelecting();
};

/**
 * @class
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawing.options} options
 *
 * @property {string|null} ID
 * @property {bbbfly.MapDrawing.options} Options
 */
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = {};}

  this.AddEvent = ngObjAddEvent;
  this.RemoveEvent = ngObjRemoveEvent;
  bbbfly.listener.SetListenable(this,true);

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;

  /** @private */
  this._Layers = [];
  /** @private */
  this._Handler = null;
  /** @private */
  this._ParentFeature = null;
  /** @private */
  this._Initialized = false;

  /** @private */
  this.Initialize = bbbfly.map.drawing.core._initialize;
  /** @private */
  this.DoInitialize = bbbfly.map.drawing.core._doInitialize;
  /** @private */
  this.CheckEmpty = bbbfly.map.drawing.core._checkEmpty;

  /**
   * @function
   * @abstract
   * @name Create
   * @memberof bbbfly.MapDrawing#
   *
   * @return {mapLayer|mapLayer[]} Leaflet layer
   *
   * @see {@link bbbfly.MapDrawing#Dispose|Dispose()}
   * @see {@link bbbfly.MapDrawing#Update|Update()}
   */
  this.Create = null;
  /**
   * @function
   * @abstract
   * @name Update
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#Create|Create()}
   * @see {@link bbbfly.MapDrawing#Dispose|Dispose()}
   */
  this.Update = null;
  /**
   * @function
   * @name Dispose
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#Create|Create()}
   * @see {@link bbbfly.MapDrawing#Update|Update()}
   */
  this.Dispose = bbbfly.map.drawing.core._dispose;
  /**
   * @function
   * @name AddTo
   * @memberof bbbfly.MapDrawing#
   *
   * @param {bbbfly.MapDrawingsHandler} handler
   * @return {boolean} If was set
   */
  this.SetHandler = bbbfly.map.drawing.core._setHandler;

  /**
   * @function
   * @name AddTo
   * @memberof bbbfly.MapDrawing#
   *
   * @param {mapFeature} feature - Feature to add drawing to
   * @return {boolean} If added properly
   *
   * @see {@link bbbfly.MapDrawing#RemoveFrom|RemoveFrom()}
   */
  this.AddTo = bbbfly.map.drawing.core._addTo;
  /**
   * @function
   * @name RemoveFrom
   * @memberof bbbfly.MapDrawing#
   *
   * @param {mapFeature} [feature=undefined] - Feature to remove drawing from
   * @return {boolean} If removed properly
   *
   * @see {@link bbbfly.MapDrawing#AddTo|AddTo()}
   */
  this.RemoveFrom = bbbfly.map.drawing.core._removeFrom;
  /**
   * @function
   * @name RemoveLayer
   * @memberof bbbfly.MapDrawing#
   *
   * @param {mapLayer} layer - Layer to remove from drawing
   * @return {boolean} If removed
   */
  this.RemoveLayer = bbbfly.map.drawing.core._removeLayer;
  /**
   * @function
   * @name Scan
   * @memberof bbbfly.MapDrawing#
   *
   * @param {bbbfly.MapDrawing.scancallback} callback
   * @param {boolean} def - Default return value
   * @return {boolean} Scan result value
   */
  this.Scan = bbbfly.map.drawing.core._scan;

  /**
   * @event
   * @name OnEmpty
   * @memberof bbbfly.MapDrawing#
   */
  this.OnEmpty = null;
  /**
   * @event
   * @name OnMouseEnter
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#event:OnMouseLeave|OnMouseLeave}
   * @see {@link bbbfly.MapDrawing#event:OnClick|OnClick}
   * @see {@link bbbfly.MapDrawing#event:OnDblClick|OnDblClick}
   * @see {@link bbbfly.MapDrawing#event:OnRightClick|OnRightClick}
   */
  this.OnMouseEnter = null;
  /**
   * @event
   * @name OnMouseLeave
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#event:OnMouseEnter|OnMouseEnter}
   * @see {@link bbbfly.MapDrawing#event:OnClick|OnClick}
   * @see {@link bbbfly.MapDrawing#event:OnDblClick|OnDblClick}
   * @see {@link bbbfly.MapDrawing#event:OnRightClick|OnRightClick}
   */
  this.OnMouseLeave = null;

  /**
   * @event
   * @name OnClick
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#event:OnMouseEnter|OnMouseEnter}
   * @see {@link bbbfly.MapDrawing#event:OnMouseLeave|OnMouseLeave}
   * @see {@link bbbfly.MapDrawing#event:OnDblClick|OnDblClick}
   * @see {@link bbbfly.MapDrawing#event:OnRightClick|OnRightClick}
   */
  this.OnClick = null;
  /**
   * @event
   * @name OnDblClick
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#event:OnMouseEnter|OnMouseEnter}
   * @see {@link bbbfly.MapDrawing#event:OnMouseLeave|OnMouseLeave}
   * @see {@link bbbfly.MapDrawing#event:OnClick|OnClick}
   * @see {@link bbbfly.MapDrawing#event:OnRightClick|OnRightClick}
   */
  this.OnDblClick = null;
  /**
   * @event
   * @name OnRightClick
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#event:OnMouseEnter|OnMouseEnter}
   * @see {@link bbbfly.MapDrawing#event:OnMouseLeave|OnMouseLeave}
   * @see {@link bbbfly.MapDrawing#event:OnClick|OnClick}
   * @see {@link bbbfly.MapDrawing#event:OnDblClick|OnDblClick}
   */
  this.OnRightClick = null;
};

/**
 * @class
 * @extends bbbfly.MapDrawing
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawingItem.options} options
 *
 * @property {string|null} ID
 * @property {bbbfly.MapDrawingItem.options} Options
 */
bbbfly.MapDrawingItem = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){

    bbbfly.MapDrawing.call(this,options);

    /** @private */
    this._State = 0;
    /** @private */
    this._Marker = null;
    /** @private */
    this._IconProxy = null;
    /** @private */
    this._IconHtml = '';
    /** @private */
    this._GeoJSON = null;
    /** @private */
    this._Tooltip = null;

    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.item._create
    );
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.item._update
    );
    ng_OverrideMethod(this,'Dispose',
      bbbfly.map.drawing.item._dispose
    );

    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.item._onMouseEnter
    );
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.item._onMouseLeave
    );
    ng_OverrideMethod(this,'OnClick',
      bbbfly.map.drawing.item._onClick
    );
    ng_OverrideMethod(this,'OnDblClick',
      bbbfly.map.drawing.item._onDblClick
    );

    /**
     * @function
     * @name GetPoint
     * @memberof bbbfly.MapDrawing#
     *
     * @return {mapPoint}
     */
    this.GetPoint = bbbfly.map.drawing.item._getPoint;
      /**
     * @function
     * @name GetGeometry
     * @memberof bbbfly.MapDrawing#
     *
     * @return {GeoJSON|null}
     */
    this.GetGeometry = bbbfly.map.drawing.item._getGeometry;

    /**
     * @function
     * @name NewIcon
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {bbbfly.Renderer.state} state
     * @return {mapIcon}
     */
    this.NewIcon = bbbfly.map.drawing.item._newIcon;

    /**
     * @function
     * @name GetIconStyle
     * @memberof bbbfly.MapDrawingItem#
     *
     * @return {bbbfly.MapDrawingItem.IconStyle}
     */
    this.GetIconStyle = bbbfly.map.drawing.item._getIconStyle;
    /**
     * @function
     * @name GetGeometryStyle
     * @memberof bbbfly.MapDrawingItem#
     *
     * @return {bbbfly.MapDrawingItem.GeometryStyle}
     */
    this.GetGeometryStyle = bbbfly.map.drawing.item._getGeometryStyle;

    /**
     * @function
     * @name GetGeometryCenter
     * @memberof bbbfly.MapDrawingItem#
     *
     * @return {number[]|null}
     */
    this.GetGeometryCenter = bbbfly.map.drawing.item._getGeometryCenter;
    /**
     * @function
     * @name GetGeometrySize
     * @memberof bbbfly.MapDrawingItem#
     *
     * @return {px}
     */
    this.GetGeometrySize = bbbfly.map.drawing.item._getGeometrySize;

    /**
     * @function
     * @name RemoveIcon
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {mapMarker} [marker=undefined]
     * @return {boolean} If removed
     */
    this.RemoveIcon = bbbfly.map.drawing.item._removeIcon;
    /**
     * @function
     * @name RemoveGeometry
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {mapGeometry} [layer=undefined] - Do not pass to remove all
     * @return {boolean} If removed
     */
    this.RemoveGeometry = bbbfly.map.drawing.item._removeGeometry;

    /**
     * @function
     * @name SetState
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description Set drawing renderer state
     *
     * @param {bbbfly.Renderer.state} state
     * @param {boolean} [update=true] - If update control
     * @return {boolean} If value has changed
     *
     * @see {@link bbbfly.MapDrawingItem#GetState|GetState()}
     * @see {@link bbbfly.MapDrawingItem#GetStateValue|GetStateValue()}
     * @see {@link bbbfly.MapDrawingItem#SetStateValue|SetStateValue()}
     */
    this.SetState = bbbfly.map.drawing.item._setState;
    /**
     * @function
     * @name GetState
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description Get computed renderer state
     *
     * @return {bbbfly.Renderer.state}
     *
     * @see {@link bbbfly.MapDrawingItem#SetState|SetState()}
     * @see {@link bbbfly.MapDrawingItem#GetStateValue|GetStateValue()}
     * @see {@link bbbfly.MapDrawingItem#SetStateValue|SetStateValue()}
     */
    this.GetState = bbbfly.map.drawing.item._getState;
    /**
     * @function
     * @name GetStateValue
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description Get drawing state value
     *
     * @param {bbbfly.MapDrawingItem.state} state
     * @return {boolean} Value
     *
     * @see {@link bbbfly.MapDrawingItem#GetState|GetState()}
     * @see {@link bbbfly.MapDrawingItem#SetStateValue|SetStateValue()}
     */
    this.GetStateValue = bbbfly.map.drawing.item._getStateValue;
    /**
     * @function
     * @name SetStateValue
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description Set drawing state value
     *
     * @param {bbbfly.MapDrawingItem.state} state
     * @param {boolean} [value=false] - Value to set
     * @param {boolean} [update=true] - If update control
     * @return {boolean} If value has changed
     *
     * @see {@link bbbfly.MapDrawingItem#GetState|GetState()}
     * @see {@link bbbfly.MapDrawingItem#GetStateValue|GetStateValue()}
     */
    this.SetStateValue = bbbfly.map.drawing.item._setStateValue;
      /**
     * @function
     * @name GetSelected
     * @memberof bbbfly.MapDrawingItem#
     *
     * @return {boolean} Value
     *
     * @see {@link bbbfly.MapDrawingItem#SetSelected|SetSelected()}
     * @see {@link bbbfly.MapDrawingItem#event:OnSetSelected|OnSetSelected}
     * @see {@link bbbfly.MapDrawingItem#event:OnSelectedChanged|OnSelectedChanged}
     */
    this.GetSelected = bbbfly.map.drawing.item._getSelected;
    /**
     * @function
     * @name SetSelected
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {boolean} [selected=true] - Value to set
     * @param {boolean} [update=true] - If update control
     * @return {boolean} If state has changed
     *
     * @see {@link bbbfly.MapDrawingItem#GetSelected|GetSelected()}
     * @see {@link bbbfly.MapDrawingItem#event:OnSetSelected|OnSetSelected}
     * @see {@link bbbfly.MapDrawingItem#event:OnSelectedChanged|OnSelectedChanged}
     */
    this.SetSelected = bbbfly.map.drawing.item._setSelected;

    /**
     * @function
     * @name UpdateTooltip
     * @memberof bbbfly.MapDrawingItem#
     *
     * @see {@link bbbfly.MapDrawingItem#ShowTooltip|ShowTooltip()}
     * @see {@link bbbfly.MapDrawingItem#HideTooltip|HideTooltip()}
     */
    this.UpdateTooltip = bbbfly.map.drawing.item._updateTooltip;
    /**
     * @function
     * @name ShowTooltip
     * @memberof bbbfly.MapDrawingItem#
     *
     * @see {@link bbbfly.MapDrawingItem#UpdateTooltip|UpdateTooltip()}
     * @see {@link bbbfly.MapDrawingItem#HideTooltip|HideTooltip()}
     */
    this.ShowTooltip = bbbfly.map.drawing.item._showTooltip;
    /**
     * @function
     * @name HideTooltip
     * @memberof bbbfly.MapDrawingItem#
     *
     * @see {@link bbbfly.MapDrawingItem#UpdateTooltip|UpdateTooltip()}
     * @see {@link bbbfly.MapDrawingItem#ShowTooltip|ShowTooltip()}
     */
    this.HideTooltip = bbbfly.map.drawing.item._hideTooltip;

    /**
     * @event
     * @name OnSetSelected
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {bbbfly.MapDrawingItem} drawing
     *
     * @see {@link bbbfly.MapDrawingItem#SetSelected|SetSelected()}
     * @see {@link bbbfly.MapDrawingItem#GetSelected|GetSelected()}
     * @see {@link bbbfly.MapDrawingItem#event:OnSelectedChanged|OnSelectedChanged}
     */
    this.OnSetSelected = null;
    /**
     * @event
     * @name OnSelectedChanged
     * @memberof bbbfly.MapDrawingItem#
     *
     * @param {bbbfly.MapDrawingItem} drawing
     *
     * @see {@link bbbfly.MapDrawingItem#SetSelected|SetSelected()}
     * @see {@link bbbfly.MapDrawingItem#GetSelected|GetSelected()}
     * @see {@link bbbfly.MapDrawingItem#event:OnSetSelected|OnSetSelected}
     */
    this.OnSelectedChanged = null;

    this.SetState(this.Options.State);
    return this;
  }
);

/**
 * @class
 * @memberof bbbfly.MapDrawingItem
 *
 * @inpackage mapbox
 */
bbbfly.MapDrawingItem.Style = function(){
  /** @private */
  this.BaseClassName = 'bbbfly.MapDrawingItem';

  /**
     * @function
     * @name GetClassName
     * @memberof bbbfly.MapDrawingItem.Style#
     *
     * @param {string} [suffix=undefined] - Drawing part class name
     * @return {string} Drawing class name
     */
    this.GetClassName = bbbfly.map.drawing.item.style._getClassName;
};

/**
 * @function
 * @name Get
 * @memberof bbbfly.MapDrawingItem.Style
 * @static
 *
 * @param {string} id
 * @return {bbbfly.MapDrawingItem.Style|null}
 *
 * @see {@link bbbfly.MapDrawingItem.Style.Define|Define()}
 */
bbbfly.MapDrawingItem.Style.Get = function(id){
  if(String.isString(id)){
    var style = bbbfly.map.drawing._styles[id];
    if(style instanceof bbbfly.MapDrawingItem.Style){
      return style;
    }
  }
  return null;
};

/**
 * @function
 * @name Define
 * @memberof bbbfly.MapDrawingItem.Style
 * @static
 *
 * @param {string} id
 * @param {bbbfly.MapDrawingItem.Style} style
 * @return {boolean} - If defined
 *
 * @see {@link bbbfly.MapDrawingItem.Style.Get|Get()}
 */
bbbfly.MapDrawingItem.Style.Define = function(id,style){
  if(!(style instanceof bbbfly.MapDrawingItem.Style)){return false;}
  if(!String.isString(id)){return false;}

  var stack = bbbfly.map.drawing._styles;
  if((typeof stack[id] !== 'undefined')){
    return false;
  }

  stack[id] = style;
  return true;
};

/**
 * @class
 * @memberof bbbfly.MapDrawingItem
 * @extends bbbfly.MapDrawingItem.Style
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawingItem.IconStyle.options} options
 *
 * @property {bbbfly.MapDrawingItem.IconStyle.options} Options
 */
bbbfly.MapDrawingItem.IconStyle = bbbfly.object.Extend(
  bbbfly.MapDrawingItem.Style,function(options){
    bbbfly.MapDrawingItem.Style.call(this);

    /** @private */
    this.BaseClassName = 'bbbfly.MapDrawingItem.Icon';
    /** @private */
    this.Options = options;

    /**
     * @function
     * @name GetImages
     * @memberof bbbfly.MapDrawingItem.IconStyle#
     *
     * @return {bbbfly.Renderer.image[]|null} images
     */
    this.GetImages = bbbfly.map.drawing.item.iconstyle._getImages;

    /**
     * @function
     * @name GetStyle
     * @memberof bbbfly.MapDrawingItem.IconStyle#
     *
     * @param {bbbfly.Renderer.state} state
     * @return {object} style
     */
    this.GetStyle = bbbfly.map.drawing.item.iconstyle._getStyle;
  }
);

/**
 * @class
 * @memberof bbbfly.MapDrawingItem
 * @extends bbbfly.MapDrawingItem.Style
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawingItem.GeometryStyle.options} options
 *
 * @property {bbbfly.MapDrawingItem.GeometryStyle.options} Options
 */
bbbfly.MapDrawingItem.GeometryStyle = bbbfly.object.Extend(
  bbbfly.MapDrawingItem.Style,function(options){

    bbbfly.MapDrawingItem.Style.call(this);

    /** @private */
    this.BaseClassName = 'bbbfly.MapDrawingItem.Geometry';
    /** @private */
    this.Options = options;

    /**
     * @function
     * @name GetStyle
     * @memberof bbbfly.MapDrawingItem.GeometryStyle#
     *
     * @param {bbbfly.Renderer.state} state
     * @return {object} style
     */
    this.GetStyle = bbbfly.map.drawing.item.geometrystyle._getStyle;
  }
);

/**
 * @enum {bitmask}
 *
 * @description Supported {@link bbbfly.Renderer.state|renderer states}
 */
bbbfly.MapDrawingItem.state = {
  mouseover: 1,
  disabled: 2,
  readonly: 4,
  selected: 8,
  grayed: 16
};

/**
 * @enum {bitmask}
 */
bbbfly.MapDrawingItem.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};

/**
 * @class
 * @extends bbbfly.MapDrawing
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawingCluster.options} options
 *
 * @property {bbbfly.MapDrawingCluster.options} Options
 */
bbbfly.MapDrawingCluster = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){

    bbbfly.MapDrawing.call(this,options);

    /** @private */
    this._ClusterGroup = null;

    /** @private */
    this._DrawingListener = {
      Owner: this,
      Listen: ['OnSelectedChanged'],
      OnSelectedChanged: bbbfly.map.drawing.cluster.listener._onSelectedChanged
    };

    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.cluster._create
    );
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.cluster._update
    );
    ng_OverrideMethod(this,'DoInitialize',
      bbbfly.map.drawing.cluster._doInitialize
    );

    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.cluster._onMouseEnter
    );
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.cluster._onMouseLeave
    );

    /**
     * @function
     * @name GetState
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {mapCluster} cluster
     * @param {bbbfly.Renderer.state} def - State default values
     * @return {bbbfly.Renderer.state} Drawing state
     */
    this.GetState = bbbfly.map.drawing.cluster._getState;

    /**
     * @function
     * @name GetIconStyle
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {integer} cnt - Child markers count
     * @return {bbbfly.MapDrawingItem.IconStyle}
     */
    this.GetIconStyle = bbbfly.map.drawing.cluster._getIconStyle;
    /**
     * @function
     * @name GetSpiderStyle
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @return {bbbfly.MapDrawingItem.GeometryStyle}
     */
    this.GetSpiderStyle = bbbfly.map.drawing.cluster._getSpiderStyle;

    /**
     * @function
     * @name AddDrawing
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {bbbfly.MapDrawing} drawing
     * @return {boolean} - If added
     */
    this.AddDrawing = bbbfly.map.drawing.cluster._addDrawing;
    /**
     * @function
     * @name AddDrawing
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {bbbfly.MapDrawing} drawing
     * @return {boolean} - If removed
     */
    this.RemoveDrawing = bbbfly.map.drawing.cluster._removeDrawing;
    /**
     * @function
     * @name GetTooltipOptions
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {mapCluster} cluster
     * @return {bbbfly.MapTooltip.options|null} - selected inner merker tooltip options
     *
     * @see {@link bbbfly.MapDrawingCluster#UpdateTooltip|UpdateTooltip()}
     * @see {@link bbbfly.MapDrawingCluster#ShowTooltip|ShowTooltip()}
     * @see {@link bbbfly.MapDrawingCluster#HideTooltip|HideTooltip()}
     */
    this.GetTooltipOptions = bbbfly.map.drawing.cluster._getTooltipOptions;
    /**
     * @function
     * @name UpdateTooltip
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {mapCluster} cluster
     *
     * @see {@link bbbfly.MapDrawingCluster#ShowTooltip|ShowTooltip()}
     * @see {@link bbbfly.MapDrawingCluster#HideTooltip|HideTooltip()}
     */
    this.UpdateTooltip = bbbfly.map.drawing.cluster._updateTooltip;
    /**
     * @function
     * @name ShowTooltip
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {mapCluster} cluster
     *
     * @see {@link bbbfly.MapDrawingCluster#UpdateTooltip|UpdateTooltip()}
     * @see {@link bbbfly.MapDrawingCluster#HideTooltip|HideTooltip()}
     */
    this.ShowTooltip = bbbfly.map.drawing.cluster._showTooltip;
    /**
     * @function
     * @name HideTooltip
     * @memberof bbbfly.MapDrawingCluster#
     *
     * @param {mapCluster} cluster
     *
     * @see {@link bbbfly.MapDrawingCluster#UpdateTooltip|UpdateTooltip()}
     * @see {@link bbbfly.MapDrawingCluster#ShowTooltip|ShowTooltip()}
     */
    this.HideTooltip = bbbfly.map.drawing.cluster._hideTooltip;

    return this;
  }
);

/**
 * @class
 * @inpackage mapbox
 *
 * @param {mapFeature} feature
 * @param {bbbfly.MapDrawingsHandler.options} options
 *
 * @property {bbbfly.MapDrawingsHandler.options} Options
 */
bbbfly.MapDrawingsHandler = function(feature,options){
  if(!(feature instanceof L.FeatureGroup)){return null;}
  if(!Object.isObject(options)){options = {};}

  this.AddEvent = ngObjAddEvent;
  this.RemoveEvent = ngObjRemoveEvent;
  bbbfly.listener.SetListenable(this,true);

  this.Options = options;

  /** @private */
  this._Feature = feature;
  /** @private */
  this._Drawings = {};
  /** @private */
  this._Selected = {};
  /** @private */
  this._CurrentCluster = null;
  /** @private */
  this._IgnoreSelectChange = 0;
  /** @private */
  this._SelectChanged = false;

  /** @private */
  this._DrawingListener = {
    Owner: this,
    Listen: ['OnEmpty','OnSetSelected','OnSelectedChanged'],
    OnEmpty: bbbfly.map.drawing.handler.listener._onEmpty,
    OnSetSelected: bbbfly.map.drawing.handler.listener._onSetSelected,
    OnSelectedChanged: bbbfly.map.drawing.handler.listener._onSelectedChanged
  };

  /**
   * @function
   * @name GetDrawing
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {string} id
   * @return {bbbfly.MapDrawing|null}
   */
  this.GetDrawing = bbbfly.map.drawing.handler._getDrawing;
  /**
   * @function
   * @name AddDrawing
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawing} drawing
   * @return {boolean} - If added
   */
  this.AddDrawing = bbbfly.map.drawing.handler._addDrawing;
  /**
   * @function
   * @name RemoveDrawing
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawing} drawing
   * @return {boolean} - If removed
   */
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;
    /**
   * @function
   * @name GetDrawings
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {string} id
   * @return {bbbfly.MapDrawing[]}
   */
  this.GetDrawings = bbbfly.map.drawing.handler._getDrawings;
  /**
   * @function
   * @name ClearDrawings
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Remove all drawings
   *
   * @see {@link bbbfly.MapDrawingsHandler#ClearIcons|ClearIcons()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearGeometries|ClearGeometries()}
   */
  this.ClearDrawings = bbbfly.map.drawing.handler._clearDrawings;

  /**
   * @function
   * @name GetPoints
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @return {mapPoint[]}
   */
  this.GetPoints = bbbfly.map.drawing.handler._getPoints;
    /**
   * @function
   * @name GetGeometry
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @return {GeoJSON|null}
   */
  this.GetGeometry = bbbfly.map.drawing.handler._getGeometry;
  /**
   * @function
   * @name ClearIcons
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Remove all drawing icons
   *
   * @see {@link bbbfly.MapDrawingsHandler#ClearDrawings|ClearDrawings()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearGeometries|ClearGeometries()}
   */
  this.ClearIcons = bbbfly.map.drawing.handler._clearIcons;
  /**
   * @function
   * @name ClearGeometries
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Remove all drawing geometries
   *
   * @see {@link bbbfly.MapDrawingsHandler#ClearDrawings|ClearDrawings()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearIcons|ClearIcons()}
   */
  this.ClearGeometries = bbbfly.map.drawing.handler._clearGeometries;

  /**
   * @function
   * @name BeginClustering
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawingCluster} cluster
   *
   * @see {@link bbbfly.MapDrawingsHandler#EndClustering|EndClustering()}
   */
  this.BeginClustering = bbbfly.map.drawing.handler._beginClustering;
  /**
   * @function
   * @name EndClustering
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @return {boolean} - If cluster was added
   *
   * @see {@link bbbfly.MapDrawingsHandler#BeginClustering|BeginClustering()}
   */
  this.EndClustering = bbbfly.map.drawing.handler._endClustering;

  /**
   * @function
   * @name Select
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Select drawing and locate it
   *
   * @param {string|bbbfly.MapDrawingItem} drawing - Drawing id or reference
   * @param {boolean} [selected=true] - If set selected or unselected
   *
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.Select = bbbfly.map.drawing.handler._select;
  /**
   * @function
   * @name SetSelected
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Set selected drawings
   *
   * @param {string[]|bbbfly.MapDrawingItem[]} drawings - Drawing ids or references
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.SetSelected = bbbfly.map.drawing.handler._setSelected;
  /**
   * @function
   * @name ClearSelected
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Unselect all drawings
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.ClearSelected = bbbfly.map.drawing.handler._clearSelected;
  /**
   * @function
   * @name GetSelected
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Get selected drawings
   *
   * @param {boolean} [selected=true] - If get selected or unselected
   * @return {bbbfly.MapDrawingItem[]} - Selected drawings
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.GetSelected = bbbfly.map.drawing.handler._getSelected;

  /**
   * @function
   * @name BeginSelecting
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description Begin "OnSelectedChanged" events grouping
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.BeginSelecting = bbbfly.map.drawing.handler._beginSelecting;

  /**
   * @function
   * @name EndSelecting
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @description End "OnSelectedChanged" events grouping
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.EndSelecting = bbbfly.map.drawing.handler._endSelecting;

  /**
   * @event
   * @name OnSelectedChanged
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @see {@link bbbfly.MapDrawingsHandler#Select|Select()}
   * @see {@link bbbfly.MapDrawingsHandler#SetSelected|SetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#BeginSelecting|BeginSelecting()}
   * @see {@link bbbfly.MapDrawingsHandler#EndSelecting|EndSelecting()}
   */
  this.OnSelectedChanged = null;
};

/**
 * @enum {integer}
 */
bbbfly.MapDrawingsHandler.selecttype = {
  none: 0,
  single: 1,
  multi: 2
};

/**
 * @typedef {function} scancallback
 * @memberOf bbbfly.MapDrawing
 *
 * @description Scans drawing Leaflet layers.
 *
 * @param {L.Layer} layer
 * @param {integer} index
 * @param {array} layers
 *
 * @return {boolean|undefind}
 *   Return boolean to stop scan and return that value
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawing
 *
 * @property {string} ID
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapDrawingItem
 *
 * @property {mapPoint} [Point=undefined]
 * @property {geoJSON} [Geometry=undefined]
 *
 * @property {bbbfly.MapDrawingItem.IconStyle|string} IconStyle
 * @property {bbbfly.MapDrawingItem.GeometryStyle|string} GeometryStyle
 * @property {bbbfly.MapTooltip.options} [TooltipOptions=undefined]
 *
 * @property {boolean} [PointToGeoCenter=false]
 * @property {px} [MinGeometrySize=undefined]
 * @property {boolean} [ShowGeometry=true]
 *
 * @property {bbbfly.MapDrawingItem.selecttype} [SelectType=none]
 * @property {bbbfly.Renderer.state} [State=undefined]
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapDrawingCluster
 *
 * @property {boolean} [ShowNumber=true]
 * @property {integer} [MaxClusterRadius=undefined]
 * @property {bbbfly.MapDrawingItem.IconStyle|string|array} IconStyle
 * @property {bbbfly.MapDrawingItem.GeometryStyle|string} SpiderStyle
 * @property {bbbfly.MapTooltip.options} [TooltipOptions=undefined]
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingsHandler
 *
 * @property {bbbfly.MapDrawingsHandler.selecttype} [SelectType=none]
 * @property {integer} [MaxClusterRadius=50]
 * @property {px} [MinGeometrySize=undefined]
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingItem.IconStyle
 *
 * @property {bbbfly.Renderer.image[]} [Images=null]
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingItem.GeometryStyle
 *
 * @property {integer|bbbfly.Renderer.statevalues} [LineWidth=1]
 * @property {string|bbbfly.Renderer.statevalues} [LineColor='#000000']
 * @property {number|bbbfly.Renderer.statevalues} [LineOpacity=1]
 * @property {string|bbbfly.Renderer.statevalues} [FillColor=null]
 * @property {number|bbbfly.Renderer.statevalues} [FillOpacity=0.2]
 */
