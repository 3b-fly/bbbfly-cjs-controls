/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */
var bbbfly=bbbfly||{};bbbfly.grid={};
bbbfly.grid._onUpdated=function(){var b=this.ControlsPanel?this.ControlsPanel:this,c=b.ChildControls;this._Rows=[];this._Columns=[];if(c&&0<c.length){var a=b.Elm();ng_BeginMeasureElement(a);b=ng_ClientWidth(a);ng_EndMeasureElement(a);var f=c.length,h="number"===typeof this.MinColumnWidth?Math.floor(b/this.MinColumnWidth):1,k=Math.ceil(f/h);h=Math.ceil(f/k);1>h&&(h=1);f=Math.floor(b/h);"number"===typeof this.MaxColumnWidth&&(f=Math.min(f,this.MaxColumnWidth));var d=0,e=0;for(l in c)a=c[l],this._Rows[e]||
(this._Rows[e]=[]),this._Columns[d]||(this._Columns[d]=[]),this._Rows[e].push(a),this._Columns[d].push(a),a._GridRow=e,a._GridColumn=d,e++,e===k&&(e=0,d++);c=0;for(var g in this._Rows){var l=this._Rows[g];k=0;for(var m in l)a=l[m],d=a._GridColumn*f,e=f,a._GridColumn+1===h&&(e=b-d,"number"===typeof this.MaxColumnWidth&&(e=Math.min(e,this.MaxColumnWidth))),a.SetBounds({T:c,L:d,W:e})&&a.Update(),d=a.Bounds.H,"number"!==typeof d&&(a=a.Elm(),ng_BeginMeasureElement(a),d=ng_ClientHeight(a),ng_EndMeasureElement(a)),
d>k&&(k=d);c+=k}this.AutoSize&&((g=this.ControlsPanel)&&g.Bounds&&("number"===typeof g.Bounds.T&&(c+=g.Bounds.T),"number"===typeof g.Bounds.B&&(c+=g.Bounds.B)),this.SetBounds({H:c})&&this.Update(!1),"function"===typeof this.OnAutoSized&&this.OnAutoSized())}return!0};
bbbfly.GridPanel=function(b,c,a){b=b||{};ng_MergeDef(b,{Data:{AutoSize:!0,MinColumnWidth:200,MaxColumnWidth:void 0,_Rows:[],_Columns:[]},Events:{OnUpdated:bbbfly.grid._onUpdated,OnAutoSized:null}});ng_MergeDef(b,{ScrollBars:b.Data.AutoSize?ssNone:ssAuto});return ngCreateControlAsType(b,"ngPanel",c,a)};
bbbfly.GridGroup=function(b,c,a){b=b||{};ng_MergeDef(b,{ScrollBars:ssNone,Data:{AutoSize:!0,MinColumnWidth:200,MaxColumnWidth:void 0,_Rows:[],_Columns:[]},Events:{OnUpdate:bbbfly.grid._onUpdate,OnAutoSized:null}});ng_MergeDef(b,{ControlsPanel:{ScrollBars:b.Data.AutoSize?ssNone:ssAuto}});return ngCreateControlAsType(b,"ngGroup",c,a)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_grid={OnInit:function(){ngRegisterControlType("bbbfly.GridPanel",bbbfly.GridPanel);ngRegisterControlType("bbbfly.GridGroup",bbbfly.GridGroup)}};
