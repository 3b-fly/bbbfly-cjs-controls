/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = {};
bbbfly.map.control._doDispose = function(){
  bbbfly.MapRegistry.UnregisterControl(this);
  return this.DoDispose.callParent();
};
bbbfly.map.control._onCreated = function(ctrl){
  bbbfly.MapRegistry.RegisterControl(ctrl);
};
bbbfly.map.control._onVisibleChanged = function(){
  this.MapControlChanged();
};
bbbfly.map.control._mapControlChanged = function(){
  var map = this.GetMap();

  if(map && Function.isFunction(map.OnMapControlChanged)){
    map.OnMapControlChanged(this.ControlType);
  }
};
bbbfly.map.control._getMap = function(){
  return bbbfly.MapRegistry.GetMap(this.MapID);
};
bbbfly.map.control._linkToMap = function(map){
  if(
    Function.isFunction(this.OnLinkToMap)
    && !this.OnLinkToMap(map)
  ){return false;}

  if(!map.LinkMapControl(this.ControlType,this)){
    return false;
  }

  if(Function.isFunction(this.OnLinkedToMap)){
    this.OnLinkedToMap(map);
  }
  return true;
};
bbbfly.map.control._unlinkFromMap = function(map){
  if(
    Function.isFunction(this.OnUnlinkFromMap)
    && !this.OnUnlinkFromMap(map)
  ){return false;}

  if(!map.UnlinkMapControl(this.ControlType,this)){
    return false;
  }

  if(Function.isFunction(this.OnUnlinkedFromMap)){
    this.OnUnlinkedFromMap(map);
  }
  return true;
};
bbbfly.map.control._onLinkedToMap = function(){
  this.MapControlChanged();
};
bbbfly.map.control._onUnlinkedFromMap = function(){
  this.MapControlChanged();
};
bbbfly.map.control._getListener = function(){
  if(!Object.isObject(this._Listener)){
    var listener = this.CreateListener();
    if(listener){listener.Owner = this;}

    this._Listener = listener;
  }

  return this._Listener;
};
bbbfly.map.control._createListener = function(){
  return null;
};
bbbfly.MapControl = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    CreteFromType: 'bbbfly.Panel',
    ParentReferences: false,
    Data: {
      MapID: null,
      ControlType: null,
      _Listener: null
    },
    OnCreated: bbbfly.map.control._onCreated,
    Events: {
      OnVisibleChanged: bbbfly.map.control._onVisibleChanged,
      OnLinkToMap: null,
      OnLinkedToMap: bbbfly.map.control._onLinkedToMap,
      OnUnlinkFromMap: null,
      OnUnlinkedFromMap: bbbfly.map.control._onUnlinkedFromMap
    },
    Methods: {
      DoDispose: bbbfly.map.control._doDispose,
      MapControlChanged: bbbfly.map.control._mapControlChanged,
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
