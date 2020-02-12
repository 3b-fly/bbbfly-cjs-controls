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
  _leafletPrefix: 'lf-',

  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  core: {},
  item: {},
  icon: {},
  geometry: {},
  cluster: {},
  handler: {}
};

/** @ignore */
bbbfly.map.drawing.utils.LeafletId = function(obj){
  var id = Object.isObject(obj) ? obj._leaflet_id : null;
  return Number.isInteger(id) ? bbbfly.map.drawing._leafletPrefix+id : id;
};

/** @ignore */
bbbfly.map.drawing.utils.DrawingId = function(options){
  var id = (options) ? options.ID : null;
  return String.isString(id) ? id : '_'+(++bbbfly.map.drawing._lastId);
};

/** @ignore */
bbbfly.map.drawing.utils.GetDrawingStyle = function(style){
  if(String.isString(style)){
    style = bbbfly.map.drawing._styles[style];
    if(Object.isObject(style)){return style;}
  }
  return null;
};

/** @ignore */
bbbfly.map.drawing.utils.DefineDrawingStyle = function(id,style){
  if(!Object.isObject(style)){return false;}
  if(!String.isString(id)){return false;}

  var stack = bbbfly.map.drawing._styles;
  if((typeof stack[id] !== 'undefined')){return false;}

  stack[id] = style;
  return true;
};

/** @ignore */
bbbfly.map.drawing.utils.IsLatLng = function(latLng){
  return (Array.isArray(latLng) || (latLng instanceof L.LatLng));
};

/** @ignore */
bbbfly.map.drawing.utils.NormalizeGeoJSON = function(json){
  if(json && json.features){
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

    var newFeatures = [];

    for(var j in json.features){
      var feature = json.features[j];
      if(feature.geometry){
        switch(feature.geometry.type){
          case 'MultiLineString':
            multiToSingle(feature,'LineString',newFeatures);
          break;
          case 'MultiPolygon':
            multiToSingle(feature,'Polygon',newFeatures);
          break;
          default:
            newFeatures.push(feature);
          break;
        }
      }
    }
    json.features = newFeatures;
  }
  return json;
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
bbbfly.map.drawing.layer._updateZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawing.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};

/** @ignore */
bbbfly.map.drawing.core._initialize = function(){
  if(this._Initialized){return true;}

  if(!Function.isFunction(this.Create)){return false;}
  var layers = this.Create();

  if(Object.isObject(layers)){
    this.DoInitialize(layers);
  }
  else if(Array.isArray(layers)){
    for(var i in layers){
      this.DoInitialize(layers[i]);
    }
  }

  this._Initialized = true;
  return true;
};

/** @ignore */
bbbfly.map.drawing.core._doInitialize = function(layer,prefix){
  if(!(layer instanceof L.Layer)){return false;}
  if(!String.isString(prefix)){prefix = '';}

  bbbfly.map.drawing.utils.InitMouseEvents(layer,prefix);

  layer.Owner = this;
  L.Util.stamp(layer);
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
bbbfly.map.drawing.core._addTo = function(feature){
  if(this._ParentFeature){return false;}

  if(
    (feature instanceof L.FeatureGroup)
    || (feature instanceof L.MarkerClusterGroup)
  ){
    this.Initialize();

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

  if(feature === this._ParentFeature){
    this.Scan(function(layer){
      layer.removeFrom(feature);
    });

    this._ParentFeature = null;
    return true;
  }
  return false;
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
bbbfly.map.drawing.item._update = function(){
  if(!this.GetStateValue(bbbfly.MapDrawing.state.disabled)){
    if(
      this.GetStateValue(bbbfly.MapDrawing.state.mouseover)
      || this.GetStateValue(bbbfly.MapDrawing.state.selected)
    ){
//      this.ShowTooltip(); //TODO
    }
  }
//  this.HideTooltip(); //TODO
};

/** @ignore */
bbbfly.map.drawing.item._getStyle = function(type){
  var style = this.Options.Style;

  if(String.isString(style)){
    style = bbbfly.map.drawing.utils.GetDrawingStyle(style);
  }

  return (style instanceof type) ? style : new type();
};

/** @ignore */
bbbfly.map.drawing.item._getState = function(){
  var state = {
    mouseover: this.GetStateValue(bbbfly.MapDrawing.state.mouseover),
    disabled: this.GetStateValue(bbbfly.MapDrawing.state.disabled),
    selected: this.GetStateValue(bbbfly.MapDrawing.state.selected),
    grayed: this.GetStateValue(bbbfly.MapDrawing.state.grayed)
  };

  if(state.disabled){state.mouseover = false;}
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
  return this.GetStateValue(bbbfly.MapDrawing.state.selected);
};

/** @ignore */
bbbfly.map.drawing.item._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(this.GetSelected() === selected){return true;}
  if(!Boolean.isBoolean(update)){update = true;}

  var state = bbbfly.MapDrawing.state.selected;
  this.SetStateValue(state,selected,update);
  return true;
};

/** @ignore */
bbbfly.map.drawing.item._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,true);
};

/** @ignore */
bbbfly.map.drawing.item._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,false);
};

/** @ignore */
bbbfly.map.drawing.item._onClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawing.selecttype.click)){
    this.SetSelected(!this.GetSelected(),true);
  }
};

/** @ignore */
bbbfly.map.drawing.item._onDblClick = function(){
  if((this.Options.SelectType & bbbfly.MapDrawing.selecttype.dblclick)){
    this.SetSelected(!this.GetSelected(),true);
  }
};

/** @ignore */
bbbfly.map.drawing.icon._create = function(){
  var coords = this.Options.Coordinates;
  var marker = null;

  if(bbbfly.map.drawing.utils.IsLatLng(coords)){
    marker = L.marker(coords,{
      riseOnHover: true,
      riseOffset: 999999
    });

    ng_OverrideMethod(
      marker,'_updateZIndex',
      bbbfly.map.drawing.layer._updateZIndex
    );
  }

  return marker;
};

/** @ignore */
bbbfly.map.drawing.icon._update = function(){
  var style = this.GetStyle(bbbfly.MapIcon.Style);
  var state = this.GetState();

  var over = state.mouseover;
  state.mouseover = false;

  var proxy = bbbfly.Renderer.StackProxy(style.images,state,this.ID+'_I');
  var html = bbbfly.Renderer.StackHTML(proxy,state,'MapIconImg');

  this._IconProxy = proxy;
  state.mouseover = over;

  if(html !== this._IconHtml){
    this._IconHtml = html;

    var icon = L.divIcon({
      iconSize: [proxy.W,proxy.H],
      iconAnchor: [proxy.Anchor.L,proxy.Anchor.T],
      className: style.className,
//    tooltipAnchor: ttAnchor, //TODO
      html: html
    });

    this.Scan(function(layer){
      layer.setIcon(icon);
    });

    if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
  }

  this.Update.callParent();
};

/** @ignore */
bbbfly.map.drawing.icon._onMouseEnter = function(){
  this.OnMouseEnter.callParent();
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};

/** @ignore */
bbbfly.map.drawing.icon._onMouseLeave = function(){
  this.OnMouseLeave.callParent();
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};

/** @ignore */
bbbfly.map.drawing.geometry._create = function(){
  var style = this.GetStyle(bbbfly.MapGeometry.Style);
  var json = this.Options.GeoJSON;

  if(!(json instanceof L.GeoJSON)){
    json = bbbfly.map.drawing.utils.NormalizeGeoJSON(json);
    json = new L.GeoJSON(json);
  }

  var geometries = json.getLayers();
  if(!Array.isArray(geometries)){return [];}

  for(var i in geometries){
    var geometry = geometries[i];
    geometry.setStyle(style);

    ng_OverrideMethod(
      geometry,'_project',
      bbbfly.map.drawing.geometry._project
    );
  }

  return geometries;
};

/** @ignore */
bbbfly.map.drawing.geometry._project = function(){
  this._project.callParent();

  var node = this.getElement();
  if(!node){return;}

  var minSize = this.Owner.Options.MinPartSize;
  var display = 'block';

  if(Number.isInteger(minSize)){
    var size = this._pxBounds.getSize();

    if((size.x < minSize) || (size.y < minSize)){
      display = 'none';
    }
  }

  node.style.display = display;
};

/** @ignore */
bbbfly.map.drawing.cluster._create = function(){

  var group = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    spiderLegPolylineOptions: {}, //TODO
    iconCreateFunction: bbbfly.map.drawing.cluster._createIcon,

    showCoverageOnHover: false,
    removeOutsideVisibleBounds: false,
    maxClusterRadius: 50, //TODO
    zoomToBoundsOnClick: true
  });

  group.on('spiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);
  group.on('unspiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);

  return group;
};

/** @ignore */
bbbfly.map.drawing.cluster._update = function(){
  this.Scan(function(layer){
    layer.refreshClusters();
  });
};

/** @ignore */
bbbfly.map.drawing.cluster._getStyle = function(cnt,type){
  var style = this.Options.Style;
  if(style instanceof type){return style;}

  if(Array.isArray(style) && Number.isInteger(cnt)){
    for(var i in style){
      var styleDef = style[i];
      var from = Number.isInteger(styleDef.from) ? styleDef.from : null;
      var to = Number.isInteger(styleDef.to) ? styleDef.to : null;

      if(
        ((from === null) || (cnt >= from))
        && ((to === null) || (cnt <= to))
      ){
        style = styleDef.style;
        break;
      }
    }
  }

  if(String.isString(style)){
    style = bbbfly.map.drawing.utils.GetDrawingStyle(style);
  }

  return (style instanceof type) ? style : new type();
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
          bbbfly.MapDrawing.state.selected
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
  this.DoInitialize.callParent(layer,'cluster');
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
bbbfly.map.drawing.cluster._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  return this.Scan(function(layer){
    if(drawing.AddTo(layer)){return true;}
  });
};

/** @ignore */
bbbfly.map.drawing.cluster._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  return this.Scan(function(layer){
    if(drawing.RemoveFrom(layer)){return true;}
  });
};

/** @ignore */
bbbfly.map.drawing.cluster._createIcon = function(cluster){
  var drawing = cluster._group.Owner;
  var childCnt = cluster.getChildCount();

  var style = drawing.GetStyle(childCnt,bbbfly.MapIcon.Style);
  var state = drawing.GetState(cluster);

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
//    tooltipAnchor: ttAnchor, //TODO
      html: html
    });
};

/** @ignore */
bbbfly.map.drawing.cluster._onSpiderfyChanged = function(){
  this.Owner.Update();
};

/** @ignore */
bbbfly.map.drawing.handler._getDrawing = function(id){
  var drawing = this._Drawings[id];
  return (drawing instanceof bbbfly.MapDrawing) ? drawing : null;
};

/** @ignore */
bbbfly.map.drawing.handler._addDrawing = function(drawing){
  if(
    (drawing instanceof bbbfly.MapDrawing)
    && String.isString(drawing.ID)
    && !this._Drawings[drawing.ID]
  ){
    var added = (this._CurrentCluster)
      ? this._CurrentCluster.AddDrawing(drawing)
      : drawing.AddTo(this._Feature);

    if(added){
      this._Drawings[drawing.ID] = drawing;
      return true;
    }
  }
  return false;
};

/** @ignore */
bbbfly.map.drawing.handler._removeDrawing = function(drawing){
  if(
    (drawing instanceof bbbfly.MapDrawing)
    && String.isString(drawing.ID)
    && this._Drawings[drawing.ID]
    && drawing.RemoveFrom()
  ){
    delete(this._Drawings[drawing.ID]);
    return true;
  }
  return false;
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

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;

  /** @private */
  this._Layers = [];
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
 * @enum {integer}
 * @description
 *   Supported {@link Supported bbbfly.Renderer.state|renderer states}
 *
 */
bbbfly.MapDrawing.state = {
  mouseover: 1,
  disabled: 2,
  selected: 4,
  grayed: 8
};

/**
 * @enum {integer}
 */
bbbfly.MapDrawing.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};

/**
 * @class
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawingItem.options} options
 *
 * @property {string|null} ID
 * @property {bbbfly.MapDrawingItem.options} Options
 */
bbbfly.MapDrawingItem = function(options){
  var drawing = new bbbfly.MapDrawing(options);

  /** @private */
  drawing._State = 0;

  /** @private */
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.item._update
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.item._onMouseEnter
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.item._onMouseLeave
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnClick',
    bbbfly.map.drawing.item._onClick
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnDblClick',
    bbbfly.map.drawing.item._onDblClick
  );

  /**
   * @function
   * @name GetStyle
   * @memberof bbbfly.MapDrawingItem#
   *
   * @param {function} type - Accepted style type
   * @return {object} Drawing style definition
   */
  drawing.GetStyle = bbbfly.map.drawing.item._getStyle;
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
  drawing.GetState = bbbfly.map.drawing.item._getState;
  /**
   * @function
   * @name GetStateValue
   * @memberof bbbfly.MapDrawingItem#
   *
   * @description
   *   Get drawing state value
   *
   * @param {bbbfly.MapDrawing.state} state
   * @return {boolean} Value
   *
   * @see {@link bbbfly.MapDrawingItem#GetState|GetState()}
   * @see {@link bbbfly.MapDrawingItem#SetStateValue|SetStateValue()}
   */
  drawing.GetStateValue = bbbfly.map.drawing.item._getStateValue;
  /**
   * @function
   * @name SetStateValue
   * @memberof bbbfly.MapDrawingItem#
   *
   * @description
   *   Set drawing state value
   *
   * @param {bbbfly.MapDrawing.state} state
   * @param {boolean} [value=false] Value
   * @param {boolean} [update=true]
   * @return {boolean} If value has changed
   *
   * @see {@link bbbfly.MapDrawingItem#GetState|GetState()}
   * @see {@link bbbfly.MapDrawingItem#GetStateValue|GetStateValue()}
   */
  drawing.SetStateValue = bbbfly.map.drawing.item._setStateValue;
    /**
   * @function
   * @name SetSelected
   * @memberof bbbfly.MapDrawingItem#
   *
   * @return {boolean} Value
   *
   * @see {@link bbbfly.MapDrawingItem#SetSelected|SetSelected()}
   */
  drawing.GetSelected = bbbfly.map.drawing.item._getSelected;
  /**
   * @function
   * @name SetSelected
   * @memberof bbbfly.MapDrawingItem#
   *
   * @param {boolean} [selected=true] - Value to set
   * @param {boolean} [update=true] - If update control
   *
   * @see {@link bbbfly.MapDrawingItem#GetSelected|GetSelected()}
   */
  drawing.SetSelected = bbbfly.map.drawing.item._setSelected;

  return drawing;
};

/**
 * @class
 * @extends bbbfly.MapDrawingItem
 * @inpackage mapbox
 *
 * @param {bbbfly.MapIcon.options} options
 *
 * @property {bbbfly.MapIcon.options} Options
 */
bbbfly.MapIcon = function(options){
  var drawing = new bbbfly.MapDrawingItem(options);

  /** @private */
  drawing._IconProxy = null;
  /** @private */
  drawing._IconHtml = '';

  /** @private */
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.icon._create
  );
  /** @private */
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.icon._update
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.icon._onMouseEnter
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.icon._onMouseLeave
  );

  return drawing;
};

/**
 * @class
 * @inpackage mapbox
 *
 * @param {bbbfly.Renderer.image[]} [images=null] - Stack of icon images
 * @param {string} [className=''] - Leaflet marker div class
 */
bbbfly.MapIcon.Style = function(images,className){
  if(!Array.isArray(images)){images = null;}
  if(!String.isString(className)){className = '';}

  this.images = images;
  this.className = className;
};

/**
 * @class
 * @extends bbbfly.MapDrawingItem
 * @inpackage mapbox
 *
 * @param {bbbfly.MapGeometry.options} options
 *
 * @property {bbbfly.MapGeometry.options} Options
 */
bbbfly.MapGeometry = function(options){
  var drawing = new bbbfly.MapDrawingItem(options);

  /** @private */
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.geometry._create
  );

  return drawing;
};

/**
 * @class
 * @inpackage mapbox
 *
 * @param {string} color
 * @param {integer} borderWidth
 */
bbbfly.MapGeometry.Style = function(color,borderWidth){
  if(!String.isString(color)){color = '#000000';}
  if(!Number.isInteger(borderWidth)){borderWidth = 0;}

  this.color = color;
  this.weight = borderWidth;
  this.stroke = (borderWidth > 0);

  this.fill = true;
  this.fillColor = color;
  this.fillOpacity = 0.2;
};

/**
 * @class
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapMarkerCluster.options} options
 *
 * @property {bbbfly.MapMarkerCluster.options} Options
 */
bbbfly.MapMarkerCluster = function(options){
  var drawing = new bbbfly.MapDrawing(options);

  /** @private */
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.cluster._create
  );
  /** @private */
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.cluster._update
  );

  /** @private */
  ng_OverrideMethod(drawing,'DoInitialize',
    bbbfly.map.drawing.cluster._doInitialize
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.cluster._onMouseEnter
  );
  /** @private */
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.cluster._onMouseLeave
  );

    /**
   * @function
   * @name GetStyle
   * @memberof bbbfly.MapMarkerCluster#
   *
   * @param {integer} cnt - Child markers count
   * @param {function} type - Accepted style type
   * @return {object} Drawing style definition
   */
  drawing.GetStyle = bbbfly.map.drawing.cluster._getStyle;
  /**
   * @function
   * @name GetState
   * @memberof bbbfly.MapMarkerCluster#
   *
   * @param {mapCluster} cluster
   * @param {bbbfly.Renderer.state} def - State default values
   * @return {bbbfly.Renderer.state} Drawing state
   */
  drawing.GetState = bbbfly.map.drawing.cluster._getState;

  /**
   * @function
   * @name AddDrawing
   * @memberof bbbfly.MapMarkerCluster#
   *
   * @param {bbbfly.MapDrawing} drawing
   * @return {boolean} - If added
   */
  drawing.AddDrawing = bbbfly.map.drawing.cluster._addDrawing;
  /**
   * @function
   * @name AddDrawing
   * @memberof bbbfly.MapMarkerCluster#
   *
   * @param {bbbfly.MapDrawing} drawing
   * @return {boolean} - If removed
   */
  drawing.RemoveDrawing = bbbfly.map.drawing.cluster._removeDrawing;

  return drawing;
};

/**
 * @class
 * @inpackage mapbox
 *
 * @param {mapFeature} feature
 */
bbbfly.MapDrawingsHandler = function(feature){
  if(!(feature instanceof L.FeatureGroup)){return null;}

  /** @private */
  this._Feature = feature;
  /** @private */
  this._Drawings = {};
  /** @private */
  this._CurrentCluster = null;

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
   * @name AddDrawing
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawing} drawing
   * @return {boolean} - If removed
   */
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;

  /**
   * @function
   * @name BeginClustering
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapMarkerCluster} cluster
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
 * @property {string} ID
 * @property {bbbfly.MapDrawing.selecttype} [SelectType=none]
 * @property {object|string} Style - Drawing style or style ID
 */

/**
 * @typedef {bbbfly.MapDrawingItem.options} options
 * @memberOf bbbfly.MapIcon
 *
 * @property {mapPoint} Coordinates
 * @property {bbbfly.MapIcon.Style|string} Style
 */

/**
 * @typedef {bbbfly.MapDrawingItem.options} options
 * @memberOf bbbfly.MapGeometry
 *
 * @property {geoJSON|mapGeoJSON} GeoJSON
 * @property {px} [MinPartSize=0] - Hide smaller geometry parts
 * @property {bbbfly.MapGeometry.Style|string} Style
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapMarkerCluster
 *
 * @property {boolean} [ShowNumber=true]
 * @property {bbbfly.MapIcon.Style|string|array} Style
 */