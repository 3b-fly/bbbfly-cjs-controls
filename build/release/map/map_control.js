/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control={};bbbfly.map.control._doDispose=function(){bbbfly.MapRegistry.UnregisterControl(this);return this.DoDispose.callParent()};bbbfly.map.control._onCreated=function(a){bbbfly.MapRegistry.RegisterControl(a)};bbbfly.map.control._getMap=function(){return bbbfly.MapRegistry.GetMap(this.MapID)};
bbbfly.map.control._linkToMap=function(a){if(Function.isFunction(this.OnLinkToMap)&&!this.OnLinkToMap(a)||!a.LinkMapControl(this.ControlType,this))return!1;Function.isFunction(this.OnLinkedToMap)&&this.OnLinkedToMap(a);return!0};bbbfly.map.control._unlinkFromMap=function(a){if(Function.isFunction(this.OnUnlinkFromMap)&&!this.OnUnlinkFromMap(a)||!a.UnlinkMapControl(this.ControlType,this))return!1;Function.isFunction(this.OnUnlinkedFromMap)&&this.OnUnlinkedFromMap(a);return!0};
bbbfly.map.control._getListener=function(){if(!Object.isObject(this._Listener)){var a=this.CreateListener();a&&(a.Owner=this);this._Listener=a}return this._Listener};bbbfly.map.control._createListener=function(){return null};
bbbfly.MapControl=function(a,b,c){a=a||{};ng_MergeDef(a,{CreteFromType:"bbbfly.Panel",ParentReferences:!1,Data:{MapID:null,ControlType:null,_Listener:null},OnCreated:bbbfly.map.control._onCreated,Events:{OnLinkToMap:null,OnLinkedToMap:null,OnUnlinkFromMap:null,OnUnlinkedFromMap:null},Methods:{DoDispose:bbbfly.map.control._doDispose,GetMap:bbbfly.map.control._getMap,LinkToMap:bbbfly.map.control._linkToMap,UnlinkFromMap:bbbfly.map.control._unlinkFromMap,GetListener:bbbfly.map.control._getListener,CreateListener:bbbfly.map.control._createListener}});
return ngCreateControlAsType(a,a.CreteFromType,b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_control={OnInit:function(){ngRegisterControlType("bbbfly.MapControl",bbbfly.MapControl)}};
