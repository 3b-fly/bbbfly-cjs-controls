/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = bbbfly.map.control || {};
bbbfly.map.control.sidebar = {
  control_type: 'sidebar'
};
bbbfly.map.control.sidebar._onLinkedToMap = function(map){
  if(!map || !Array.isArray(this._Buttons)){return;}
  var buttons = this._Buttons;

  for(var i in buttons){
    var button = buttons[i];
    button.SetMap(map);
  }
};
bbbfly.map.control.sidebar._createListener = function(){
  return {
    Listen: ['OnMapControlChanged'],
    OnMapControlChanged: bbbfly.map.control.sidebar._onMapControlChanged
  };
};

bbbfly.map.control.sidebar._onMapControlChanged = function(type){
  var map = this.Owner.GetMap();
  var btns = this.Owner._Buttons;

  if(!map || !Array.isArray(btns)){return;}
  var ctrls = map.GetMapControls(type);

  for(var i in btns){
    var button = btns[i];
    if(button.Target !== type){continue;}

    var select = false;
    for(var j in ctrls){
      if(ctrls[j].Visible){
        select = true;
        break;
      }
    }

    button.SetVisible(ctrls.length > 0);
    button.SetSelected(select);
  }
};

bbbfly.map.control.sidebar._onBtnCreated = function(ctrl){
  var self = ctrl;

  while(ctrl){
    var parent = ctrl.ParentControl;
    if(!parent){return;}

    if(
      Function.isFunction(parent.CtrlInheritsFrom)
      && parent.CtrlInheritsFrom('bbbfly.MapSideBar')
    ){
      var stack = parent._Buttons;
      if(Array.isArray(stack)){stack.push(self);}
      return;
    }
    ctrl = parent;
  }
};

bbbfly.map.control.sidebar._setBtnMap = function(map){
  if(
    Object.isObject(map)
    && Function.isFunction(map.CtrlInheritsFrom)
    && map.CtrlInheritsFrom('bbbfly.MapBox')
  ){
    this._Map = map;
  }
  else{
    this._Map = null;
  }
};

bbbfly.map.control.sidebar._getBtnMap = function(){
  return this._Map;
};

bbbfly.map.control.sidebar._onBtnSelectedChanged = function(){
  var map = this.GetMap();
  if(!map || !this.Target){return;}

  switch(this.Action){
    case bbbfly.MapSideBar.action.map_control:
      map.SetMapControlsVisible(this.Target,!!this.Selected);
    break;
  }
};
bbbfly.MapSideBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    SectionDef: {
      Type: 'bbbfly.Panel',
      ParentReferences: false
    },
    ButtonDef: {
      Type: 'bbbfly.Button',
      Data: {
        SelectType: bbbfly.Button.selecttype.both,
        _Map: null
      },
      OnCreated: bbbfly.map.control.sidebar._onBtnCreated,
      Events: {
        OnSelectedChanged: bbbfly.map.control.sidebar._onBtnSelectedChanged
      },
      Methods: {
        SetMap: bbbfly.map.control.sidebar._setBtnMap,
        GetMap: bbbfly.map.control.sidebar._getBtnMap
      }
    },
    Data: {
      ControlType: bbbfly.map.control.sidebar.control_type,
      MapControls: bbbfly.MapBox.control.none,
      _Buttons: []
    },
    Events: {
      OnLinkedToMap: bbbfly.map.control.sidebar._onLinkedToMap
    },
    Methods: {
      CreateListener: bbbfly.map.control.sidebar._createListener,
      GetButtonAlt: null,
      GetButtonIcon: null
    }
  });

  var mapControls = def.Data.MapControls;

  if(mapControls){
    var mapCtrlsDef = {};

    if(mapControls & bbbfly.MapBox.control.layers){
      mapCtrlsDef.Layers = {
        Data: {
          Action: bbbfly.MapSideBar.action.map_control,
          Target: bbbfly.map.control.layers.control_type,
          AltRes: 'bbbfly_map_control_sidebar_layers',
          Group: { selected: 'map_control' }
        }
      };
    }

    if(mapControls & bbbfly.MapBox.control.copyrights){
      mapCtrlsDef.Copyrights = {
        Data: {
          Action: bbbfly.MapSideBar.action.map_control,
          Target: bbbfly.map.control.copyrights.control_type,
          AltRes: 'bbbfly_map_control_sidebar_copyrights',
          Group: { selected: 'map_control' }
        }
      };
    }

    ng_MergeDef(def,{
      Controls: {
        MapControls: {
          Controls: mapCtrlsDef
        }
      }
    });
  }

  for(var i in def.Controls){
    var section = def.Controls[i];
    if(!section){continue;}

    if(section.Controls){
      for(var j in section.Controls){
        var button = section.Controls[j];

        if(button && def.ButtonDef){
          ng_MergeDef(button,ng_CopyVar(def.ButtonDef));
        }
      }
    }

    if(def.SectionDef){
      ng_MergeDef(section,ng_CopyVar(def.SectionDef));
    }
  }

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};
bbbfly.MapSideBar.action = {
  map_control: 1,
  map_mode: 2
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_sidebar'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapSideBar',bbbfly.MapSideBar
    );
  }
};
