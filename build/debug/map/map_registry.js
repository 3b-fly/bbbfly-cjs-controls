/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.registry = {};
bbbfly.map.registry._getMap = function(mapId){
  var map = this._Maps[mapId];
  return map ? map : null;
};
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
bbbfly.map.registry._linkControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.MapID)){return false;}

  var map = this.GetMap(ctrl.MapID);
  if(!map){return false;}

  if(Function.isFunction(ctrl.LinkToMap)){
    return ctrl.LinkToMap(map);
  }
  return false;
};
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
bbbfly.map.registry._unlinkControl = function(ctrl){
  if(!ctrl || !String.isString(ctrl.MapID)){return false;}

  var map = this.GetMap(ctrl.MapID);
  if(!map){return false;}

  if(Function.isFunction(ctrl.UnlinkFromMap)){
    return ctrl.UnlinkFromMap(map);
  }
  return false;
};
bbbfly.MapRegistry = {
  _Maps: {},
  _MapControls: {},
  _UnlinkedControls: {},
  GetMap: bbbfly.map.registry._getMap,
  RegisterMap: bbbfly.map.registry._registerMap,
  RegisterControl: bbbfly.map.registry._registerControl,
  LinkControl: bbbfly.map.registry._linkControl,
  UnregisterMap: bbbfly.map.registry._unregisterMap,
  UnregisterControl: bbbfly.map.registry._unregisterControl,
  UnlinkControl: bbbfly.map.registry._unlinkControl
};