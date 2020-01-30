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
  _lastId: 0,
  _styles: {},

  utils: {},
  layer: {},
  icon: {},
  geometry: {},
  handler: {}
};

/** @ignore */
bbbfly.map.drawing.utils.GetDrawingId = function(options){
  var id = (options) ? options.ID : null;
  return String.isString(id) ? id : '_'+(++bbbfly.map.drawing._lastId);
};

/** @ignore */
bbbfly.map.drawing.utils.GetDrawingStyle = function(options){
  var style = (options) ? options.Style : null;
  if(String.isString(style)){style = bbbfly.map.drawing._styles[style];}
  return Object.isObject(style) ? style : null;
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

/** @ignore */
bbbfly.map.drawing._getStateValue = function(state){
  return !!(this._State & state);
};

/** @ignore */
bbbfly.map.drawing._setStateValue = function(state,value,update){
  var hasState = !!(this._State & state);
  if(value === hasState){return false;}

  if(value){this._State = (this._State | state);}
  else{this._State = (this._State ^ state);}

  if(update){this.Update();}
  return true;
};

/** @ignore */
bbbfly.map.drawing._toggleStateValue = function(state,update){
  this.SetStateValue(state,!this.GetStateValue(state),update);
};

/** @ignore */
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

/** @ignore */
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

/** @ignore */
bbbfly.map.drawing._dispose = function(){
  for(var i in this._Layers){
    var layer = this._Layers[i];
    layer.remove();
  }

  this._Layers = [];
  this._ParentFeature = null;
  this._Initialized = false;
};

/** @ignore */
bbbfly.map.drawing._update = function(){
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

/** @ignore */
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

/** @ignore */
bbbfly.map.drawing._onMouseEnter = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,true);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};

/** @ignore */
bbbfly.map.drawing._onMouseLeave = function(){
  this.SetStateValue(bbbfly.MapDrawing.state.mouseover,false);
  bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());
};

/** @ignore */
bbbfly.map.drawing._onClick = function(){
  this.ToggleStateValue(bbbfly.MapDrawing.state.selected,true);
};

/** @ignore */
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

/** @ignore */
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

/** @ignore */
bbbfly.map.drawing.icon._update = function(){
  var style = bbbfly.map.drawing.utils.GetDrawingStyle(this.Options);
  if(!(style instanceof bbbfly.MapIcon.Style)){style = {};}

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

    var layer = this._Layers[0];
    if(layer){layer.setIcon(icon);}

    if(over){bbbfly.Renderer.UpdateStackHTML(proxy,state);}
  }

  this.Update.callParent();
};

/** @ignore */
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

/** @ignore */
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

/**
 * @class
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawing.options} options
 *
 * @property {string|null} ID
 * @property {bbbfly.MapDrawing.options|null} Options
 */
bbbfly.MapDrawing = function(options){
  if(!Object.isObject(options)){options = null;}

  this.ID = bbbfly.map.drawing.utils.GetDrawingId(options);
  this.Options = options;

  /** @private */
  this._State = 0;
  /** @private */
  this._Layers = [];
  /** @private */
  this._ParentFeature = null;
  /** @private */
  this._Initialized = false;

  /** @private */
  this.Initialize = bbbfly.map.drawing._initialize;
  /** @private */
  this.DoInitialize = bbbfly.map.drawing._doInitialize;

  /**
   * @function
   * @name GetState
   * @memberof bbbfly.MapDrawing#
   *
   * @description
   *   Get computed renderer state
   *
   * @return {bbbfly.Renderer.state} Drawing state
   *
   * @see {@link bbbfly.MapDrawing#GetStateValue|GetStateValue()}
   * @see {@link bbbfly.MapDrawing#SetStateValue|SetStateValue()}
   * @see {@link bbbfly.MapDrawing#ToggleStateValue|ToggleStateValue()}
   */
  this.GetState = bbbfly.map.drawing._getState;
  /**
   * @function
   * @name GetStateValue
   * @memberof bbbfly.MapDrawing#
   *
   * @description
   *   Get drawing state value
   *
   * @param {bbbfly.MapDrawing.state} state
   * @return {boolean} Value
   *
   * @see {@link bbbfly.MapDrawing#GetState|GetState()}
   * @see {@link bbbfly.MapDrawing#SetStateValue|SetStateValue()}
   * @see {@link bbbfly.MapDrawing#ToggleStateValue|ToggleStateValue()}
   */
  this.GetStateValue = bbbfly.map.drawing._getStateValue;
  /**
   * @function
   * @name SetStateValue
   * @memberof bbbfly.MapDrawing#
   *
   * @description
   *   Set drawing state value
   *
   * @param {bbbfly.MapDrawing.state} state
   * @param {boolean} [value=false] Value
   * @param {boolean} [update=true]
   * @return {boolean} If value has changed
   *
   * @see {@link bbbfly.MapDrawing#GetState|GetState()}
   * @see {@link bbbfly.MapDrawing#GetStateValue|GetStateValue()}
   * @see {@link bbbfly.MapDrawing#ToggleStateValue|ToggleStateValue()}
   */
  this.SetStateValue = bbbfly.map.drawing._setStateValue;
  /**
   * @function
   * @name ToggleStateValue
   * @memberof bbbfly.MapDrawing#
   *
   * @description
   *   Reverse drawing state value
   *
   * @param {bbbfly.MapDrawing.state} state
   * @param {boolean} [update=true]
   *
   * @see {@link bbbfly.MapDrawing#GetState|GetState()}
   * @see {@link bbbfly.MapDrawing#GetStateValue|GetStateValue()}
   * @see {@link bbbfly.MapDrawing#SetStateValue|SetStateValue()}
   */
  this.ToggleStateValue = bbbfly.map.drawing._toggleStateValue;

  /**
   * @function
   * @name Dispose
   * @memberof bbbfly.MapDrawing#
   *
   * @see {@link bbbfly.MapDrawing#Create|Create()}
   * @see {@link bbbfly.MapDrawing#Update|Update()}
   */
  this.Dispose = bbbfly.map.drawing._dispose;
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
   * @name Update
   * @memberof bbbfly.MapDrawing#
   *
   * @return {boolean} If created properly
   *
   * @see {@link bbbfly.MapDrawing#Create|Create()}
   * @see {@link bbbfly.MapDrawing#Dispose|Dispose()}
   */
  this.Update = bbbfly.map.drawing._update;

  /**
   * @function
   * @name Add
   * @memberof bbbfly.MapDrawing#
   *
   * @param {mapFeature} feature - Feature to add drawing to
   * @return {boolean} If added properly
   *
   * @see {@link bbbfly.MapDrawing#Remove|Remove()}
   */
  this.Add = bbbfly.map.drawing._add;
  /**
   * @function
   * @name Remove
   * @memberof bbbfly.MapDrawing#
   *
   * @param {mapFeature} feature - Feature to remove drawing from
   * @return {boolean} If removed properly
   *
   * @see {@link bbbfly.MapDrawing#Add|Add()}
   */
  this.Remove = bbbfly.map.drawing._remove;

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
  this.OnMouseEnter = bbbfly.map.drawing._onMouseEnter;
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
  this.OnMouseLeave = bbbfly.map.drawing._onMouseLeave;

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
  this.OnClick = bbbfly.map.drawing._onClick;
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
  this.OnDblClick = bbbfly.map.drawing._onClick;
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
 * @class
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapIcon.options} options
 *
 * @property {bbbfly.MapIcon.options} Options
 */
bbbfly.MapIcon = function(options){
  var drawing = new bbbfly.MapDrawing(options);

  /** @private */
  drawing._IconProxy = null;
  /** @private */
  drawing._IconHtml = '';

  /**
   * @function
   * @name Create
   * @memberof bbbfly.MapIcon#
   *
   * @return {mapMarker} Leaflet marker
   */
  ng_OverrideMethod(drawing,'Create',
    bbbfly.map.drawing.icon._create
  );
  /**
   * @function
   * @name Update
   * @memberof bbbfly.MapIcon#
   *
   * @return {boolean} If created properly
   */
  ng_OverrideMethod(drawing,'Update',
    bbbfly.map.drawing.icon._update
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
 * @extends bbbfly.MapDrawing
 * @inpackage mapbox
 *
 * @param {bbbfly.MapGeometry.options} options
 *
 * @property {bbbfly.MapGeometry.options} Options
 */
bbbfly.MapGeometry = function(options){
  var drawing = new bbbfly.MapDrawing(options);

  /**
   * @function
   * @name Create
   * @memberof bbbfly.MapGeometry#
   *
   * @return {mapGeometry[]} Leaflet geometry
   */
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

  return this;
};

/**
 * @typedef {object} options
 * @memberOf bbbfly.MapDrawing
 *
 * @property {string} ID
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapIcon
 *
 * @property {mapPoint} Coordinates
 *
 * @property {bbbfly.MapIcon.Style|string} Icon style or style ID
 */

/**
 * @typedef {bbbfly.MapDrawing.options} options
 * @memberOf bbbfly.MapGeometry
 *
 * @property {geoJSON|mapGeoJSON} GeoJSON
 * @property {px} [MinPartSize=0] - Hide smaller geometry parts
 *
 * @property {bbbfly.MapGeometry.Style|string} Geometry style or style ID
 */
