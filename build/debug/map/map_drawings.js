/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.drawing = {
  _leafletPrefix: 'lf-',

  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  core: {},
  item: {},
  group: {},
  icon: {},
  geometry: {},
  cluster: {},
  handler: {}
};
bbbfly.map.drawing.utils.LeafletId = function(obj){
  var id = Object.isObject(obj) ? obj._leaflet_id : null;
  return Number.isInteger(id) ? bbbfly.map.drawing._leafletPrefix+id : id;
};
bbbfly.map.drawing.utils.DrawingId = function(options){
  var id = (options) ? options.ID : null;
  return String.isString(id) ? id : '_'+(++bbbfly.map.drawing._lastId);
};
bbbfly.map.drawing.utils.GetDrawingStyle = function(style){
  if(String.isString(style)){
    style = bbbfly.map.drawing._styles[style];
    if(Object.isObject(style)){return style;}
  }
  return null;
};
bbbfly.map.drawing.utils.DefineDrawingStyle = function(id,style){
  if(!Object.isObject(style)){return false;}
  if(!String.isString(id)){return false;}

  var stack = bbbfly.map.drawing._styles;
  if((typeof stack[id] !== 'undefined')){return false;}

  stack[id] = style;
  return true;
};
bbbfly.map.drawing.utils.IsLatLng = function(latLng){
  return (Array.isArray(latLng) || (latLng instanceof L.LatLng));
};
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
  if(!this.DoInitialize(this.Create())){return false;}

  this._Initialized = true;
  return true;
};
bbbfly.map.drawing.core._doInitialize = function(layer,prefix){
  if(!(layer instanceof L.Layer)){return false;}
  if(!String.isString(prefix)){prefix = '';}

  bbbfly.map.drawing.utils.InitMouseEvents(layer,prefix);

  L.Util.stamp(layer);
  layer.Owner = this;
  this._Layer = layer;

  return true;
};
bbbfly.map.drawing.core._dispose = function(){
  if(this._Layer){this._Layer.remove();}

  this._Layer = null;
  this._ParentFeature = null;
  this._Initialized = false;
};
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
bbbfly.map.drawing.core._getGeoJSON = function(){
  return (this._Layer ? this._Layer.toGeoJSON() : null);
};
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
bbbfly.map.drawing.item._update = function(){
  if(!this.GetStateValue(bbbfly.MapDrawingItem.state.disabled)){
    if(
      this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover)
      || this.GetStateValue(bbbfly.MapDrawingItem.state.selected)
    ){
    }
  }
};
bbbfly.map.drawing.item._getStyle = function(type){
  var style = this.Options.Style;

  if(String.isString(style)){
    style = bbbfly.map.drawing.utils.GetDrawingStyle(style);
  }

  return (style instanceof type) ? style : new type();
};
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
bbbfly.map.drawing.item._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,true);
};
bbbfly.map.drawing.item._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,false);
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
bbbfly.map.drawing.group._getIconStyle = function(cnt){
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
bbbfly.map.drawing.group._getGeometryStyle = function(){
  var type = bbbfly.MapGeometry.Style;
  var style = this.Options.GeometryStyle;
  if(style instanceof type){return style;}

  if(String.isString(style)){
    style = bbbfly.map.drawing.utils.GetDrawingStyle(style);
  }

  return (style instanceof type) ? style : new type();
};
bbbfly.map.drawing.group._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
   return drawing.AddTo(this._Layer);
};
bbbfly.map.drawing.group._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  return drawing.RemoveFrom(this._Layer);
};
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
        html: html
      });

      this._Layer.setIcon(icon);

      if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
    }
  }

  this.Update.callParent();
};
bbbfly.map.drawing.icon._onMouseEnter = function(){
  this.OnMouseEnter.callParent();
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};
bbbfly.map.drawing.icon._onMouseLeave = function(){
  this.OnMouseLeave.callParent();
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};
bbbfly.map.drawing.icon._updateZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};
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
bbbfly.map.drawing.geometry._initPath = function(feature,layer){
  ng_OverrideMethod(
    layer,'_project',
    bbbfly.map.drawing.geometry._project
  );
};
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
bbbfly.map.drawing.cluster._getCenter = function(){
  if(this._Layer){
    var bounds = this._Layer.getBounds();

    if(bounds.isValid()){
      return bounds.getCenter();
    }
  }
  return null;
};
bbbfly.map.drawing.cluster._create = function(){
  var style = this.GetGeometryStyle();

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
bbbfly.map.drawing.cluster._update = function(){
  if(this._Layer){this._Layer.refreshClusters();}
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
      html: html
    });
};
bbbfly.map.drawing.cluster._onSpiderfyChanged = function(){
  this.Owner.Update();
};
bbbfly.map.drawing.handler._getDrawing = function(id){
  var drawing = this._Drawings[id];
  return (drawing instanceof bbbfly.MapDrawing) ? drawing : null;
};
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
bbbfly.map.drawing.handler._clearDrawings = function(){
  for(var id in this._Drawings){
    var drawing = this._Drawings[id];

    if(drawing.RemoveFrom()){
      delete(this._Drawings[id]);
    }
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
bbbfly.map.drawing.handler._clearSelected = function(){
  for(var id in this._Selected){
    var drawing = this._Selected[id];

    if(Function.isFunction(drawing.SetSelected)){
      drawing.SetSelected(false,true);
    }
  }
};
bbbfly.map.drawing.handler._onSetSelected = function(){
  switch(this.Options.SelectType){
    case bbbfly.MapDrawingsHandler.selecttype.single:
    case bbbfly.MapDrawingsHandler.selecttype.multi:
      return true;
  }
  return false;
};
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
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = {};}

  this.AddEvent = ngObjAddEvent;
  this.RemoveEvent = ngObjRemoveEvent;

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;
  this._Layer = null;
  this._ParentFeature = null;
  this._Initialized = false;
  this.Initialize = bbbfly.map.drawing.core._initialize;
  this.DoInitialize = bbbfly.map.drawing.core._doInitialize;
  this.Create = null;
  this.Update = null;
  this.Dispose = bbbfly.map.drawing.core._dispose;
  this.AddTo = bbbfly.map.drawing.core._addTo;
  this.RemoveFrom = bbbfly.map.drawing.core._removeFrom;
  this.GetGeoJSON = bbbfly.map.drawing.core._getGeoJSON;
  this.Scan = bbbfly.map.drawing.core._scan;
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
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.item._update
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
    this.GetStyle = bbbfly.map.drawing.item._getStyle;
    this.GetState = bbbfly.map.drawing.item._getState;
    this.GetStateValue = bbbfly.map.drawing.item._getStateValue;
    this.SetStateValue = bbbfly.map.drawing.item._setStateValue;
    this.GetSelected = bbbfly.map.drawing.item._getSelected;
    this.SetSelected = bbbfly.map.drawing.item._setSelected;
    this.OnSetSelected = null;
    this.OnSelectedChanged = null;

    return this;
  }
);
bbbfly.MapDrawingItem.state = {
  mouseover: 1,
  disabled: 2,
  selected: 4,
  grayed: 8
};
bbbfly.MapDrawingItem.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};
bbbfly.MapDrawingGroup = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){
    bbbfly.MapDrawing.call(this,options);
    this.GetIconStyle = bbbfly.map.drawing.group._getIconStyle;
    this.GetGeometryStyle = bbbfly.map.drawing.group._getGeometryStyle;
    this.AddDrawing = bbbfly.map.drawing.group._addDrawing;
    this.RemoveDrawing = bbbfly.map.drawing.group._removeDrawing;

    return this;
  }
);
bbbfly.MapIcon = bbbfly.object.Extend(
  bbbfly.MapDrawingItem,function(options){

    bbbfly.MapDrawingItem.call(this,options);
    this._IconProxy = null;
    this._IconHtml = '';
    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.icon._create
    );
    ng_OverrideMethod(this,'Update',
      bbbfly.map.drawing.icon._update
    );
    ng_OverrideMethod(this,'OnMouseEnter',
      bbbfly.map.drawing.icon._onMouseEnter
    );
    ng_OverrideMethod(this,'OnMouseLeave',
      bbbfly.map.drawing.icon._onMouseLeave
    );

    return this;
  }
);
bbbfly.MapIcon.Style = function(images,className){
  if(!Array.isArray(images)){images = null;}
  if(!String.isString(className)){className = '';}

  this.images = images;
  this.className = className;
};
bbbfly.MapGeometry = bbbfly.object.Extend(
  bbbfly.MapDrawingItem,function(options){

    bbbfly.MapDrawingItem.call(this,options);
    ng_OverrideMethod(this,'Create',
      bbbfly.map.drawing.geometry._create
    );
    this.GetCenter = bbbfly.map.drawing.cluster._getCenter;

    return this;
  }
);
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
bbbfly.MapDrawingCombo = bbbfly.object.Extend(
  bbbfly.MapDrawing,function(options){

    return this;
  }
);
bbbfly.MapIconCluster = bbbfly.object.Extend(
  bbbfly.MapDrawingGroup,function(options){
    bbbfly.MapDrawingGroup.call(this,options);
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

    return this;
  }
);
bbbfly.MapDrawingsHandler = function(feature,options){
  if(!(feature instanceof L.FeatureGroup)){return null;}
  if(!Object.isObject(options)){options = {};}
  var handler = this;

  this.Options = options;
  this._Feature = feature;
  this._Drawings = {};
  this._Selected = {};
  this._CurrentCluster = null;
  this._drawing_onSetSelected = function(){
    return handler.OnSetSelected(this);
  };
  this._drawing_onSelectedChanged = function(){
    handler.OnSelectedChanged(this);
  };
  this.GetDrawing = bbbfly.map.drawing.handler._getDrawing;
  this.AddDrawing = bbbfly.map.drawing.handler._addDrawing;
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;
  this.ClearDrawings = bbbfly.map.drawing.handler._clearDrawings;
  this.BeginClustering = bbbfly.map.drawing.handler._beginClustering;
  this.EndClustering = bbbfly.map.drawing.handler._endClustering;
  this.GetSelectedDrawings = bbbfly.map.drawing.handler._getSelectedDrawings;
  this.ClearSelected = bbbfly.map.drawing.handler._clearSelected;
  this.OnSetSelected = bbbfly.map.drawing.handler._onSetSelected;
  this.OnSelectedChanged = bbbfly.map.drawing.handler._onSelectedChanged;
};
bbbfly.MapDrawingsHandler.selecttype = {
  none: 0,
  single: 1,
  multi: 2
};

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawingsHandler
 *
 * @property {bbbfly.MapDrawingsHandler.selecttype} [SelectType=none]
 */