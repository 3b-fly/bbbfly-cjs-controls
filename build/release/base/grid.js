/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */
var bbbfly=bbbfly||{};bbbfly.grid={};
bbbfly.grid._onUpdated=function(){var b=this.ControlsPanel?this.ControlsPanel:this,c=b.ChildControls;this._Rows=[];this._Columns=[];if(c&&0<c.length){var a=b.Elm();ng_BeginMeasureElement(a);b=ng_ClientWidth(a);ng_EndMeasureElement(a);var k=c.length,g="number"===typeof this.MinColumnWidth?Math.floor(b/this.MinColumnWidth):1,h=Math.ceil(k/g);g=Math.ceil(k/h);1>g&&(g=1);k=Math.floor(b/g);var d=0,e=0;for(l in c)a=c[l],this._Rows[e]||(this._Rows[e]=[]),this._Columns[d]||(this._Columns[d]=[]),this._Rows[e].push(a),
this._Columns[d].push(a),a._GridRow=e,a._GridColumn=d,e++,e===h&&(e=0,d++);c=0;for(var f in this._Rows){var l=this._Rows[f];h=0;for(var m in l)a=l[m],d=a._GridColumn*k,a.SetBounds({T:c,L:d,W:a._GridColumn+1===g?b-d:k})&&a.Update(),d=a.Bounds.H,"number"!==typeof d&&(a=a.Elm(),ng_BeginMeasureElement(a),d=ng_ClientHeight(a),ng_EndMeasureElement(a)),d>h&&(h=d);c+=h}this.AutoSize&&((f=this.ControlsPanel)&&f.Bounds&&("number"===typeof f.Bounds.T&&(c+=f.Bounds.T),"number"===typeof f.Bounds.B&&(c+=f.Bounds.B)),
this.SetBounds({H:c})&&this.Update(!1),"function"===typeof this.OnAutoSized&&this.OnAutoSized())}return!0};bbbfly.GridPanel=function(b,c,a){b=b||{};ng_MergeDef(b,{Data:{AutoSize:!0,MinColumnWidth:200,_Rows:[],_Columns:[]},Events:{OnUpdated:bbbfly.grid._onUpdated,OnAutoSized:null}});return ngCreateControlAsType(b,"ngPanel",c,a)};
bbbfly.GridGroup=function(b,c,a){b=b||{};ng_MergeDef(b,{Data:{AutoSize:!0,MinColumnWidth:200,_Rows:[],_Columns:[]},Events:{OnUpdate:bbbfly.grid._onUpdate,OnAutoSized:null}});return ngCreateControlAsType(b,"ngGroup",c,a)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_grid={OnInit:function(){ngRegisterControlType("bbbfly.GridPanel",bbbfly.GridPanel);ngRegisterControlType("bbbfly.GridGroup",bbbfly.GridGroup)}};
