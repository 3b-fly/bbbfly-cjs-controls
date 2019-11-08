/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Object.is",function(a){return a?a:function(a,c){return a===c?0!==a||1/a===1/c:a!==a&&c!==c}},"es6","es3");
$jscomp.polyfill("Array.prototype.includes",function(a){return a?a:function(a,c){var b=this;b instanceof String&&(b=String(b));var e=b.length;for(c=c||0;c<e;c++)if(b[c]==a||Object.is(b[c],a))return!0;return!1}},"es7","es3");
$jscomp.checkStringArgs=function(a,b,c){if(null==a)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""};$jscomp.polyfill("String.prototype.includes",function(a){return a?a:function(a,c){return-1!==$jscomp.checkStringArgs(this,a,"includes").indexOf(a,c||0)}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};
bbbfly.map.box={};bbbfly.map.box._onCreated=function(a){bbbfly.MapRegistry.RegisterMap(a);return!0};bbbfly.map.box._onUpdate=function(){this._MapControlsRegistered||(this.RegisterControls(),this._MapControlsRegistered=!0);return!0};bbbfly.map.box._registerControls=function(){if(this.Controls)for(var a in this.Controls){var b=this.Controls[a];Object.isObject(b)&&Function.isFunction(b.CtrlInheritsFrom)&&b.CtrlInheritsFrom("bbbfly.MapControl")&&!String.isString(b.MapID)&&(b.MapID=this.ID,bbbfly.MapRegistry.RegisterControl(b))}};
bbbfly.map.box._linkMapControl=function(a,b){if(!(String.isString(a)&&b&&Function.isFunction(b.GetListener)&&Function.isFunction(this.AddListener)))return!1;var c=b.GetListener();if(c&&!this.AddListener(c.Listen,c))return!1;Array.isArray(this._MapControls[a])||(this._MapControls[a]=[]);a=this._MapControls[a];a.includes(b)||a.push(b);return!0};
bbbfly.map.box._unlinkMapControl=function(a,b){if(!(String.isString(a)&&b&&Function.isFunction(b.GetListener)&&Function.isFunction(this.RemoveListener)))return!1;var c=b.GetListener();if(c&&!this.RemoveListener(c.Listen,c))return!1;a=this._MapControls[a];b=Array.indexOf(a,b);0<b&&a.splice(b,1);return!0};
bbbfly.map.box._getMapControls=function(a){var b=[],c={},d;for(d in this._MapControls)if(!String.isString(a)||d===a){var e=this._MapControls[a];if(Array.isArray(e))for(var g in e){var f=e[g];if(String.isString(f.ID)){if(c[f.ID])continue;c[f.ID]=!0}b.push(f)}}return b};bbbfly.map.box._setMapControlsVisible=function(a,b){if(!String.isString(a))return!1;Boolean.isBoolean(b)||(b=!0);a=this.GetMapControls(a);for(var c in a){var d=a[c];d&&Function.isFunction(d.SetVisible)&&d.SetVisible(b)}};
bbbfly.MapBox=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{AllowListeners:!0,_MapControls:{},_MapControlsRegistered:!1},OnCreated:bbbfly.map.box._onCreated,Events:{OnUpdate:bbbfly.map.box._onUpdate},Methods:{RegisterControls:bbbfly.map.box._registerControls,LinkMapControl:bbbfly.map.box._linkMapControl,UnlinkMapControl:bbbfly.map.box._unlinkMapControl,GetMapControls:bbbfly.map.box._getMapControls,SetMapControlsVisible:bbbfly.map.box._setMapControlsVisible}});return ngCreateControlAsType(a,"bbbfly.Map",
b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_box={OnInit:function(){ngRegisterControlType("bbbfly.MapBox",bbbfly.MapBox)}};
