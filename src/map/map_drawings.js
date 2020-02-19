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
bbbfly.map.drawing.core._initialize = function(){
  if(this._Initialized){return true;}

  if(!Function.isFunction(this.Create)){return false;}
  if(!this.DoInitialize(this.Create())){return false;}

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
  this._Layer = layer;

  return true;
};

/** @ignore */
bbbfly.map.drawing.core._dispose = function(){
  if(this._Layer){this._Layer.remove();}

  this._Layer = null;
  this._ParentFeature = null;
  this._Initialized = false;
};

/** @ignore */
bbbfly.map.drawing.core._addTo = function(feature){
  if(this._ParentFeature){return false;}

  if(
    (feature instanceof L.FeatureGroup)
    && this.Initialize()
  ){
    this._Layer.addTo(feature);
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

    if(this._Layer){
      this._Layer.removeFrom(feature);
    }

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
  if(!this.GetStateValue(bbbfly.MapDrawingItem.state.disabled)){
    if(
      this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover)
      || this.GetStateValue(bbbfly.MapDrawingItem.state.selected)
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
    mouseover: this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover),
    disabled: this.GetStateValue(bbbfly.MapDrawingItem.state.disabled),
    selected: this.GetStateValue(bbbfly.MapDrawingItem.state.selected),
    grayed: this.GetStateValue(bbbfly.MapDrawingItem.state.grayed)
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
  return this.GetStateValue(bbbfly.MapDrawingItem.state.selected);
};

/** @ignore */
bbbfly.map.drawing.item._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(this.GetSelected() === selected){return true;}

  if(Function.isFunction(this.OnSetSelected)){
    if(!this.OnSetSelected()){return false;}
  }

  var state = bbbfly.MapDrawingItem.state.selected;
  if(!Boolean.isBoolean(update)){update = true;}

  this.SetStateValue(state,selected,update);

  if(Function.isFunction(this.OnSelectedChanged)){
    this.OnSelectedChanged();
  }

  return true;
};

/** @ignore */
bbbfly.map.drawing.item._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,true);
};

/** @ignore */
bbbfly.map.drawing.item._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,false);
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
      bbbfly.map.drawing.icon._updateZIndex
    );
  }

  return marker;
};

/** @ignore */
bbbfly.map.drawing.icon._update = function(){
  if(this._Layer){
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
//        tooltipAnchor: ttAnchor, //TODO
        html: html
      });

      this._Layer.setIcon(icon);

      if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
    }
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
bbbfly.map.drawing.icon._updateZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};

/** @ignore */
bbbfly.map.drawing.geometry._create = function(){
  var style = this.GetStyle(bbbfly.MapGeometry.Style);
  var json = this.Options.GeoJSON;

  var options = {
    onEachFeature: bbbfly.map.drawing.geometry._initPath,
    Owner: this
  };

  var layer = new L.GeoJSON(
    bbbfly.map.drawing.utils.NormalizeGeoJSON(json),
    options
  );

  layer.setStyle(style);
  return layer;
};

/** @ignore */
bbbfly.map.drawing.geometry._initPath = function(feature,layer){
  ng_OverrideMethod(
    layer,'_project',
    bbbfly.map.drawing.geometry._project
  );
};

/** @ignore */
bbbfly.map.drawing.geometry._project = function(){
  this._project.callParent();

  var node = this.getElement();
  if(!node){return;}

  var drawing = this.options.Owner;

  var minSize = drawing.Options.MinSize;
  if(!Number.isInteger(minSize)){minSize = 25;}

  var jsonLayer = drawing._Layer;
  var bounds = jsonLayer.getBounds();

  if(bounds.isValid()){
    bounds = [bounds.getNorthEast(),bounds.getSouthWest()];

    var pxBounds = new L.Bounds();
    this._projectLatlngs(bounds,[],pxBounds);

    if(pxBounds.isValid()){
      var size = pxBounds.getSize();

      if((size.x < minSize) || (size.y < minSize)){
        node.style.display = 'none';
        return;
      }
    }
  }

  node.style.display = 'block';
};

/** @ignore */
bbbfly.map.drawing.cluster._create = function(){
  var style = this.GetSpiderStyle();

  var radius = this.Options.Radius;
  if(!Number.isInteger(radius)){radius = 50;}

  var group = new L.MarkerClusterGroup({
    iconCreateFunction: bbbfly.map.drawing.cluster._createIcon,
    removeOutsideVisibleBounds: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: radius,

    spiderfyOnMaxZoom: !!style,
    spiderLegPolylineOptions: style
  });

  group.on('spiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);
  group.on('unspiderfied',bbbfly.map.drawing.cluster._onSpiderfyChanged);

  return group;
};

/** @ignore */
bbbfly.map.drawing.cluster._update = function(){
  if(this._Layer){this._Layer.refreshClusters();}
};

/** @ignore */
bbbfly.map.drawing.cluster._getIconStyle = function(cnt){
  var type = bbbfly.MapIcon.Style;
  var style = this.Options.IconStyle;
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
bbbfly.map.drawing.cluster._getSpiderStyle = function(){
  var type = bbbfly.MapGeometry.Style;
  var style = this.Options.SpiderStyle;
  if(style instanceof type){return style;}

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
bbbfly.map.drawing.cluster._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
   return drawing.AddTo(this._Layer);
};

/** @ignore */
bbbfly.map.drawing.cluster._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  return drawing.RemoveFrom(this._Layer);
};

/** @ignore */
bbbfly.map.drawing.cluster._createIcon = function(cluster){
  var drawing = cluster._group.Owner;
  var childCnt = cluster.getChildCount();

  var style = drawing.GetIconStyle(childCnt);
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
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  if(!String.isString(drawing.ID)){return false;}
  if(this._Drawings[drawing.ID]){return false;}

  var added = (this._CurrentCluster)
    ? this._CurrentCluster.AddDrawing(drawing)
    : drawing.AddTo(this._Feature);

  if(!added){return false;}

  if(drawing instanceof bbbfly.MapDrawingItem){
    drawing.AddEvent(
      'OnSetSelected',this._drawing_onSetSelected,true
    );
    drawing.AddEvent(
      'OnSelectedChanged',this._drawing_onSelectedChanged,true
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
      drawing.RemoveEvent(
        'OnSetSelected',this._drawing_onSetSelected
      );
      drawing.RemoveEvent(
        'OnSelectedChanged',this._drawing_onSelectedChanged
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
bbbfly.map.drawing.handler._getSelectedDrawings = function(selected){
  var drawings = [];

  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(Boolean.isBoolean(selected)){
      if(drawing.GetSelected() !== selected){continue;}
    }

    drawings.push(drawing);
  }
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
  switch(this.Options.SelectType){
    case bbbfly.MapDrawingsHandler.selecttype.single:
    case bbbfly.MapDrawingsHandler.selecttype.multi:
      return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.drawing.handler._onSelectedChanged = function(drawing){

  if(drawing.GetSelected()){
    switch(this.Options.SelectType){
      case bbbfly.MapDrawingsHandler.selecttype.single:
        this.ClearSelected();

      case bbbfly.MapDrawingsHandler.selecttype.multi:
        this._Selected[drawing.ID] = drawing;
      break;
    }
  }
  else{
    if(this._Selected[drawing.ID] === drawing){
      delete(this._Selected[drawing.ID]);
    }
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

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;

  /** @private */
  this._Layer = null;
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
 * @class
 * @extends bbbfly.MapDrawing
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
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.item._update
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.item._onMouseEnter
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.item._onMouseLeave
    );
    /** @private */
    ng_OverrideMethod(this,'OnClick',
      bbbfly.map.drawing.item._onClick
    );
    /** @private */
    ng_OverrideMethod(this,'OnDblClick',
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
    this.GetStyle = bbbfly.map.drawing.item._getStyle;
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
     * @event
     * @name OnSetSelected
     * @memberof bbbfly.MapDrawingItem#
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
     * @see {@link bbbfly.MapDrawingItem#SetSelected|SetSelected()}
     * @see {@link bbbfly.MapDrawingItem#GetSelected|GetSelected()}
     * @see {@link bbbfly.MapDrawingItem#event:OnSetSelected|OnSetSelected}
     */
    this.OnSelectedChanged = null;

    return this;
  }
);

/**
 * @enum {integer}
 * @description
 *   Supported {@link Supported bbbfly.Renderer.state|renderer states}
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
 * @extends bbbfly.MapDrawingItem
 * @inpackage mapbox
 *
 * @param {bbbfly.MapIcon.options} options
 *
 * @property {bbbfly.MapIcon.options} Options
 */
bbbfly.MapIcon = bbbfly.object.Extend(
  bbbfly.MapDrawingItem,function(options){

    bbbfly.MapDrawingItem.call(this,options);

    /** @private */
    this._IconProxy = null;
    /** @private */
    this._IconHtml = '';

    /** @private */
    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.icon._create
    );
    /** @private */
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.icon._update
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.icon._onMouseEnter
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.icon._onMouseLeave
    );

    return this;
  }
);

/**
 * @class
 * @inpackage mapbox
 *
 * @param {bbbfly.Renderer.image[]} [images=null] - Stack of icon images
 * @param {string} [className=''] - Leaflet marker div class name
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
bbbfly.MapGeometry = bbbfly.object.Extend(
  bbbfly.MapDrawingItem,function(options){

    bbbfly.MapDrawingItem.call(this,options);

    /** @private */
    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.geometry._create
    );

    return this;
  }
);

/**
 * @class
 * @inpackage mapbox
 *
 * @param {object} opts
 * @param {integer} [opts.weight=undefined]
 * @param {string} [opts.color=undefined]
 * @param {string} [opts.fillColor=undefined]
 * @param {double} [opts.opacity=undefined]
 * @param {double} [opts.fillOpacity=undefined]
 *
 * @property {boolean} fill
 * @property {boolean} stroke
 * @property {integer} [weight=1]
 * @property {string} [color='#000000']
 * @property {string} [fillColor=undefined]
 * @property {double} [opacity=1]
 * @property {double} [fillOpacity=0.2]
 */
bbbfly.MapGeometry.Style = function(opts){
  this.stroke = false;
  this.fill = false;
  this.weight = 1;

  this.color = '#000000';
  this.fillColor = undefined;

  this.opacity = 1;
  this.fillOpacity = 0.2;

  if(!Object.isObject(opts)){return;}

  if(Number.isInteger(opts.weight)){this.weight = opts.weight;}

  if(String.isString(opts.color)){this.color = opts.color;}
  if(String.isString(opts.fillColor)){this.fillColor = opts.fillColor;}

  if(Number.isNumber(opts.opacity)){this.opacity = opts.opacity;}
  if(Number.isNumber(opts.fillOpacity)){this.fillOpacity = opts.fillOpacity;}

  this.stroke = !!((this.weight > 0) && (this.opacity > 0));
  this.fill = !!(this.fillColor && (this.fillOpacity > 0));
};

/**
 * @class
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapGeometry.options} options
 *
 * @property {bbbfly.MapGeometry.options} Options
 */
bbbfly.MapDrawingCombo = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){

//    bbbfly.MapDrawing.call(this,options);

//    /** @private */
//    ng_OverrideMethod(drawing,'Create',
//      bbbfly.map.drawing.geometry._create
//    );

    return this;
  }
);

/**
 * @class
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapIconCluster.options} options
 *
 * @property {bbbfly.MapIconCluster.options} Options
 */
bbbfly.MapIconCluster = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){
    bbbfly.MapDrawing.call(this,options);

    /** @private */
    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.cluster._create
    );
    /** @private */
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.cluster._update
    );

    /** @private */
    ng_OverrideMethod(this,'DoInitialize',
      bbbfly.map.drawing.cluster._doInitialize
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.cluster._onMouseEnter
    );
    /** @private */
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.cluster._onMouseLeave
    );

    /**
     * @function
     * @name GetStyle
     * @memberof bbbfly.MapIconCluster#
     *
     * @param {integer} cnt - Child markers count
     * @return {bbbfly.MapIcon.Style}
     */
    this.GetIconStyle = bbbfly.map.drawing.cluster._getIconStyle;
      /**
     * @function
     * @name GetSpiderStyle
     * @memberof bbbfly.MapIconCluster#
     *
     * @return {bbbfly.MapGeometry.Style}
     */
    this.GetSpiderStyle = bbbfly.map.drawing.cluster._getSpiderStyle;

    /**
     * @function
     * @name GetState
     * @memberof bbbfly.MapIconCluster#
     *
     * @param {mapCluster} cluster
     * @param {bbbfly.Renderer.state} def - State default values
     * @return {bbbfly.Renderer.state} Drawing state
     */
    this.GetState = bbbfly.map.drawing.cluster._getState;

    /**
     * @function
     * @name AddDrawing
     * @memberof bbbfly.MapIconCluster#
     *
     * @param {bbbfly.MapDrawing} drawing
     * @return {boolean} - If added
     */
    this.AddDrawing = bbbfly.map.drawing.cluster._addDrawing;
    /**
     * @function
     * @name AddDrawing
     * @memberof bbbfly.MapIconCluster#
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
  var handler = this;

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
  this._drawing_onSetSelected = function(){
    return handler.OnSetSelected(this);
  };

  /** @private */
  this._drawing_onSelectedChanged = function(){
    handler.OnSelectedChanged(this);
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
   * @name AddDrawing
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
   * @param {bbbfly.MapIconCluster} cluster
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
   * @name GetSelectedDrawings
   * @memberof bbbfly.MapDrawingsHandler#
   * @description Get all drawings
   *
   * @param {boolean} [selected=undefined]
   */
  this.GetSelectedDrawings = bbbfly.map.drawing.handler._getSelectedDrawings;
  /**
   * @function
   * @name ClearSelected
   * @memberof bbbfly.MapDrawingsHandler#
   * @description Unselect all drawings
   */
  this.ClearSelected = bbbfly.map.drawing.handler._clearSelected;

  /**
   * @event
   * @name OnSelectedChanged
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawing}
   */
  this.OnSetSelected = bbbfly.map.drawing.handler._onSetSelected;
  /**
   * @event
   * @name OnSelectedChanged
   * @memberof bbbfly.MapDrawingsHandler#
   *
   * @param {bbbfly.MapDrawing}
   */
  this.OnSelectedChanged = bbbfly.map.drawing.handler._onSelectedChanged;
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
 * @property {bbbfly.MapDrawingItem.selecttype} [SelectType=none]
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
 * @property {px} [MinSize=25] - Hide if smaller
 * @property {bbbfly.MapGeometry.Style|string} Style
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapIconCluster
 *
 * @property {integer} [Radius=50]
 * @property {boolean} [ShowNumber=true]
 * @property {bbbfly.MapIcon.Style|string|array} IconStyle
 * @property {bbbfly.MapGeometry.Style|string|array} SpiderStyle
 */

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingsHandler
 *
 * @property {bbbfly.MapDrawingsHandler.selecttype} [SelectType=none]
 */