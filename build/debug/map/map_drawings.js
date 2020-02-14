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
bbbfly.map.drawing.layer._updateZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawing.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};
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
bbbfly.map.drawing.core._doInitialize = function(layer,prefix){
  if(!(layer instanceof L.Layer)){return false;}
  if(!String.isString(prefix)){prefix = '';}

  bbbfly.map.drawing.utils.InitMouseEvents(layer,prefix);

  layer.Owner = this;
  L.Util.stamp(layer);
  this._Layers.push(layer);

  return true;
};
bbbfly.map.drawing.core._dispose = function(){
  this.Scan(function(layer){
    layer.remove();
  });

  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
};
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
  if(!Boolean.isBoolean(update)){update = true;}

  var state = bbbfly.MapDrawingItem.state.selected;
  this.SetStateValue(state,selected,update);
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
      html: html
    });

    this.Scan(function(layer){
      layer.setIcon(icon);
    });

    if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
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
bbbfly.map.drawing.cluster._update = function(){
  this.Scan(function(layer){
    layer.refreshClusters();
  });
};
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
bbbfly.map.drawing.cluster._getSpiderStyle = function(){
  var type = bbbfly.MapGeometry.Style;
  var style = this.Options.SpiderStyle;
  if(style instanceof type){return style;}

  if(String.isString(style)){
    style = bbbfly.map.drawing.utils.GetDrawingStyle(style);
  }

  return (style instanceof type) ? style : new type();
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
  this.DoInitialize.callParent(layer,'cluster');
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
bbbfly.map.drawing.cluster._addDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  return this.Scan(function(layer){
    if(drawing.AddTo(layer)){return true;}
  });
};
bbbfly.map.drawing.cluster._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}

  return this.Scan(function(layer){
    if(drawing.RemoveFrom(layer)){return true;}
  });
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
bbbfly.map.drawing.handler._removeDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawing)){return false;}
  if(drawing !== this._Drawings[drawing.ID]){return false;}

  if(drawing.RemoveFrom()){
    delete(this._Drawings[drawing.ID]);
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
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = {};}

  this.ID = bbbfly.map.drawing.utils.DrawingId(options);
  this.Options = options;
  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
  this.Initialize = bbbfly.map.drawing.core._initialize;
  this.DoInitialize = bbbfly.map.drawing.core._doInitialize;
  this.Create = null;
  this.Update = null;
  this.Dispose = bbbfly.map.drawing.core._dispose;
  this.AddTo = bbbfly.map.drawing.core._addTo;
  this.RemoveFrom = bbbfly.map.drawing.core._removeFrom;
  this.Scan = bbbfly.map.drawing.core._scan;
  this.OnMouseEnter = null;
  this.OnMouseLeave = null;
  this.OnClick = null;
  this.OnDblClick = null;
  this.OnRightClick = null;
};
bbbfly.MapDrawingItem = function(options){
  var drawing = new bbbfly.MapDrawing(options);
  drawing._State = 0;
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.item._update
  );
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.item._onMouseEnter
  );
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.item._onMouseLeave
  );
  ng_OverrideMethod(drawing,'OnClick',
    bbbfly.map.drawing.item._onClick
  );
  ng_OverrideMethod(drawing,'OnDblClick',
    bbbfly.map.drawing.item._onDblClick
  );
  drawing.GetStyle = bbbfly.map.drawing.item._getStyle;
  drawing.GetState = bbbfly.map.drawing.item._getState;
  drawing.GetStateValue = bbbfly.map.drawing.item._getStateValue;
  drawing.SetStateValue = bbbfly.map.drawing.item._setStateValue;
  drawing.GetSelected = bbbfly.map.drawing.item._getSelected;
  drawing.SetSelected = bbbfly.map.drawing.item._setSelected;

  return drawing;
};
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
bbbfly.MapIcon = function(options){
  var drawing = new bbbfly.MapDrawingItem(options);
  drawing._IconProxy = null;
  drawing._IconHtml = '';
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.icon._create
  );
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.icon._update
  );
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.icon._onMouseEnter
  );
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.icon._onMouseLeave
  );

  return drawing;
};
bbbfly.MapIcon.Style = function(images,className){
  if(!Array.isArray(images)){images = null;}
  if(!String.isString(className)){className = '';}

  this.images = images;
  this.className = className;
};
bbbfly.MapGeometry = function(options){
  var drawing = new bbbfly.MapDrawingItem(options);
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.geometry._create
  );

  return drawing;
};
bbbfly.MapGeometry.Style = function(color,borderWidth){
  if(!String.isString(color)){color = '#000000';}
  if(!Number.isInteger(borderWidth)){borderWidth = 0;}

  this.stroke = (borderWidth > 0);
  this.weight = borderWidth;
  this.color = color;
  this.opacity = 1;

  this.fill = true;
  this.fillColor = color;
  this.fillOpacity = 0.2;
};
bbbfly.MapIconCluster = function(options){
  var drawing = new bbbfly.MapDrawing(options);
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.cluster._create
  );
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.cluster._update
  );
  ng_OverrideMethod(drawing,'DoInitialize',
    bbbfly.map.drawing.cluster._doInitialize
  );
  ng_OverrideMethod(drawing,'OnMouseEnter',
    bbbfly.map.drawing.cluster._onMouseEnter
  );
  ng_OverrideMethod(drawing,'OnMouseLeave',
    bbbfly.map.drawing.cluster._onMouseLeave
  );
  drawing.GetIconStyle = bbbfly.map.drawing.cluster._getIconStyle;
  drawing.GetSpiderStyle = bbbfly.map.drawing.cluster._getSpiderStyle;
  drawing.GetState = bbbfly.map.drawing.cluster._getState;
  drawing.AddDrawing = bbbfly.map.drawing.cluster._addDrawing;
  drawing.RemoveDrawing = bbbfly.map.drawing.cluster._removeDrawing;

  return drawing;
};
bbbfly.MapDrawingsHandler = function(feature){
  if(!(feature instanceof L.FeatureGroup)){return null;}
  this._Feature = feature;
  this._Drawings = {};
  this._CurrentCluster = null;
  this.GetDrawing = bbbfly.map.drawing.handler._getDrawing;
  this.AddDrawing = bbbfly.map.drawing.handler._addDrawing;
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;
  this.ClearDrawings = bbbfly.map.drawing.handler._clearDrawings;
  this.BeginClustering = bbbfly.map.drawing.handler._beginClustering;
  this.EndClustering = bbbfly.map.drawing.handler._endClustering;
};
