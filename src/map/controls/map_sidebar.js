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
bbbfly.map.control = bbbfly.map.control || {};
/** @ignore */
bbbfly.map.control.sidebar = {
  control_type: 'sidebar'
};

/** @ignore */
bbbfly.map.control.sidebar._onLinkedToMap = function(map){
  if(!map || !Array.isArray(this._Buttons)){return;}
  var buttons = this._Buttons;

  for(var i in buttons){
    var button = buttons[i];
    button.SetMap(map);
  }
};

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends bbbfly.MapSideBar
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapSideBar.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.sidebar.control_type]
 * @property {bbbfly.MapBox.control} [MapControls=none] - Map controls to handle
 *
 * @property {object} SectionDef - Section definition
 * @property {object} ButtonDef - Button definition
 */
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

      /** @private */
      _Buttons: []
    },
    Events: {
      /** @private */
      OnLinkedToMap: bbbfly.map.control.sidebar._onLinkedToMap
    },
    Methods: {
      /** @private */
      CreateListener: bbbfly.map.control.sidebar._createListener,
      /**
       * @function
       * @name GetButtonAlt
       * @memberof bbbfly.MapSideBar#
       * @description Get button alt string
       *
       * @param {string} id - Button ID
       * @param {string} group - Button group
       * @returns {string|null} - Button alt
       */
      GetButtonAlt: null,
      /**
       * @function
       * @name GetButtonIcon
       * @memberof bbbfly.MapSideBar#
       * @description Get button icon
       *
       * @param {string} id - Button ID
       * @param {string} group - Button group
       * @return {bbbfly.Renderer.image} Icon definition
       */
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

/** @enum {integer} */
bbbfly.MapSideBar.action = {
  map_control: 1,
  map_mode: 2
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_sidebar'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapSideBar',bbbfly.MapSideBar
    );
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.MapSideBar
 * @extends bbbfly.MapControl.Definition
 *
 * @description MapSideBar control definition
 */
