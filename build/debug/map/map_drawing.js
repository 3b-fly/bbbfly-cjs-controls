/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.drawing = {
  _leafletPrefix: 'bbbfly_map_drawing_lf-',
  _packagePrefix: 'bbbfly_map_drawing-',

  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  core: {},
  item: {},
  cluster: { listener : {} },
  handler: { listener : {} }
};
bbbfly.map.drawing.utils.LeafletId = function(obj){
  var id = Object.isObject(obj) ? L.stamp(obj) : null;
  return Number.isInteger(id) ? bbbfly.map.drawing._leafletPrefix+id : id;
};
bbbfly.map.drawing.utils.DrawingId = function(options){
  var id = (options) ? options.ID : null;
  if(String.isString(id)){return id;}

  id = bbbfly.map.drawing._packagePrefix;
  return id+(++bbbfly.map.drawing._lastId);
};
bbbfly.map.drawing.utils.NormalizeGeoJSON = function(json){
  var features = [];

  var multiToSingle = function(feature,newType){
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
  };;
};
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
bbbfly.map.drawing.core._setHandler = function(handler){
  if(!(handler instanceof bbbfly.MapDrawingsHandler)){return false;}

  if(this._Handler && (this._Handler !== handler)){
    if(!this._Handler.RemoveDrawing(this)){return false;}
  }

  this._Handler = handler;
  return true;
};
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
bbbfly.map.drawing.core._removeFrom = function(feature){
  if(!feature){feature = this._ParentFeature;}
  if(feature !== this._ParentFeature){return false;}

  this.Scan(function(layer){
    layer.removeFrom(feature);
  });

  this._ParentFeature = null;
  return true;
};
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

    var gLayers = geometry.getLayers();
    var gStyle = this.GetGeometryStyle();

    for(var i in gLayers){
      var layer = gLayers[i];

      if(layer instanceof L.Path){
        layer.options.Owner = this;

        ng_OverrideMethod(
          layer,'_project',
          bbbfly.map.drawing.item._projectGeometry
        );

        if(gStyle){layer.setStyle(gStyle);}
        if(showGeom){layers.push(layer);}
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
bbbfly.map.drawing.item._updateIconZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};
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
bbbfly.map.drawing.item._update = function(){
  var state = this.GetState();

  if(this._Marker){
    var iStyle = this.GetIconStyle();

    var over = state.mouseover;
    state.mouseover = false;

    var proxy = bbbfly.Renderer.StackProxy(iStyle.images,state,this.ID+'_I');
    var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg');

    this._IconProxy = proxy;
    state.mouseover = over;

    if(html !== this._IconHtml){
      this._IconHtml = html;

      var icon = new L.DivIcon({
        iconSize: [proxy.W,proxy.H],
        iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
        className: iStyle.className,
        html: html
      });

      this._Marker.setIcon(icon);

      if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
    }
  }

  this.UpdateTooltip();
};
bbbfly.map.drawing.item._dispose = function(){
  if(this._Tooltip){this._Tooltip.Dispose();}
  this.Dispose.callParent();
};
bbbfly.map.drawing.item._getPoint = function(){
  return this._Marker ? this._Marker.getLatLng() : null;
};
bbbfly.map.drawing.item._getGeometry = function(){
  return this._GeoJSON ? this._GeoJSON.toGeoJSON() : null;
};
bbbfly.map.drawing.item._newIcon = function(state,id){
    if(!String.isString(id)){id = bbbfly.map.drawing.utils.DrawingId();}

    var iStyle = this.GetIconStyle();
    var proxy = bbbfly.Renderer.StackProxy(iStyle.images,state,id+'_I');
    var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg');

    return new L.DivIcon({
      iconSize: [proxy.W,proxy.H],
      iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
      className: iStyle.className,
      html: html
    });
};
bbbfly.map.drawing.item._getIconStyle = function(){
  var type = bbbfly.MapDrawingItem.IconStyle;

  var iStyle = this.Options.IconStyle;
  if(iStyle instanceof type){return iStyle;}

  if(String.isString(iStyle)){
    iStyle = bbbfly.MapDrawingItem.Style.Get(iStyle);
  }

  return (iStyle instanceof type) ? iStyle : new type();
};
bbbfly.map.drawing.item._getGeometryStyle = function(){
  var type = bbbfly.MapDrawingItem.GeometryStyle;

  var gStyle = this.Options.GeometryStyle;
  if(gStyle instanceof type){return gStyle;}

  if(String.isString(gStyle)){
    gStyle = bbbfly.MapDrawingItem.Style.Get(gStyle);
  }

  return (gStyle instanceof type) ? gStyle : new type();
};
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
bbbfly.map.drawing.item._removeIcon = function(marker){
  if(marker && (marker !== this._Marker)){return false;}
  if(!this.RemoveLayer(this._Marker)){return false;}

  this._Marker = null;
  this.CheckEmpty();
  return true;
};
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
bbbfly.map.drawing.item._setState = function(state,update){
  if(!Object.isObject(state)){return;}

  for(var stateName in state){
    var stateConst = bbbfly.MapDrawingItem.state[stateName];
    var stateValue = state[stateName];

    if(!Number.isInteger(stateConst)){continue;}
    if(!Boolean.isBoolean(stateValue)){continue;}

    this.SetStateValue(stateConst,stateValue,false);
  }

  if(update){this.Update();}
};
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
bbbfly.map.drawing.item._getStateValue = function(state){
  return !!(this._State & state);
};
bbbfly.map.drawing.item._setStateValue = function(state,value,update){
  var hasState = !!(this._State & state);
  if(value === hasState){return false;}

  if(value){this._State = (this._State | state);}
  else{this._State = (this._State ^ state);}

  if(update){this.Update();}
  return true;
};
bbbfly.map.drawing.item._getSelected = function(){
  return this.GetStateValue(bbbfly.MapDrawingItem.state.selected);
};
bbbfly.map.drawing.item._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(this.GetSelected() === selected){return true;}

  if(Function.isFunction(this.OnSetSelected)){
    if(!this.OnSetSelected(this)){return false;}
  }

  var state = bbbfly.MapDrawingItem.state.selected;
  if(!Boolean.isBoolean(update)){update = true;}

  this.SetStateValue(state,selected,update);

  if(Function.isFunction(this.OnSelectedChanged)){
    this.OnSelectedChanged(this);
  }

  return true;
};
bbbfly.map.drawing.item._updateTooltip = function(){
  var state = this.GetState();

  if(state.selected || state.mouseover){this.ShowTooltip();}
  else{this.HideTooltip();}
};
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
bbbfly.map.drawing.item._hideTooltip = function(){
  if(this._Tooltip){this._Tooltip.Hide();}
};
bbbfly.map.drawing.item._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,true);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
  this.UpdateTooltip();
};
bbbfly.map.drawing.item._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,false);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
  this.UpdateTooltip();
};
bbbfly.map.drawing.item._onClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawingItem.selecttype.click)){
    this.SetSelected(!this.GetSelected(),true);
  }
};
bbbfly.map.drawing.item._onDblClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawingItem.selecttype.dblclick)){
    this.SetSelected(!this.GetSelected(),true);
  }
};
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

  this._ClusterGroup = group;

  return [group];
};
bbbfly.map.drawing.cluster._update = function(){
  if(this._ClusterGroup){this._ClusterGroup.refreshClusters();}
};
bbbfly.map.drawing.cluster._getState = function(cluster,def){
  var state = {};

  if(cluster instanceof L.MarkerCluster){
    var spiderfied = (cluster._group._spiderfied === cluster);

    if(!spiderfied){
      var markers = cluster.getAllChildMarkers();

      for(var i in markers){
        var marker = markers[i];

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
bbbfly.map.drawing.cluster._doInitialize = function(layer){
  return this.DoInitialize.callParent(layer,'cluster');
};
bbbfly.map.drawing.cluster._onMouseEnter = function(cluster){
  var state = this.GetState(cluster,{mouseover:true});
  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  bbbfly.Renderer.UpdateStackHTML(cluster._iconProxy,state,id);
};
bbbfly.map.drawing.cluster._onMouseLeave = function(cluster){
  var state = this.GetState(cluster,{mouseover:false});
  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  bbbfly.Renderer.UpdateStackHTML(cluster._iconProxy,state,id);
};
bbbfly.map.drawing.cluster._createIcon = function(cluster){
  var drawing = cluster._group.Owner;
  var childCnt = cluster.getChildCount();

  var iStyle = drawing.GetIconStyle(childCnt);
  var state = drawing.GetState(cluster);

  var id = bbbfly.map.drawing.utils.LeafletId(cluster);
  var proxy = bbbfly.Renderer.StackProxy(iStyle.images,state);
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
      className: iStyle.className,
      html: html
    });
};
bbbfly.map.drawing.cluster._maxClusterRadius = function(drawing){
  var radius = drawing.Options.MaxClusterRadius;

  if(!Number.isInteger(radius)){
    var handler = drawing._Handler;
    radius = handler.Options.MaxClusterRadius;
  }
  if(!Number.isInteger(radius)){radius = null;}
  return radius;
};
bbbfly.map.drawing.cluster._onSpiderfyChanged = function(){
  this.Owner.Update();
};

bbbfly.map.drawing.cluster.listener._onSelectedChanged = function(){
  this.Owner.Update();
};
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
bbbfly.map.drawing.cluster._getSpiderStyle = function(){
  var type = bbbfly.MapDrawingItem.GeometryStyle;

  var sStyle = this.Options.SpiderStyle;
  if(sStyle instanceof type){return sStyle;}

  if(String.isString(sStyle)){
    sStyle = bbbfly.MapDrawingItem.Style.Get(sStyle);
  }

  return (sStyle instanceof type) ? sStyle : new type();
};
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
bbbfly.map.drawing.handler._getDrawing = function(id){
  var drawing = this._Drawings[id];
  return (drawing instanceof bbbfly.MapDrawing) ? drawing : null;
};
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
bbbfly.map.drawing.handler._getDrawings = function(){
  return this._Drawings;
};
bbbfly.map.drawing.handler._clearDrawings = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing.RemoveFrom()){
      delete(this._Drawings[id]);
      drawing.Dispose();
    }
  }
};
bbbfly.map.drawing.handler._clearIcons = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];
    drawing.RemoveIcon();
  }
};
bbbfly.map.drawing.handler._clearGeometries = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];
    drawing.RemoveGeometry();
  }
};
bbbfly.map.drawing.handler._beginClustering = function(cluster){
  if(!cluster){return;}

  cluster.Initialize();
  this._CurrentCluster = cluster;
};
bbbfly.map.drawing.handler._endClustering = function(){
  if(!this._CurrentCluster){return false;}

  var cluster = this._CurrentCluster;
  this._CurrentCluster = null;

  return this.AddDrawing(cluster);
};
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
bbbfly.map.drawing.handler._clearSelected = function(){
  for(var id in this._Selected){
    var drawing = this._Selected[id];

    if(Function.isFunction(drawing.SetSelected)){
      drawing.SetSelected(false,true);
    }
  }
};
bbbfly.map.drawing.handler.listener._onEmpty = function(){
  var drawing = this.EventSource;
  var handler = this.Owner;

  if(drawing && handler){
    delete(handler._Drawings[drawing.ID]);
    drawing.Dispose();
  }
};
bbbfly.map.drawing.handler.listener._onSetSelected = function(){
  var handler = this.Owner;

  switch(handler.Options.SelectType){
    case bbbfly.MapDrawingsHandler.selecttype.single:
    case bbbfly.MapDrawingsHandler.selecttype.multi:
      return true;
  }
  return false;
};
bbbfly.map.drawing.handler.listener._onSelectedChanged = function(drawing){

  var handler = this.Owner;

  if(drawing.GetSelected()){
    switch(handler.Options.SelectType){
      case bbbfly.MapDrawingsHandler.selecttype.single:
        this._ignoreSelectChange = true;
        handler.ClearSelected();
        this._ignoreSelectChange = false;

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

  if(this._ignoreSelectChange){return;}
  if(Function.isFunction(handler.OnSelectedChanged)){
    handler.OnSelectedChanged();
  }
};
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = {};}

  this.AddEvent = ngObjAddEvent;
  this.RemoveEvent = ngObjRemoveEvent;
  bbbfly.listener.SetListenable(this,true);

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;
  this._Layers = [];
  this._Handler = null;
  this._ParentFeature = null;
  this._Initialized = false;
  this.Initialize = bbbfly.map.drawing.core._initialize;
  this.DoInitialize = bbbfly.map.drawing.core._doInitialize;
  this.CheckEmpty = bbbfly.map.drawing.core._checkEmpty;
  this.Create = null;
  this.Update = null;
  this.Dispose = bbbfly.map.drawing.core._dispose;
  this.SetHandler = bbbfly.map.drawing.core._setHandler;
  this.AddTo = bbbfly.map.drawing.core._addTo;
  this.RemoveFrom = bbbfly.map.drawing.core._removeFrom;
  this.RemoveLayer = bbbfly.map.drawing.core._removeLayer;
  this.Scan = bbbfly.map.drawing.core._scan;
  this.OnEmpty = null;
  this.OnMouseEnter = null;
  this.OnMouseLeave = null;
  this.OnClick = null;
  this.OnDblClick = null;
  this.OnRightClick = null;
};
bbbfly.MapDrawingItem = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){

    bbbfly.MapDrawing.call(this,options);
    this._State = 0;
    this._Marker = null;
    this._IconProxy = null;
    this._IconHtml = '';
    this._GeoJSON = null;
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
    this.GetPoint = bbbfly.map.drawing.item._getPoint;
    this.GetGeometry = bbbfly.map.drawing.item._getGeometry;
    this.NewIcon = bbbfly.map.drawing.item._newIcon;
    this.GetIconStyle = bbbfly.map.drawing.item._getIconStyle;
    this.GetGeometryStyle = bbbfly.map.drawing.item._getGeometryStyle;
    this.GetGeometryCenter = bbbfly.map.drawing.item._getGeometryCenter;
    this.GetGeometrySize = bbbfly.map.drawing.item._getGeometrySize;
    this.RemoveIcon = bbbfly.map.drawing.item._removeIcon;
    this.RemoveGeometry = bbbfly.map.drawing.item._removeGeometry;
    this.SetState = bbbfly.map.drawing.item._setState;
    this.GetState = bbbfly.map.drawing.item._getState;
    this.GetStateValue = bbbfly.map.drawing.item._getStateValue;
    this.SetStateValue = bbbfly.map.drawing.item._setStateValue;
    this.GetSelected = bbbfly.map.drawing.item._getSelected;
    this.SetSelected = bbbfly.map.drawing.item._setSelected;
    this.UpdateTooltip = bbbfly.map.drawing.item._updateTooltip;
    this.ShowTooltip = bbbfly.map.drawing.item._showTooltip;
    this.HideTooltip = bbbfly.map.drawing.item._hideTooltip;
    this.OnSetSelected = null;
    this.OnSelectedChanged = null;

    this.SetState(this.Options.State);
    return this;
  }
);
bbbfly.MapDrawingItem.Style = function(){};
bbbfly.MapDrawingItem.Style.Get = function(id){
  if(String.isString(id)){
    var style = bbbfly.map.drawing._styles[id];
    if(style instanceof bbbfly.MapDrawingItem.Style){
      return style;
    }
  }
  return null;
};
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
bbbfly.MapDrawingItem.IconStyle = bbbfly.object.Extend(
  bbbfly.MapDrawingItem.Style,function(images,className){

    if(!Array.isArray(images)){images = null;}
    if(!String.isString(className)){className = '';}

    this.images = images;
    this.className = className;
  }
);
bbbfly.MapDrawingItem.GeometryStyle = bbbfly.object.Extend(
  bbbfly.MapDrawingItem.Style,function(options){

    this.stroke = false;
    this.fill = false;
    this.weight = 1;

    this.color = '#000000';
    this.fillColor = null;

    this.opacity = 1;
    this.fillOpacity = 0.2;

    if(!Object.isObject(options)){return;}

    if(Number.isInteger(options.weight)){this.weight = options.weight;}

    if(String.isString(options.color)){this.color = options.color;}
    if(String.isString(options.fillColor)){this.fillColor = options.fillColor;}

    if(Number.isNumber(options.opacity)){this.opacity = options.opacity;}
    if(Number.isNumber(options.fillOpacity)){this.fillOpacity = options.fillOpacity;}

    this.stroke = !!((this.weight > 0) && (this.opacity > 0));
    this.fill = !!(this.fillColor && (this.fillOpacity > 0));
  }
);
bbbfly.MapDrawingItem.state = {
  mouseover: 1,
  disabled: 2,
  readonly: 4,
  selected: 8,
  grayed: 16
};
bbbfly.MapDrawingItem.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};
bbbfly.MapDrawingCluster = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){
    bbbfly.MapDrawing.call(this,options);
    this._ClusterGroup = null;
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
    this.GetState = bbbfly.map.drawing.cluster._getState;
    this.GetIconStyle = bbbfly.map.drawing.cluster._getIconStyle;
    this.GetSpiderStyle = bbbfly.map.drawing.cluster._getSpiderStyle;
    this.AddDrawing = bbbfly.map.drawing.cluster._addDrawing;
    this.RemoveDrawing = bbbfly.map.drawing.cluster._removeDrawing;

    return this;
  }
);
bbbfly.MapDrawingsHandler = function(feature,options){
  if(!(feature instanceof L.FeatureGroup)){return null;}
  if(!Object.isObject(options)){options = {};}

  this.AddEvent = ngObjAddEvent;
  this.RemoveEvent = ngObjRemoveEvent;
  bbbfly.listener.SetListenable(this,true);

  this.Options = options;
  this._Feature = feature;
  this._Drawings = {};
  this._Selected = {};
  this._CurrentCluster = null;
  this._DrawingListener = {
    Owner: this,
    Listen: ['OnEmpty','OnSetSelected','OnSelectedChanged'],
    OnEmpty: bbbfly.map.drawing.handler.listener._onEmpty,
    OnSetSelected: bbbfly.map.drawing.handler.listener._onSetSelected,
    OnSelectedChanged: bbbfly.map.drawing.handler.listener._onSelectedChanged
  };
  this.GetDrawing = bbbfly.map.drawing.handler._getDrawing;
  this.AddDrawing = bbbfly.map.drawing.handler._addDrawing;
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;
  this.GetDrawings = bbbfly.map.drawing.handler._getDrawings;
  this.ClearDrawings = bbbfly.map.drawing.handler._clearDrawings;
  this.ClearIcons = bbbfly.map.drawing.handler._clearIcons;
  this.ClearGeometries = bbbfly.map.drawing.handler._clearGeometries;
  this.BeginClustering = bbbfly.map.drawing.handler._beginClustering;
  this.EndClustering = bbbfly.map.drawing.handler._endClustering;
  this.GetSelected = bbbfly.map.drawing.handler._getSelected;
  this.ClearSelected = bbbfly.map.drawing.handler._clearSelected;
  this.OnSelectedChanged = null;
};
bbbfly.MapDrawingsHandler.selecttype = {
  none: 0,
  single: 1,
  multi: 2
};
