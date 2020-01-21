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

bbbfly.map.box._doCreateMap = function(options){
  var map = this.DoCreateMap.callParent(options);

  if(this.Drawings !== false){
    var feature = new L.FeatureGroup();
    var handler = new bbbfly.MapDrawingsHandler(feature);

    if(handler){
      feature.addTo(map);
      this.Drawings = handler;
      this._DrawingsFeature = feature;
    }
  }
  return map;
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

/**
 * @class
 * @type control
 * @extends bbbfly.Map
 *
 * @inpackage mapbox
 *
 * @property {bbbfly.MapDrawingsHandler} Drawings - Drawings handler
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.MapBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      AllowListeners: true,

      Drawings: null,
      /** @private */
      _DrawingsFeature: null,

      /** @private */
      _MapControls: {},
      /** @private */
      _MapControlsRegistered: false
    },
    OnCreated: bbbfly.map.box._onCreated,
    Events: {
      /** @private */
      OnUpdate: bbbfly.map.box._onUpdate
    },
    Methods: {
      /** @private */
      DoCreateMap: bbbfly.map.box._doCreateMap,
      /** @private */
      RegisterControls: bbbfly.map.box._registerControls,

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
       */
      SetMapControlsVisible: bbbfly.map.box._setMapControlsVisible
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Map',ref,parent);
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
