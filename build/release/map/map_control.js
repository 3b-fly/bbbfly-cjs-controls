/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control={};bbbfly.map.control._onCreated=function(a){bbbfly.MapRegistry.RegisterControl(a)};bbbfly.map.control._getMap=function(){return bbbfly.MapRegistry.GetMap(this.MapID)};
bbbfly.map.control._linkToMap=function(a){if(Function.isFunction(this.OnLinkToMap)&&!this.OnLinkToMap(a)||!Function.isFunction(a.AddListener))return!1;var b=this.GetListener()||this.CreateListener();if(!a.AddListener(b.Listen,b))return!1;Function.isFunction(this.OnLinkedToMap)&&this.OnLinkedToMap(a);return!0};
bbbfly.map.control._unlinkFromMap=function(a){if(Function.isFunction(this.OnUnlinkFronMap)&&!this.OnUnlinkFronMap(a)||!Function.isFunction(a.RemoveListener))return!1;var b=this.GetListener();if(!a.RemoveListener(b.Listen,b))return!1;Function.isFunction(this.OnUnlinkedFromMap)&&this.OnUnlinkedFromMap(a);return!0};bbbfly.map.control._getListener=function(){return Object.isObject(this._Listener)?this._Listener:null};
bbbfly.map.control._createListener=function(){this._Listener={_byRef:{Owner:!0},Owner:this,Listen:[]};return this.GetListener()};
bbbfly.MapControl=function(a,b,c){a=a||{};ng_MergeDef(a,{CreteFromType:"bbbfly.Panel",ParentReferences:!1,Data:{MapID:null,_Listener:null},OnCreated:bbbfly.map.control._onCreated,Events:{OnLinkToMap:null,OnLinkedToMap:null,OnUnlinkFromMap:null,OnUnlinkedFromMap:null},Methods:{GetMap:bbbfly.map.control._getMap,LinkToMap:bbbfly.map.control._linkToMap,UnlinkFromMap:bbbfly.map.control._unlinkFromMap,GetListener:bbbfly.map.control._getListener,CreateListener:bbbfly.map.control._createListener}});return ngCreateControlAsType(a,
a.CreteFromType,b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_control={OnInit:function(){ngRegisterControlType("bbbfly.MapControl",bbbfly.MapControl)}};
