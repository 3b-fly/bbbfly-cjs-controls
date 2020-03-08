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
  item: {},
  cluster: {},
  handler: {}
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
bbbfly.map.drawing.utils.IsLatLng = function(latLng){
  return (Array.isArray(latLng) || (latLng instanceof L.LatLng));
};

/** @ignore */
bbbfly.map.drawing.utils.NormalizeGeoJSON = function(json){
  if(!Object.isObject(json)){return null;}

  var multiToSingle = function(feature,newType,features){
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
  };

  var featureToSingle = function(feature,features){
    if(feature.geometry){
      switch(feature.geometry.type){
        case 'MultiLineString':
          multiToSingle(feature,'LineString',features);
        break;
        case 'MultiPolygon':
          multiToSingle(feature,'Polygon',features);
        break;
        default:
          features.push(feature);
        break;
      }
    }
  };

  var normalizeCollection = function(json){
    if(json.type === 'FeatureCollection'){
      var normalized = {
        type: json.type,
        features: []
      };

      if(Array.isArray(json.features)){
        for(var i in json.features){
          var feature = json.features[i];

          switch(feature.type){
            case 'FeatureCollection':
              normalized.features.push(
                normalizeCollection(feature)
              );
            break;
            case 'Feature':
              featureToSingle(
                feature,normalized.features
              );
            break;
          }
        }
      }
      return normalized;
    }
    return null;
  };

  return normalizeCollection(json);
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

/** @ignore */
bbbfly.map.drawing.core._dispose = function(){
  this.Scan(function(layer){
    layer.remove();
  });

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
    this.Scan(function(layer){
      layer.addTo(feature);
    });

    this._ParentFeature = feature;

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
bbbfly.map.drawing.core._getGeoJSON = function(){
  var json = [];

  for(var i in this._Layers){
    var layer = this._Layers[i];
    json.push(layer.toGeoJSON());
  }
  return json;
};

/** @ignore */
bbbfly.map.drawing.core._scan = function(callback,def){
  if(!Boolean.isBoolean(def)){def = false;}

  if(Function.isFunction(callback)){
    for(var i in this._Layers){
      var layer = this._Layers[i];
      var val = callback(layer);

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
  var coords = this.Options.Coords;

  var hasGeom = Object.isObject(geom);
  var hasCoords = bbbfly.map.drawing.utils.IsLatLng(coords);

  var coordsToCenter = this.Options.CoordsToGeoCenter;
  if(!Boolean.isBoolean(coordsToCenter)){coordsToCenter = true;}

  var showGeom = this.Options.ShowGeometry;
  if(!Boolean.isBoolean(showGeom)){showGeom = true;}

  this._Geometry = null;
  this._Marker = null;
  var layers = [];

  if(hasGeom){
    var gStyle = this.GetGeometryStyle();
    geom = bbbfly.map.drawing.utils.NormalizeGeoJSON(geom);

    var geometry = new L.GeoJSON(geom,{
      Owner: this,
      style: gStyle,
      onEachFeature: bbbfly.map.drawing.item._initGeometry
    });

    this._Geometry = geometry;
    if(showGeom){layers.push(geometry);}
  }

  if(!hasCoords && coordsToCenter){
    coords = this.GetGeometryCenter();
    if(coords){hasCoords = true;}
  }

  if(hasCoords){
    var marker = L.marker(coords,{
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
bbbfly.map.drawing.item._initGeometry = function(feature,layer){
  ng_OverrideMethod(
    layer,'_project',
    bbbfly.map.drawing.item._projectGeometry
  );
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

      var icon = L.divIcon({
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

/** @ignore */
bbbfly.map.drawing.item._dispose = function(){
  if(this._Tooltip){this._Tooltip.Dispose();}
  this.Dispose.callParent();
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
  if(this._Geometry){
    var bounds = this._Geometry.getBounds();

    if(bounds.isValid()){
      var center = bounds.getCenter();
      return [center.lat,center.lng];
    }
  }
  return null;
};

/** @ignore */
bbbfly.map.drawing.item._getGeometrySize = function(){
  if(!this._ParentFeature){return 0;}

  var map = this._ParentFeature._map;
  var geometry = this._Geometry;

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
bbbfly.map.drawing.item._getState = function(){
  var state = {
    mouseover: this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover),
    disabled: this.GetStateValue(bbbfly.MapDrawingItem.state.disabled),
    selected: this.GetStateValue(bbbfly.MapDrawingItem.state.selected),
    grayed: this.GetStateValue(bbbfly.MapDrawingItem.state.grayed)
  };

  if(state.disabled){
    state.mouseover = false;
    state.selected = false;
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

/** @ignore */
bbbfly.map.drawing.item._updateTooltip = function(){
  var state = this.GetState();

  if(state.selected || state.mouseover){this.ShowTooltip();}
  else{this.HideTooltip();}
};

/** @ignore */
bbbfly.map.drawing.item._showTooltip = function(){
  if(!this._Tooltip){
    this._Tooltip = new bbbfly.MapTooltip(
      this.Options.TooltipOptions
    );
  }

  var layer = this._Marker || this._Geometry;
  this._Tooltip.Show(layer);
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

/** @ignore */
bbbfly.map.drawing.cluster._update = function(){
  if(this._ClusterGroup){this._ClusterGroup.refreshClusters();}
};

/** @ignore */
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
bbbfly.map.drawing.cluster._onSpiderfyChanged = function(){
  this.Owner.Update();
};

bbbfly.map.drawing.cluster._onSelectedChanged = function(){
  this.Owner.Update();
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
bbbfly.map.drawing.handler._clearDrawings = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing.RemoveFrom()){
      delete(this._Drawings[id]);
    }
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
bbbfly.map.drawing.handler._clearSelected = function(){
  for(var id in this._Selected){
    var drawing = this._Selected[id];

    if(Function.isFunction(drawing.SetSelected)){
      drawing.SetSelected(false,true);
    }
  }
};

/** @ignore */
bbbfly.map.drawing.handler._onSetSelected = function(){
  var handler = this.Owner;

  switch(handler.Options.SelectType){
    case bbbfly.MapDrawingsHandler.selecttype.single:
    case bbbfly.MapDrawingsHandler.selecttype.multi:
      return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.drawing.handler._onSelectedChanged = function(drawing){

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
   * @name GetGeoJSON
   * @memberof bbbfly.MapDrawing#
   *
   * @return {GeoJSON}
   */
  this.GetGeoJSON = bbbfly.map.drawing.core._getGeoJSON;
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
    this._Geometry = null;
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
     * @name GetState
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description
     *   Get computed renderer state
     *
     * @return {bbbfly.Renderer.state} Drawing state
     *
     * @see {@link bbbfly.MapDrawingItem#GetStateValue|GetStateValue()}
     * @see {@link bbbfly.MapDrawingItem#SetStateValue|SetStateValue()}
     */
    this.GetState = bbbfly.map.drawing.item._getState;
    /**
     * @function
     * @name GetStateValue
     * @memberof bbbfly.MapDrawingItem#
     *
     * @description
     *   Get drawing state value
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
     * @description
     *   Set drawing state value
     *
     * @param {bbbfly.MapDrawingItem.state} state
     * @param {boolean} [value=false] Value
     * @param {boolean} [update=true]
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

    return this;
  }
);

/**
 * @class
 * @memberof bbbfly.MapDrawingItem
 *
 * @inpackage mapbox
 */
bbbfly.MapDrawingItem.Style = function(){};

/**
 * @function
 * @name Get
 * @memberof bbbfly.MapDrawingItem.Style
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
 * @param {bbbfly.Renderer.image[]} [images=undefined] - Stack of icon images
 * @param {string} [className=''] - Leaflet marker div class name
 *
 * @property {bbbfly.Renderer.image[]} [images=null]
 * @property {string} [className='']
 */
bbbfly.MapDrawingItem.IconStyle = bbbfly.object.Extend(
  bbbfly.MapDrawingItem.Style,function(images,className){

    if(!Array.isArray(images)){images = null;}
    if(!String.isString(className)){className = '';}

    this.images = images;
    this.className = className;
  }
);

/**
 * @class
 * @memberof bbbfly.MapDrawingItem
 * @extends bbbfly.MapDrawingItem.Style
 *
 * @inpackage mapbox
 *
 * @param {object} options
 * @param {integer} [options.weight=undefined]
 * @param {string} [options.color=undefined]
 * @param {string} [options.fillColor=undefined]
 * @param {number} [options.opacity=undefined]
 * @param {number} [options.fillOpacity=undefined]
 *
 * @property {boolean} fill
 * @property {boolean} stroke
 * @property {integer} [weight=1]
 * @property {string} [color='#000000']
 * @property {string} [fillColor=null]
 * @property {number} [opacity=1]
 * @property {number} [fillOpacity=0.2]
 */
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

/**
 * @enum {integer}
 * @description
 *   Supported {@link bbbfly.Renderer.state|renderer states}
 *
 */
bbbfly.MapDrawingItem.state = {
  mouseover: 1,
  disabled: 2,
  selected: 4,
  grayed: 8
};

/**
 * @enum {integer}
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
      OnSelectedChanged: bbbfly.map.drawing.cluster._onSelectedChanged
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
  this._DrawingListener = {
    Owner: this,
    Listen: ['OnSetSelected','OnSelectedChanged'],
    OnSetSelected: bbbfly.map.drawing.handler._onSetSelected,
    OnSelectedChanged: bbbfly.map.drawing.handler._onSelectedChanged
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
   * @name ClearDrawings
   * @memberof bbbfly.MapDrawingsHandler#
   * @description Remove all drawings
   */
  this.ClearDrawings = bbbfly.map.drawing.handler._clearDrawings;

  /**
   * @function
   * @name BeginClustering
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawingCluster} cluster
   */
  this.BeginClustering = bbbfly.map.drawing.handler._beginClustering;
  /**
   * @function
   * @name EndClustering
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @return {boolean} - If cluster was added
   */
  this.EndClustering = bbbfly.map.drawing.handler._endClustering;

  /**
   * @function
   * @name GetSelected
   * @memberof bbbfly.MapDrawingsHandler#
   * @description Get all drawings
   *
   * @param {boolean} [selected=true]
   *
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.GetSelected = bbbfly.map.drawing.handler._getSelected;
  /**
   * @function
   * @name ClearSelected
   * @memberof bbbfly.MapDrawingsHandler#
   * @description Unselect all drawings
   *
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#event:OnSelectedChanged|OnSelectedChanged}
   */
  this.ClearSelected = bbbfly.map.drawing.handler._clearSelected;

  /**
   * @event
   * @name OnSelectedChanged
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @see {@link bbbfly.MapDrawingsHandler#GetSelected|GetSelected()}
   * @see {@link bbbfly.MapDrawingsHandler#ClearSelected|ClearSelected()}
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
 * @property {mapPoint} [Coords=undefined]
 * @property {geoJSON} [Geometry=undefined]
 *
 * @property {bbbfly.MapDrawingItem.IconStyle|string} IconStyle
 * @property {bbbfly.MapDrawingItem.GeometryStyle|string} GeometryStyle
 * @property {bbbfly.MapTooltip.options} TooltipOptions
 *
 * @property {boolean} [CoordsToGeoCenter=true]
 * @property {px} [MinGeometrySize=undefined]
 * @property {boolean} [ShowGeometry=true]
 *
 * @property {bbbfly.MapDrawingItem.selecttype} [SelectType=none]
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapDrawingCluster
 *
 * @property {boolean} [ShowNumber=true]
 * @property {integer} [MaxClusterRadius=undefined]
 * @property {bbbfly.MapDrawingItem.IconStyle|string|array} IconStyle
 * @property {bbbfly.MapDrawingItem.GeometryStyle|string} SpiderStyle
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingsHandler
 *
 * @property {bbbfly.MapDrawingsHandler.selecttype} [SelectType=none]
 * @property {integer} [MaxClusterRadius=50]
 * @property {px} [MinGeometrySize=undefined]
 */
