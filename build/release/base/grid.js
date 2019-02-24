/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,b){a!=Array.prototype&&a!=Object.prototype&&(a[c]=b.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,c,b,d){if(c){b=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var g=a[d];g in b||(b[g]={});b=b[g]}a=a[a.length-1];d=b[a];c=c(d);c!=d&&null!=c&&$jscomp.defineProperty(b,a,{configurable:!0,writable:!0,value:c})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.grid={};
bbbfly.grid._onUpdated=function(){var a=this.ControlsPanel?this.ControlsPanel:this,c=a.ChildControls;this._Rows=[];this._Columns=[];if(c&&0<c.length){var b=a.Elm();ng_BeginMeasureElement(b);a=ng_ClientWidth(b);ng_EndMeasureElement(b);var d=c.length,g=Number.isInteger(this.MinColumnWidth)?Math.floor(a/this.MinColumnWidth):1,k=Math.ceil(d/g);g=Math.ceil(d/k);1>g&&(g=1);d=Math.floor(a/g);Number.isInteger(this.MaxColumnWidth)&&(d=Math.min(d,this.MaxColumnWidth));var e=0,f=0;for(l in c)b=c[l],this._Rows[f]||
(this._Rows[f]=[]),this._Columns[e]||(this._Columns[e]=[]),this._Rows[f].push(b),this._Columns[e].push(b),b._GridRow=f,b._GridColumn=e,f++,f===k&&(f=0,e++);c=0;for(var h in this._Rows){var l=this._Rows[h];k=0;for(var m in l)b=l[m],e=b._GridColumn*d,f=d,b._GridColumn+1===g&&(f=a-e,Number.isInteger(this.MaxColumnWidth)&&(f=Math.min(f,this.MaxColumnWidth))),b.SetBounds({T:c,L:e,W:f})&&b.Update(),e=b.Bounds.H,Number.isNumber(e)||(b=b.Elm(),ng_BeginMeasureElement(b),e=ng_ClientHeight(b),ng_EndMeasureElement(b)),
e>k&&(k=e);c+=k}this.AutoSize&&((h=this.ControlsPanel)&&h.Bounds&&(Number.isNumber(h.Bounds.T)&&(c+=h.Bounds.T),Number.isNumber(h.Bounds.B)&&(c+=h.Bounds.B)),this.SetBounds({H:c})&&this.Update(!1),Function.isFunction(this.OnAutoSized)&&this.OnAutoSized())}return!0};
bbbfly.GridPanel=function(a,c,b){a=a||{};ng_MergeDef(a,{Data:{AutoSize:!0,MinColumnWidth:200,MaxColumnWidth:void 0,_Rows:[],_Columns:[]},Events:{OnUpdated:bbbfly.grid._onUpdated,OnAutoSized:null}});ng_MergeDef(a,{ScrollBars:a.Data.AutoSize?ssNone:ssAuto});return ngCreateControlAsType(a,"ngPanel",c,b)};
bbbfly.GridGroup=function(a,c,b){a=a||{};ng_MergeDef(a,{ScrollBars:ssNone,Data:{AutoSize:!0,MinColumnWidth:200,MaxColumnWidth:void 0,_Rows:[],_Columns:[]},Events:{OnUpdate:bbbfly.grid._onUpdate,OnAutoSized:null}});ng_MergeDef(a,{ControlsPanel:{ScrollBars:a.Data.AutoSize?ssNone:ssAuto}});return ngCreateControlAsType(a,"ngGroup",c,b)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_grid={OnInit:function(){ngRegisterControlType("bbbfly.GridPanel",bbbfly.GridPanel);ngRegisterControlType("bbbfly.GridGroup",bbbfly.GridGroup)}};
