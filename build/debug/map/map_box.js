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

  if(this.Drawings !== false){
    var feature = new L.FeatureGroup();
    var handler = new bbbfly.MapDrawingsHandler(feature,this.Drawings);

    if(handler){
      feature.addTo(map);
      this.Drawings = handler;
      this._DrawingsFeature = feature;
    }
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
bbbfly.map.box._fitDrawings = function(){
  if(this._DrawingsFeature){
    var bounds = this._DrawingsFeature.getBounds();
    if(bounds.isValid()){return this.FitBounds(bounds);}
  }
  return false;
};
bbbfly.MapBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      AllowListeners: true,

      Drawings: null,
      _DrawingsFeature: null,
      _MapControls: {},
      _MapControlsRegistered: false
    },
    OnCreated: bbbfly.map.box._onCreated,
    Events: {
      OnUpdate: bbbfly.map.box._onUpdate
    },
    Methods: {
      DoCreateMap: bbbfly.map.box._doCreateMap,
      RegisterControls: bbbfly.map.box._registerControls,
      LinkMapControl: bbbfly.map.box._linkMapControl,
      UnlinkMapControl: bbbfly.map.box._unlinkMapControl,
      GetMapControls: bbbfly.map.box._getMapControls,
      SetMapControlsVisible: bbbfly.map.box._setMapControlsVisible,
      FitDrawings: bbbfly.map.box._fitDrawings
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Map',ref,parent);
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_box'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapBox',bbbfly.MapBox
    );
  }
};
