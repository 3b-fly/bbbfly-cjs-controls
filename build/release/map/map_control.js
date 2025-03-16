/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control={};bbbfly.map.control._doDispose=function(){bbbfly.MapRegistry.UnregisterControl(this);return this.DoDispose.callParent()};bbbfly.map.control._onCreated=function(a){bbbfly.MapRegistry.RegisterControl(a)};bbbfly.map.control._onVisibleChanged=function(){this.MapControlChanged()};bbbfly.map.control._mapControlChanged=function(){var a=this.GetMap();a&&Function.isFunction(a.OnMapControlChanged)&&a.OnMapControlChanged(this.ControlType)};
bbbfly.map.control._getMap=function(){return bbbfly.MapRegistry.GetMap(this.MapID)};bbbfly.map.control._linkToMap=function(a){if(Function.isFunction(this.OnLinkToMap)&&!this.OnLinkToMap(a)||!a.LinkMapControl(this.ControlType,this))return!1;Function.isFunction(this.OnLinkedToMap)&&this.OnLinkedToMap(a);return!0};
bbbfly.map.control._unlinkFromMap=function(a){if(Function.isFunction(this.OnUnlinkFromMap)&&!this.OnUnlinkFromMap(a)||!a.UnlinkMapControl(this.ControlType,this))return!1;Function.isFunction(this.OnUnlinkedFromMap)&&this.OnUnlinkedFromMap(a);return!0};bbbfly.map.control._onLinkedToMap=function(){this.MapControlChanged()};bbbfly.map.control._onUnlinkedFromMap=function(){this.MapControlChanged()};
bbbfly.map.control._getListener=function(){if(!Object.isObject(this._Listener)){var a=this.CreateListener();a&&(a.Owner=this);this._Listener=a}return this._Listener};bbbfly.map.control._createListener=function(){return null};
bbbfly.MapControl=function(a,b,c){a=a||{};ng_MergeDef(a,{CreteFromType:"bbbfly.Panel",ParentReferences:!1,Data:{MapID:null,ControlType:null,_Listener:null},OnCreated:bbbfly.map.control._onCreated,Events:{OnVisibleChanged:bbbfly.map.control._onVisibleChanged,OnLinkToMap:null,OnLinkedToMap:bbbfly.map.control._onLinkedToMap,OnUnlinkFromMap:null,OnUnlinkedFromMap:bbbfly.map.control._onUnlinkedFromMap},Methods:{DoDispose:bbbfly.map.control._doDispose,MapControlChanged:bbbfly.map.control._mapControlChanged,
GetMap:bbbfly.map.control._getMap,LinkToMap:bbbfly.map.control._linkToMap,UnlinkFromMap:bbbfly.map.control._unlinkFromMap,GetListener:bbbfly.map.control._getListener,CreateListener:bbbfly.map.control._createListener}});return ngCreateControlAsType(a,a.CreteFromType,b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_control={OnInit:function(){ngRegisterControlType("bbbfly.MapControl",bbbfly.MapControl)}};
