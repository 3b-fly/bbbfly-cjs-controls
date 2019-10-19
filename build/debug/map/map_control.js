/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = {};
bbbfly.map.control._onCreated = function(ctrl){
  bbbfly.MapRegistry.RegisterControl(ctrl);
};
bbbfly.map.control._getMap = function(){
  return bbbfly.MapRegistry.GetMap(this.MapID);
};
bbbfly.map.control._linkToMap = function(map){
  if(
    Function.isFunction(this.OnLinkToMap)
    && !this.OnLinkToMap(map)
  ){return false;}

  if(!Function.isFunction(map.AddListener)){return false;}

  var listener = this.GetListener() || this.CreateListener();
  if(!map.AddListener(listener.Listen,listener)){return false;}

  if(Function.isFunction(this.OnLinkedToMap)){
    this.OnLinkedToMap(map);
  }
  return true;
};
bbbfly.map.control._unlinkFromMap = function(map){
  if(
    Function.isFunction(this.OnUnlinkFronMap)
    && !this.OnUnlinkFronMap(map)
  ){return false;}

  if(!Function.isFunction(map.RemoveListener)){return false;}

  var listener = this.GetListener();
  if(!map.RemoveListener(listener.Listen,listener)){return false;}


  if(Function.isFunction(this.OnUnlinkedFromMap)){
    this.OnUnlinkedFromMap(map);
  }
  return true;
};
bbbfly.map.control._getListener = function(){
  return Object.isObject(this._Listener) ? this._Listener : null;
};
bbbfly.map.control._createListener = function(){
  this._Listener = {
    _byRef: {Owner:true},
    Owner: this,
    Listen: []
  };

  return this.GetListener();
};
bbbfly.MapControl = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    CreteFromType: 'bbbfly.Panel',
    ParentReferences: false,
    Data: {
      MapID: null,
      _Listener: null
    },
    OnCreated: bbbfly.map.control._onCreated,
    Events: {
      OnLinkToMap: null,
      OnLinkedToMap: null,
      OnUnlinkFromMap: null,
      OnUnlinkedFromMap: null
    },
    Methods: {
      GetMap: bbbfly.map.control._getMap,
      LinkToMap: bbbfly.map.control._linkToMap,
      UnlinkFromMap: bbbfly.map.control._unlinkFromMap,
      GetListener: bbbfly.map.control._getListener,
      CreateListener: bbbfly.map.control._createListener
    }
  });

  return ngCreateControlAsType(def,def.CreteFromType,ref,parent);
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapControl',bbbfly.MapControl
    );
  }
};
