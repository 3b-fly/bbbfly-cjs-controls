/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */
var bbbfly=bbbfly||{};bbbfly.edit={};bbbfly.edit._onReadOnlyChanged=function(a,b){(a=this.DropDownButton)&&a.Visible!==!b&&a.SetVisible(!b);this.Update()};bbbfly.edit._getButton=function(a){if(this.Buttons)for(var b in this.Buttons)if(this.Buttons[b].ButtonId===a)return this.Buttons[b];return null};bbbfly.edit._setFocusBefore=function(){this.SetFocus(!0);this.SetCaretPos(0)};
bbbfly.edit._setFocusAfter=function(){var a=this.GetText();this.SetFocus(!0);this.SetCaretPos("string"===typeof a?a.length:0)};bbbfly.edit._normalizeButtons=function(a){if(a.Buttons){if(Object.isObject(a.Buttons)){var b=[],d;for(d in a.Buttons){var c=a.Buttons[d];ng_MergeDef(c,{Data:{ButtonId:d}});b.push(c)}a.Buttons=b}}else a.Buttons=[]};
bbbfly.Edit=function(a,b,d,c){a=a||{};ng_MergeDef(a,{Buttons:null,Events:{OnReadOnlyChanged:bbbfly.edit._onReadOnlyChanged},Methods:{GetButton:bbbfly.edit._getButton,SetFocusBefore:bbbfly.edit._setFocusBefore,SetFocusAfter:bbbfly.edit._setFocusAfter}});bbbfly.edit._normalizeButtons(a);bbbfly.hint&&bbbfly.hint.Hintify(a);c||(c="ngEdit");return ngCreateControlAsType(a,c,b,d)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_edit={OnInit:function(){ngRegisterControlType("bbbfly.Edit",bbbfly.Edit)}};
