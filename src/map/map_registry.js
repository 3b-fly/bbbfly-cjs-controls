/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage map
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.registry = {};

/** @ignore */
bbbfly.map.registry._getMap = function(mapId){
  var map = this._Maps[mapId];
  return map ? map : null;
};

/** @ignore */
bbbfly.map.registry._registerMap = function(map){
  if(!map || !String.isString(map.ID)){return false;}
  if(this._Maps[map.ID]){return false;}

  if(
    Function.isFunction(map.CtrlInheritsFrom)
    && map.CtrlInheritsFrom('bbbfly.Map')
  ){
    this._Maps[map.ID] = map;

    for(var id in this._UnlinkedControls){
      var ctrl = this._UnlinkedControls[id];
      if(ctrl.mapID !== map.ID){continue;}

      if(
        Function.isFunction(ctrl.LinkToMap)
        && ctrl.LinkToMap(map)
      ){
        delete(this._UnlinkedControls[id]);
        this._MapControls[id] = ctrl;
      }
    }
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.registry._registerControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.ID)){return false;}
  if(this._UnlinkedControls[ctrl.ID]){return false;}
  if(this._MapControls[ctrl.ID]){return false;}

  if(
    Function.isFunction(ctrl.CtrlInheritsFrom)
    && ctrl.CtrlInheritsFrom('bbbfly.MapControl')
  ){

    var stack = this.LinkControl(ctrl)
      ? this._MapControls
      : this._UnlinkedControls;

    stack[ctrl.ID] = ctrl;
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.registry._linkControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.MapID)){return false;}

  var map = this.GetMap(ctrl.MapID);
  if(!map){return false;}

  if(Function.isFunction(ctrl.LinkToMap)){
    return ctrl.LinkToMap(map);
  }
  return false;
};

/** @ignore */
bbbfly.map.registry._unregisterMap = function(map){
  if(!map || !String.isString(map.ID)){return false;}
  if(this._Maps[map.ID] !== map){return false;}

  for(var id in this._MapControls){
    var ctrl = this._MapControls[id];
    if(ctrl.mapID !== map.ID){continue;}

    if(
      Function.isFunction(ctrl.UnlinkFromMap)
      && ctrl.UnlinkFromMap(map)
    ){
      delete(this._MapControls[id]);
      this._UnlinkedControls[id] = ctrl;
    }
  }

  delete(this._Maps[map.ID]);
  return true;
};

/** @ignore */
bbbfly.map.registry._unregisterControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.ID)){return false;}

  if(this._MapControls[ctrl.ID] === ctrl){
    delete(this._MapControls[ctrl.ID]);
    this.UnlinkControl(ctrl);
    return true;
  }
  if(this._UnlinkedControls[ctrl.ID] === ctrl){
    delete(this._UnlinkedControls[ctrl.ID]);
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.map.registry._unlinkControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.MapID)){return false;}

  var map = this.GetMap(ctrl.MapID);
  if(!map){return false;}

  if(Function.isFunction(ctrl.UnlinkFromMap)){
    return ctrl.UnlinkFromMap(map);
  }
  return false;
};

/**
 * @class
 * @hideconstructor
 *
 * @inpackage map
 */
bbbfly.MapRegistry = {
  /** @private */
  _Maps: {},
  /** @private */
  _MapControls: {},
  /** @private */
  _UnlinkedControls: {},

  /**
   * @function
   * @nameGetMap
   * @memberof bbbfly.MapRegistry#
   *
   * @param {string} mapId
   * @return {bbbfly.Map|null}
   */
  GetMap: bbbfly.map.registry._getMap,
  /**
   * @function
   * @name RegisterMap
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.Map} map
   * @return {boolean}
   */
  RegisterMap: bbbfly.map.registry._registerMap,
  /**
   * @function
   * @name RegisterMap
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.MapControl} ctrl
   * @return {boolean}
   */
  RegisterControl: bbbfly.map.registry._registerControl,
    /**
   * @function
   * @name LinkControl
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.MapControl} ctrl
   * @return {boolean}
   */
  LinkControl: bbbfly.map.registry._linkControl,
  /**
   * @function
   * @name UnregisterMap
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.Map} map
   * @return {boolean}
   */
  UnregisterMap: bbbfly.map.registry._unregisterMap,
  /**
   * @function
   * @name RegisterMap
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.MapControl} ctrl
   * @return {boolean}
   */
  UnregisterControl: bbbfly.map.registry._unregisterControl,
  /**
   * @function
   * @name UnlinkControl
   * @memberof bbbfly.MapRegistry#
   *
   * @param {bbbfly.MapControl} ctrl
   * @return {boolean}
   */
  UnlinkControl: bbbfly.map.registry._unlinkControl
};