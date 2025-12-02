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
bbbfly.map.box = {};

/** @ignore */
bbbfly.map.box._onCreated = function(map){
  bbbfly.listener.SetListenable(map,true);
  bbbfly.MapRegistry.RegisterMap(map);
  return true;
};

/** @ignore */
bbbfly.map.box._onUpdate = function(){
  if(!this._MapControlsRegistered){
    this.RegisterControls();
    this._MapControlsRegistered = true;
  }
  return true;
};

/** @ignore */
bbbfly.map.box._doCreateMap = function(options){
  if(!options){options = {};}

  options.drawControl = false;
  options.attributionControl = false;
  options.zoomControl = false;

  var map = this.DoCreateMap.callParent(options);
  if(!map){return null;}

  this._DrawingsFeature = new L.FeatureGroup();
  this._DrawingsFeature.addTo(map);

  if(this.Drawings !== false){
    this.Drawings = new bbbfly.MapDrawingsHandler(
      this._DrawingsFeature,this.Drawings
    );
  }

  this.CreateDrawControls(map);
  return map;
};

/** @ignore */
bbbfly.map.box._createDrawControls = function(map){
  if(!map){return null;}

  //set map callbacks
  map.on('draw:created',bbbfly.map.box._onDrawCreated);
  map.on('draw:deleted',bbbfly.map.box._onDrawDeleted);

  //create draw controls
  var drawMarker = !!(this.MapControls & bbbfly.MapBox.control.drawMarker);
  var drawGeometry = !!(this.MapControls & bbbfly.MapBox.control.drawGeometry);

  if((drawMarker || drawGeometry) && L.Control.Draw){
    L.drawLocal = ngTxt('bbbfly_map_control_draw');

    this._DrawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: (drawGeometry ? { repeatMode: true } : false),
        polyline: (drawGeometry ? { repeatMode: true } : false),
        rectangle: (drawGeometry ? { repeatMode: true } : false),
        circle: false,
        circlemarker: false,
        marker: drawMarker
      },
      edit: {
        featureGroup: this._DrawingsFeature
      }
    }).addTo(map);
  }

  if(this._DrawDrawing){
    this.SetDrawControlDrawing(this._DrawDrawing);
  }
};

/** @ignore */
bbbfly.map.box._onDrawCreated = function(event){
  var map = event.target.Owner;
  if(!map._DrawDrawing){return;}

  if(event.layer instanceof L.Marker){
    if(map.DrawSingleIcon){map.Drawings.ClearIcons();}

    var opts = ng_CopyVar(map._DrawDrawing.Options);
    opts.Point = event.layer.getLatLng();

    map.Drawings.AddDrawing(
      new bbbfly.MapDrawingItem(opts)
    );
  }
  else if(event.layer instanceof L.Polyline){
    if(map.DrawSingleGeometry){map.Drawings.ClearGeometries();}

    var opts = ng_CopyVar(map._DrawDrawing.Options);
    opts.Geometry = event.layer.toGeoJSON();

    map.Drawings.AddDrawing(
      new bbbfly.MapDrawingItem(opts)
    );
  }
};

/** @ignore */
bbbfly.map.box._onDrawDeleted = function(event){
  if(event.layers instanceof L.LayerGroup){
    event.layers.eachLayer(function(layer){

      var drawing = layer.Owner;
      if(!(drawing instanceof bbbfly.MapDrawingItem)){
        return;
      }

      if(layer instanceof L.Marker){
        drawing.RemoveIcon(layer);
      }
      else if(layer instanceof L.Polyline){
        drawing.RemoveGeometry(layer);
      }
    });
  }
};

/** @ignore */
bbbfly.map.box._registerControls = function(){
  if(!this.Controls){return;}

  for(var i in this.Controls){
    var ctrl = this.Controls[i];

    if(
      !Object.isObject(ctrl)
      || !Function.isFunction(ctrl.CtrlInheritsFrom)
      || !ctrl.CtrlInheritsFrom('bbbfly.MapControl')
    ){continue;}

    if(!String.isString(ctrl.MapID)){
      ctrl.MapID = this.ID;
      bbbfly.MapRegistry.RegisterControl(ctrl);
    }
  }
};

/** @ignore */
bbbfly.map.box._linkMapControl = function(type,ctrl){
  if(!String.isString(type) || !ctrl){return false;}
  if(!Function.isFunction(ctrl.GetListener)){return false;}
  if(!Function.isFunction(this.AddListener)){return false;}

  var listener = ctrl.GetListener();
  if(listener && !this.AddListener(listener.Listen,listener)){
    return false;
  }

  if(!Array.isArray(this._MapControls[type])){
    this._MapControls[type] = [];
  }

  var stack = this._MapControls[type];
  if(!Array.includes(stack,ctrl)){stack.push(ctrl);}
  return true;
};

/** @ignore */
bbbfly.map.box._unlinkMapControl = function(type,ctrl){
  if(!String.isString(type) || !ctrl){return false;}
  if(!Function.isFunction(ctrl.GetListener)){return false;}
  if(!Function.isFunction(this.RemoveListener)){return false;}

  var listener = ctrl.GetListener();
  if(listener && !this.RemoveListener(listener.Listen,listener)){
    return false;
  }

  var stack = this._MapControls[type];
  var idx = Array.indexOf(stack,ctrl);
  if(idx > 0){stack.splice(idx,1);}
  return true;
};

/** @ignore */
bbbfly.map.box._getMapControls = function(type){
  var ctrls = [];
  var ids = {};

  for(var tp in this._MapControls){
    if(String.isString(type) && (tp !== type)){continue;}

    var stack = this._MapControls[tp];
    if(!Array.isArray(stack)){continue;}

    for(var i in stack){
      var ctrl = stack[i];

      if(String.isString(ctrl.ID)){
        if(ids[ctrl.ID]){continue;}
        ids[ctrl.ID] = true;
      }

      ctrls.push(ctrl);
    }
  }
  return ctrls;
};

/** @ignore */
bbbfly.map.box._setMapControlsVisible = function(type,visible){
  if(!String.isString(type)){return false;}
  if(!Boolean.isBoolean(visible)){visible = true;}

  var ctrls = this.GetMapControls(type);
  for(var i in ctrls){
    var ctrl = ctrls[i];
    if(ctrl && Function.isFunction(ctrl.SetVisible)){
      ctrl.SetVisible(visible);
    }
  }
};

/** @ignore */
bbbfly.map.box._fitDrawing = function(id){
  var drawings = this.Drawings;
  if(drawings instanceof bbbfly.MapDrawingsHandler){
    var drawing = drawings.GetDrawing(id);

    if(drawing){
      var point = drawing.GetPoint();
      if(!point){point = drawing.GetGeometryCenter();}

      return this.FitCoords(point);
    }
  }
  return false;
};

/** @ignore */
bbbfly.map.box._fitDrawings = function(){
  if(this._DrawingsFeature){
    var bounds = this._DrawingsFeature.getBounds();
    if(bounds.isValid()){return this.FitBounds(bounds);}
  }
  return false;
};

/** @ignore */
bbbfly.map.box._setMode = function(modeType,mode){
  if(!String.isString(modeType)){return false;}
  if((!String.isString(mode) && (mode !== null))){return false;}

  var changed = false;

  if(mode === null){
    changed = !!this._MapMode[modeType];
    delete this._MapMode[modeType];
  }
  else{
    changed = (mode !== this._MapMode[modeType]);
    this._MapMode[modeType] = mode;
  }

  if(changed && Function.isFunction(this.OnModeChanged)){
    this.OnModeChanged(modeType,mode);
  }
  return true;
};

/** @ignore */
bbbfly.map.box._getMode = function(modeType){
  if(this._MapMode && String.isString(this._MapMode[modeType])){
    return this._MapMode[modeType];
  }
  return null;
};

/** @ignore */
bbbfly.map.box._getModes = function(){
  return (this._MapMode ? this._MapMode : {});
};

/** @ignore */
bbbfly.map.box._setDrawControlDrawing = function(drawing){
  if(!(drawing instanceof bbbfly.MapDrawingItem)){return false;}
  this._DrawDrawing = drawing;

  if(this._DrawControl){

    var state = {
      readonly: true,
      selected: true
    };

    var icon = drawing.NewIcon(state);
    var geomStyle = drawing.GetGeometryStyle();

    this._DrawControl.setDrawingOptions({
      marker: { icon: icon },
      polygon: { shapeOptions: geomStyle },
      polyline: { shapeOptions: geomStyle },
      rectangle: { shapeOptions: geomStyle }
    });
  }

  return true;
};

/** @ignore */
bbbfly.map.box._stopDrawControlActions = function(){
  if(this._DrawControl){
    for(var i in this._DrawControl._toolbars){
      var toolbar = this._DrawControl._toolbars[i];
      toolbar.disable();
    }
  }
};

/**
 * @class
 * @type control
 * @extends bbbfly.Map
 *
 * @inpackage mapbox
 *
 * @property {bbbfly.MapBox.control} [MapControls=none] - Set this property to allow desired map controls.
 * @property {bbbfly.MapDrawingsHandler} Drawings - Drawings handler
 * @property {boolean} [DrawSingleIcon=false] - If map can contain max one icon
 * @property {boolean} [DrawSingleGeometry=false] - If map can contain max one geometry
 *
 * @param {bbbfly.MapBox.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.MapBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      MapControls: bbbfly.MapBox.control.none,

      Drawings: null,
      DrawSingleIcon: false,
      DrawSingleGeometry: false,

      /** @private */
      _DrawingsFeature: null,
      /** @private */
      _DrawControl: null,
      /** @private */
      _DrawDrawing: null,

      /** @private */
      _MapControls: {},
      /** @private */
      _MapControlsRegistered: false,

      /** @private */
      _MapMode: {},

      /** @private */
      ChildHandling: ngChildEnabledParentAware
    },
    OnCreated: bbbfly.map.box._onCreated,
    Events: {
      /** @private */
      OnUpdate: bbbfly.map.box._onUpdate,

      /**
       * @event
       * @name OnModeChanged
       * @memberof bbbfly.MapBox#
       *
       * @param {string} modeType
       * @param {string|null} mode
       *
       * @see {@link bbbfly.MapBox#SetMode|SetMode()}
       * @see {@link bbbfly.MapBox#GetMode|GetMode()}
       * @see {@link bbbfly.MapBox#GetModes|GetModes()}
       */
      OnModeChanged: null
    },
    Methods: {
      /** @private */
      DoCreateMap: bbbfly.map.box._doCreateMap,
      /** @private */
      RegisterControls: bbbfly.map.box._registerControls,
      /** @private */
      CreateDrawControls: bbbfly.map.box._createDrawControls,

      /**
       * @function
       * @name LinkMapControl
       * @memberof bbbfly.MapBox#
       *
       * @description Link map control to map.
       *
       * @param {string} type
       * @param {bbbfly.MapControl} ctrl
       * @return {boolean} If control was linked
       *
       * @see {@link bbbfly.MapBox#UnlinkMapControl|UnlinkMapControl()}
       * @see {@link bbbfly.MapBox#GetMapControls|GetMapControls()}
       * @see {@link bbbfly.MapBox#SetMapControlsVisible|SetMapControlsVisible()}
       */
      LinkMapControl: bbbfly.map.box._linkMapControl,
      /**
       * @function
       * @name UnlinkMapControl
       * @memberof bbbfly.MapBox#
       *
       * @description Unlink map control from map.
       *
       * @param {string} type
       * @param {bbbfly.MapControl} ctrl
       * @return {boolean} If control was unlinked
       *
       * @see {@link bbbfly.MapBox#LinkMapControl|LinkMapControl()}
       * @see {@link bbbfly.MapBox#GetMapControls|GetMapControls()}
       * @see {@link bbbfly.MapBox#SetMapControlsVisible|SetMapControlsVisible()}
       */
      UnlinkMapControl: bbbfly.map.box._unlinkMapControl,
      /**
       * @function
       * @name GetMapControls
       * @memberof bbbfly.MapBox#
       * @description Get passed type linked map controls.
       *
       * @param {string} [type=undefined]
       * @return {bbbfly.MapControl[]}
       *
       * @see {@link bbbfly.MapBox#LinkMapControl|LinkMapControl()}
       * @see {@link bbbfly.MapBox#UnlinkMapControl|UnlinkMapControl()}
       * @see {@link bbbfly.MapBox#SetMapControlsVisible|SetMapControlsVisible()}
       */
      GetMapControls: bbbfly.map.box._getMapControls,
      /**
       * @function
       * @name SetMapControlsVisible
       * @memberof bbbfly.MapBox#
       * @description Set visibility of passed type map controls.
       *
       * @param {string} type
       * @param {boolean} [visible=true]
       * @return {boolean} If map control visibility was set.
       *
       * @see {@link bbbfly.MapBox#LinkMapControl|LinkMapControl()}
       * @see {@link bbbfly.MapBox#UnlinkMapControl|UnlinkMapControl()}
       * @see {@link bbbfly.MapBox#GetMapControls|GetMapControls()}
       */
      SetMapControlsVisible: bbbfly.map.box._setMapControlsVisible,

      /**
      * @function
      * @name FitDrawing
      * @memberof bbbfly.MapBox#
      * @description Pan to see drawing
      *
      * @param {string} id
      *
      * @return {boolean} If fit was successful
      *
      * @see {@link bbbfly.MapBox#FitDrawings|FitDrawings()}
      */
      FitDrawing: bbbfly.map.box._fitDrawing,
      /**
      * @function
      * @name FitDrawings
      * @memberof bbbfly.MapBox#
      * @description Pan and zoom to see all drawings
      *
      * @return {boolean} If fit was successful
      *
      * @see {@link bbbfly.MapBox#FitDrawing|FitDrawing()}
      */
      FitDrawings: bbbfly.map.box._fitDrawings,

      /**
       * @function
       * @name SetMode
       * @memberof bbbfly.MapBox#
       * @description Set map mode
       *
       * @param {string} modeType
       * @param {string|null} mode
       * @return {string|null}
       *
       * @see {@link bbbfly.MapBox#GetMode|GetMode()}
       * @see {@link bbbfly.MapBox#GetModes|GetModes()}
       * @see {@link bbbfly.MapBox#event:OnModeChanged|OnModeChanged}
       */
      SetMode: bbbfly.map.box._setMode,
      /**
       * @function
       * @name GetMode
       * @memberof bbbfly.MapBox#
       * @description Get map mode
       *
       * @param {string} modeType
       * @return {string|null}
       *
       * @see {@link bbbfly.MapBox#SetMode|SetMode()}
       * @see {@link bbbfly.MapBox#GetModes|GetModes()}
       * @see {@link bbbfly.MapBox#event:OnModeChanged|OnModeChanged}
       */
      GetMode: bbbfly.map.box._getMode,
      /**
       * @function
       * @name GetModes
       * @memberof bbbfly.MapBox#
       * @description Get all map modes
       *
       * @return {string[]}
       *
       * @see {@link bbbfly.MapBox#SetMode|SetMode()}
       * @see {@link bbbfly.MapBox#GetMode|GetMode()}
       * @see {@link bbbfly.MapBox#event:OnModeChanged|OnModeChanged}
       */
      GetModes: bbbfly.map.box._getModes,

      /**
       * @function
       * @name SetDrawControlDrawing
       * @memberof bbbfly.MapBox#
       * @description Set draw control geometry type
       *
       * @param {bbbfly.MapDrawingItem} drawing
       * @return {boolean}
       */
      SetDrawControlDrawing: bbbfly.map.box._setDrawControlDrawing,
      /**
       * @function
       * @name StopDrawControlActions
       * @memberof bbbfly.MapBox#
       * @description Stop all draw control actions
       */
      StopDrawControlActions: bbbfly.map.box._stopDrawControlActions
    }
  });

  var mapControls = def.Data.MapControls;
  if(mapControls){

    if(mapControls & bbbfly.MapBox.control.copyrights){
      ng_MergeDef(def,{
        Controls: {
          Copyrights: {
            Type: 'bbbfly.MapCopyrights',
            style: { zIndex: 3 },
            Data: { Visible: false }
          }
        }
      });
    }

    if(mapControls & bbbfly.MapBox.control.layers){
      ng_MergeDef(def,{
        Controls: {
          Layers: {
            Type: 'bbbfly.MapLayers',
            style: { zIndex: 3 },
            Data: { Visible: false }
          }
        }
      });
    }

    if(mapControls & bbbfly.MapBox.control.drawBar){
      ng_MergeDef(def,{
        Controls: {
          DrawBar: {
            Type: 'bbbfly.MapDrawBar',
            style: { zIndex: 2 }
          }
        }
      });
    }

    if(mapControls & bbbfly.MapBox.control.modeBar){
      ng_MergeDef(def,{
        Controls: {
          ModeBar: {
            Type: 'bbbfly.MapModeBar',
            style: { zIndex: 2 }
          }
        }
      });
    }

    if(mapControls & bbbfly.MapBox.control.sideBar){
      ng_MergeDef(def,{
        Controls: {
          SideBar: {
            Type: 'bbbfly.MapSideBar',
            style: { zIndex: 2 },
            Data: { MapControls: mapControls }
          }
        }
      });
    }

    if(mapControls & bbbfly.MapBox.control.zoomSlider){
      ng_MergeDef(def,{
        Controls: {
          ZoomSlider: {
            Type: 'bbbfly.MapZoomSlider',
            style: { zIndex: 2 }
          }
        }
      });
    }
  }

  bbbfly.listener.Initialize();

  return ngCreateControlAsType(def,'bbbfly.Map',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.MapBox|bbbfly.Mapbox.MapControls}
 */
bbbfly.MapBox.control = {
  none: 0,
  copyrights: 1,
  layers: 2,
  drawBar: 4,
  modeBar: 8,
  sideBar: 16,
  zoomSlider: 32,

  drawMarker: 64,
  drawGeometry: 128
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_box'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapBox',bbbfly.MapBox
    );
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.MapBox
 * @extends bbbfly.Map.Definition
 *
 * @description MapBox control definition
 */
