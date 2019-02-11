/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.hint={hintified:{}};
bbbfly.hint.hintified._showHint=function(a,c){if(!String.isString(a))return!1;var b=this._Hints[a];if(!b){b={Data:{HintId:a}};this.HintDefs&&this.HintDefs[a]&&ng_MergeDef(b,this.HintDefs[a]);this.HintDef&&ng_MergeDef(b,this.HintDef);if("function"===typeof this.OnCreateHint&&!this.OnCreateHint(this,a,b))return!1;b=ngCreateTextHint(b,"");b.Owner=this;this._Hints[a]=b}if(b){var d=this.HintMessages&&this.HintMessages[a]?this.HintMessages[a]:null;b.SetText(String.isString(c)?c:ngTxt(d))}return"function"!==
typeof this.OnShowHint||this.OnShowHint(this,a,b)?(b=this._Hints[a])?(a=this.Elm(),ng_BeginMeasureElement(a),Number.isNumber(this.HintXR)?this.HintX=ng_ClientWidth(a)-this.HintXR:Number.isNumber(this.HintXL)&&(this.HintX=this.HintXL),Number.isNumber(this.HintYB)?this.HintY=ng_ClientHeight(a)-this.HintYB:Number.isNumber(this.HintYT)&&(this.HintY=this.HintYT),ng_EndMeasureElement(a),b.PopupCtrl(this,b.Anchor?b.Anchor:"auto"),!0):!1:!1};
bbbfly.hint.hintified._hideHint=function(a){return this._Hints&&this._Hints[a]&&this._Hints[a].Visible?(this._Hints[a].SetVisible(!1),!0):!1};bbbfly.hint.hintified._hideHints=function(){var a=!1;if(this._Hints)for(var c in this._Hints)this._Hints[c].Visible&&(this._Hints[c].SetVisible(!1),a=!0);return a};bbbfly.hint.hintified._onVisibleChanged=function(){this.Visible||this.HideHints()};bbbfly.hint.hintified._onEnabledChanged=function(){this.Visible||this.HideHints()};
bbbfly.hint.hintified._onUpdated=function(){for(var a in this._Hints){var c=this._Hints[a];c&&c.Visible&&this.ShowHint(a,c.GetText())}};
bbbfly.hint.Hintify=function(a){a=a||{};ng_MergeDef(a,{Data:{HintDef:{Data:{HintId:null}},HintDefs:null,HintMessages:null,HintXL:void 0,HintXR:void 0,HintYT:void 0,HintYB:void 0,_Hints:[]},Events:{OnVisibleChanged:bbbfly.hint.hintified._onVisibleChanged,OnEnabledChanged:bbbfly.hint.hintified._onEnabledChanged,OnUpdated:bbbfly.hint.hintified._onUpdated,OnCreateHint:null,OnShowHint:null},Methods:{ShowHint:bbbfly.hint.hintified._showHint,HideHint:bbbfly.hint.hintified._hideHint,HideHints:bbbfly.hint.hintified._hideHints}});
return a};
