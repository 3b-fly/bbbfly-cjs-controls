/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE_GPLv3_with_commercial_exception' file
 */
var bbbfly=bbbfly||{};bbbfly.edit={};bbbfly.memo={};bbbfly.edit._onReadOnlyChanged=function(a,b){(a=this.DropDownButton)&&a.Visible!==!b&&a.SetVisible(!b);this.Update()};bbbfly.edit._getButton=function(a){if(this.Buttons)for(var b in this.Buttons)if(this.Buttons[b].ButtonId===a)return this.Buttons[b];return null};bbbfly.edit._setFocusBefore=function(){this.SetFocus(!0);this.SetCaretPos(0)};
bbbfly.edit._setFocusAfter=function(){var a=this.GetText();this.SetFocus(!0);this.SetCaretPos("string"===typeof a?a.length:0)};bbbfly.edit._normalizeButtons=function(a){if(a.Buttons){if(Object.isObject(a.Buttons)){var b=[],c;for(c in a.Buttons){var d=a.Buttons[c];ng_MergeDef(d,{Data:{ButtonId:c}});b.push(d)}a.Buttons=b}}else a.Buttons=[]};bbbfly.memo._onGetClassName=function(a,b){return b+(a.Invalid?"Invalid":"")};
bbbfly.Edit=function(a,b,c,d){a=a||{};ng_MergeDef(a,{Buttons:null,Events:{OnReadOnlyChanged:bbbfly.edit._onReadOnlyChanged},Methods:{GetButton:bbbfly.edit._getButton,SetFocusBefore:bbbfly.edit._setFocusBefore,SetFocusAfter:bbbfly.edit._setFocusAfter}});bbbfly.edit._normalizeButtons(a);bbbfly.hint&&bbbfly.hint.Hintify(a);d||(d="ngEdit");return ngCreateControlAsType(a,d,b,c)};
bbbfly.Memo=function(a,b,c){a=a||{};ng_MergeDef(a,{Events:{OnGetClassName:bbbfly.memo._onGetClassName},Methods:{SetFocusBefore:bbbfly.edit._setFocusBefore,SetFocusAfter:bbbfly.edit._setFocusAfter}});bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngMemo",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_edit={OnInit:function(){ngRegisterControlType("bbbfly.Edit",bbbfly.Edit);ngRegisterControlType("bbbfly.Memo",bbbfly.Memo)}};
