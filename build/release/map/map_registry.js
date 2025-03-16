/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.registry={};bbbfly.map.registry._getMap=function(a){return(a=this._Maps[a])?a:null};
bbbfly.map.registry._registerMap=function(a){if(!a||!String.isString(a.ID)||this._Maps[a.ID])return!1;if(Function.isFunction(a.CtrlInheritsFrom)&&a.CtrlInheritsFrom("bbbfly.MapBox")){this._Maps[a.ID]=a;for(var b in this._UnlinkedControls){var c=this._UnlinkedControls[b];c.MapID===a.ID&&Function.isFunction(c.LinkToMap)&&c.LinkToMap(a)&&(delete this._UnlinkedControls[b],this._MapControls[b]=c)}return!0}return!1};
bbbfly.map.registry._registerControl=function(a){if(!a||!String.isString(a.ID)||this._MapControls[a.ID])return!1;if(Function.isFunction(a.CtrlInheritsFrom)&&a.CtrlInheritsFrom("bbbfly.MapControl")){if(this.LinkControl(a))return this._MapControls[a.ID]=a,delete this._UnlinkedControls[a.ID],!0;if(!this._UnlinkedControls[a.ID])return this._UnlinkedControls[a.ID]=a,!0}return!1};
bbbfly.map.registry._linkControl=function(a){if(!a||!String.isString(a.MapID))return!1;var b=this.GetMap(a.MapID);return b?Function.isFunction(a.LinkToMap)?a.LinkToMap(b):!1:!1};
bbbfly.map.registry._unregisterMap=function(a){if(!a||!String.isString(a.ID)||this._Maps[a.ID]!==a)return!1;for(var b in this._MapControls){var c=this._MapControls[b];c.MapID===a.ID&&Function.isFunction(c.UnlinkFromMap)&&c.UnlinkFromMap(a)&&(delete this._MapControls[b],this._UnlinkedControls[b]=c)}delete this._Maps[a.ID];return!0};
bbbfly.map.registry._unregisterControl=function(a){return a&&String.isString(a.ID)?this._MapControls[a.ID]===a?(delete this._MapControls[a.ID],this.UnlinkControl(a),!0):this._UnlinkedControls[a.ID]===a?(delete this._UnlinkedControls[a.ID],!0):!1:!1};bbbfly.map.registry._unlinkControl=function(a){if(!a||!String.isString(a.MapID))return!1;var b=this.GetMap(a.MapID);return b?Function.isFunction(a.UnlinkFromMap)?a.UnlinkFromMap(b):!1:!1};
bbbfly.MapRegistry={_Maps:{},_MapControls:{},_UnlinkedControls:{},GetMap:bbbfly.map.registry._getMap,RegisterMap:bbbfly.map.registry._registerMap,RegisterControl:bbbfly.map.registry._registerControl,LinkControl:bbbfly.map.registry._linkControl,UnregisterMap:bbbfly.map.registry._unregisterMap,UnregisterControl:bbbfly.map.registry._unregisterControl,UnlinkControl:bbbfly.map.registry._unlinkControl};
