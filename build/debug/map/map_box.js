/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.box = {};
bbbfly.map.box._onCreated = function(map){
  bbbfly.listener.SetListenable(map,true);
  bbbfly.MapRegistry.RegisterMap(map);
  return true;
};
bbbfly.map.box._onUpdate = function(){
  if(!this._MapControlsRegistered){
    this.RegisterControls();
    this._MapControlsRegistered = true;
  }
  return true;
};

bbbfly.map.box._doCreateMap = function(options){
  var map = this.DoCreateMap.callParent(options);

  this._DrawingsFeature = new L.FeatureGroup();
  this._DrawingsFeature.addTo(map);

  if(this.Drawings !== false){
    this.Drawings = new bbbfly.MapDrawingsHandler(
      this._DrawingsFeature,this.Drawings
    );
  }

  return map;
};
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
bbbfly.map.box._getMapControls = function(type){
  var ctrls = [];
  var ids = {};

  for(var tp in this._MapControls){
    if(String.isString(type) && (tp !== type)){continue;}

    var stack = this._MapControls[type];
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
bbbfly.map.box._fitDrawings = function(){
  if(this._DrawingsFeature){
    var bounds = this._DrawingsFeature.getBounds();
    if(bounds.isValid()){return this.FitBounds(bounds);}
  }
  return false;
};
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
bbbfly.map.box._getMode = function(modeType){
  if(this._MapMode && String.isString(this._MapMode[modeType])){
    return this._MapMode[modeType];
  }
  return null;
};
bbbfly.map.box._getModes = function(){
  return (this._MapMode ? this._MapMode : {});
};
bbbfly.MapBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      MapControls: bbbfly.MapBox.control.none,
      Drawings: null,
      _DrawingsFeature: null,
      _MapControls: {},
      _MapControlsRegistered: false,
      _MapMode: {},
      ChildHandling: ngChildEnabledParentAware
    },
    OnCreated: bbbfly.map.box._onCreated,
    Events: {
      OnUpdate: bbbfly.map.box._onUpdate,
      OnModeChanged: null
    },
    Methods: {
      DoCreateMap: bbbfly.map.box._doCreateMap,
      RegisterControls: bbbfly.map.box._registerControls,
      LinkMapControl: bbbfly.map.box._linkMapControl,
      UnlinkMapControl: bbbfly.map.box._unlinkMapControl,
      GetMapControls: bbbfly.map.box._getMapControls,
      SetMapControlsVisible: bbbfly.map.box._setMapControlsVisible,
      FitDrawing: bbbfly.map.box._fitDrawing,
      FitDrawings: bbbfly.map.box._fitDrawings,
      SetMode: bbbfly.map.box._setMode,
      GetMode: bbbfly.map.box._getMode,
      GetModes: bbbfly.map.box._getModes
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
bbbfly.MapBox.control = {
  none: 0,
  sideBar: 1,
  zoomSlider: 2,
  copyrights: 4,
  layers: 8,
  modeBar: 16
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_box'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapBox',bbbfly.MapBox
    );
  }
};
