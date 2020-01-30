/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.drawing = {
  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  icon: {},
  geometry: {},
  handler: {}
};
bbbfly.map.drawing.utils.GetDrawingId = function(options){
  var id = (options) ? options.ID : null;
  return String.isString(id) ? id : '_'+(++bbbfly.map.drawing._lastId);
};
bbbfly.map.drawing.utils.GetDrawingStyle = function(options){
  var style = (options) ? options.Style : null;
  if(String.isString(style)){style = bbbfly.map.drawing._styles[style];}
  return Object.isObject(style) ? style : null;
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
bbbfly.map.drawing._getState = function(){
  var state = {
    mouseover: this.GetStateValue(bbbfly.MapDrawing.state.mouseover),
    disabled: this.GetStateValue(bbbfly.MapDrawing.state.disabled),
    selected: this.GetStateValue(bbbfly.MapDrawing.state.selected),
    grayed: this.GetStateValue(bbbfly.MapDrawing.state.grayed)
  };

  if(state.disabled){state.mouseover = false;}
  return state;
};
bbbfly.map.drawing._getStateValue = function(state){
  return !!(this._State & state);
};
bbbfly.map.drawing._setStateValue = function(state,value){
  var hasState = !!(this._State & state);
  if(value === hasState){return false;}

  if(value){this._State = (this._State | state);}
  else{this._State = (this._State ^ state);}
  return true;
};
bbbfly.map.drawing._toggleStateValue = function(state){
  this.SetStateValue(state,!this.GetStateValue(state));
};
bbbfly.map.drawing._initialize = function(){
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
bbbfly.map.drawing._doInitialize = function(layer){
  if(!(layer instanceof L.Layer)){return false;}

  layer.Owner = this;

  layer.on('mouseover',bbbfly.map.drawing.layer._onEvent);
  layer.on('mouseout',bbbfly.map.drawing.layer._onEvent);
  layer.on('click',bbbfly.map.drawing.layer._onEvent);
  layer.on('dblclick',bbbfly.map.drawing.layer._onEvent);
  layer.on('contextmenu',bbbfly.map.drawing.layer._onEvent);

  L.Util.stamp(layer);
  this._Layers.push(layer);

  return true;
};
bbbfly.map.drawing._dispose = function(){
  for(var i in this._Layers){
    var layer = this._Layers[i];
    layer.remove();
  }

  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
};
bbbfly.map.drawing._update = function(){
  if(!this.GetStateValue(bbbfly.MapDrawing.state.disabled)){
    if(
      this.GetStateValue(bbbfly.MapDrawing.state.mouseover)
      || this.GetStateValue(bbbfly.MapDrawing.state.selected)
    ){
    }
  }
};
bbbfly.map.drawing._add = function(feature){
  if((feature instanceof L.FeatureGroup) && !this._ParentFeature){
    this.Initialize();

    for(var i in this._Layers){
      var layer = this._Layers[i];
      layer.addTo(feature);
    }

    this._ParentFeature = feature;

    this.Update();
    return true;
  }
  return false;
};
bbbfly.map.drawing._remove = function(feature){
  if(feature && (feature === this._ParentFeature)){

    for(var i in this._Layers){
      var layer = this._Layers[i];
      layer.removeFrom(this._ParentFeature);
    }

    this._ParentFeature = null;
    return true;
  }
  return false;
};
bbbfly.map.drawing._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,true);
};
bbbfly.map.drawing._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,false);
};
bbbfly.map.drawing._onClick = function(){
  this.ToggleStateValue(bbbfly.MapDrawing.state.selected);
};
bbbfly.map.drawing.layer._onEvent = function(event){
  var drawing = event.target.Owner;

  var callback = null;
  switch(event.type){
    case 'mouseover': callback = drawing.OnMouseEnter; break;
    case 'mouseout': callback = drawing.OnMouseLeave; break;
    case 'click': callback = drawing.OnClick; break;
    case 'dblclick': callback = drawing.OnDblClick; break;
    case 'contextmenu': callback = drawing.OnRightClick; break;
  }

  if(Function.isFunction(callback)){
    callback.apply(drawing);
  }
};
bbbfly.map.drawing.layer._updateZIndex = function(offset){
  if(this.Owner.GetStateValue(bbbfly.MapDrawing.state.selected)){
    var rise = (this.options) ? this.options.riseOffset : 0;
    offset = (offset > rise) ? offset : rise;
  }

  this._updateZIndex.callParent(offset);
};

bbbfly.map.drawing.icon._create = function(){
  if(!Object.isObject(this.Options)){return null;}

  var style = bbbfly.map.drawing.utils.GetDrawingStyle(this.Options);
  if(!(style instanceof bbbfly.MapIcon.Style)){return null;}

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
  var style = bbbfly.map.drawing.utils.GetDrawingStyle(this.Options);
  if(!(style instanceof bbbfly.MapIcon.Style)){style = {};}

  var state = this.GetState();

  var over = state.mouseover;
  state.mouseover = false;

  var proxy = bbbfly.Renderer.StackProxy(style.images,state,this.ID+'_I');
  var html = bbbfly.Renderer.StackHTML(proxy,state,style.className+'Img');

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

    var layer = this._Layers[0];
    if(layer){layer.setIcon(icon);}

    if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
  }

  this.Update.callParent();
};
bbbfly.map.drawing.geometry._create = function(){
  if(!Object.isObject(this.Options)){return null;}

  var style = bbbfly.map.drawing.utils.GetDrawingStyle(this.Options);
  if(!(style instanceof bbbfly.MapGeometry.Style)){return null;}

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

  var opts = this.Owner.Options;
  var minSize = opts ? opts.MinPartSize : null;
  var display = 'block';

  if(Number.isInteger(minSize)){
    var size = this._pxBounds.getSize();

    if((size.x < minSize) || (size.y < minSize)){
      display = 'none';
    }
  }

  node.style.display = display;
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
    && drawing.Add(this._Feature)
  ){
    this._Drawings[drawing.ID] = drawing;
    return true;
  }
  return false;
};

bbbfly.map.drawing.handler._removeDrawing = function(drawing){
  if(
    (drawing instanceof bbbfly.MapDrawing)
    && String.isString(drawing.ID)
    && this._Drawings[drawing.ID]
    && drawing.Remove(this._Feature)
  ){
    delete(this._Drawings[drawing.ID]);
    return true;
  }
  return false;
};
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = null;}

  this.ID = bbbfly.map.drawing.utils.GetDrawingId(options);
  this.Options = options;
  this._State = 0;
  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
  this.Initialize = bbbfly.map.drawing._initialize;
  this.DoInitialize = bbbfly.map.drawing._doInitialize;
  this.GetState = bbbfly.map.drawing._getState;
  this.GetStateValue = bbbfly.map.drawing._getStateValue;
  this.SetStateValue = bbbfly.map.drawing._setStateValue;
  this.ToggleStateValue = bbbfly.map.drawing._toggleStateValue;
  this.Dispose = bbbfly.map.drawing._dispose;
  this.Create = null;
  this.Update = bbbfly.map.drawing._update;
  this.Add = bbbfly.map.drawing._add;
  this.Remove = bbbfly.map.drawing._remove;
  this.OnMouseEnter = bbbfly.map.drawing._onMouseEnter;
  this.OnMouseLeave = bbbfly.map.drawing._onMouseLeave;
  this.OnClick = bbbfly.map.drawing._onClick;
  this.OnDblClick = bbbfly.map.drawing._onClick;
  this.OnRightClick = null;
};
bbbfly.MapDrawing.state = {
  mouseover: 1,
  disabled: 2,
  selected: 4,
  grayed: 8
};
bbbfly.MapIcon = function(options){
  var drawing = new bbbfly.MapDrawing(options);
  drawing._IconProxy = null;
  drawing._IconHtml = '';
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.icon._create
  );
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.icon._update
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
  var drawing = new bbbfly.MapDrawing(options);
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.geometry._create
  );

  return drawing;
};
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
bbbfly.MapDrawingsHandler = function(feature){
  if(!(feature instanceof L.FeatureGroup)){return null;}
  this._Feature = feature;
  this._Drawings = {};
  this.GetDrawing = bbbfly.map.drawing.handler._getDrawing;
  this.AddDrawing = bbbfly.map.drawing.handler._addDrawing;
  this.RemoveDrawing = bbbfly.map.drawing.handler._removeDrawing;

  return this;
};
