/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.edit={};bbbfly.editbox={};bbbfly.memo={};bbbfly.edit._setInvalid=function(a,b){(a=this.SetInvalid.callParent(a,b))&&Function.isFunction(this.OnInvalidChanged)&&this.OnInvalidChanged();return a};bbbfly.edit._onReadOnlyChanged=function(a,b){(a=this.DropDownButton)&&a.Visible!==!b&&a.SetVisible(!b);this.Update()};
bbbfly.edit._getButton=function(a){if(this.Buttons)for(var b in this.Buttons)if(this.Buttons[b].ButtonId===a)return this.Buttons[b];return null};bbbfly.edit._setFocusBefore=function(){this.SetFocus(!0);this.SetCaretPos(0)};bbbfly.edit._setFocusAfter=function(){var a=this.GetText();this.SetFocus(!0);this.SetCaretPos(String.isString(a)?a.length:0)};
bbbfly.edit._normalizeButtons=function(a){if(a.Buttons){if(Object.isObject(a.Buttons)){var b=[],c;for(c in a.Buttons){var d=a.Buttons[c];ng_MergeDef(d,{Data:{ButtonId:c}});b.push(d)}a.Buttons=b}}else a.Buttons=[]};bbbfly.memo._validate=function(){var a=this.GetText();a=this.Required&&1>String.trim(a).length?!1:this.ValidLength(a);this.SetInvalid(!a);return a};bbbfly.memo._validLength=function(a){return Number.isInteger(this.MaxLength)&&String.isString(a)?a.length<=this.MaxLength:!0};
bbbfly.memo._setRequired=function(a){a!==this.Required&&(this.Required=!!a,this.Validate())};bbbfly.memo._setMaxLength=function(a){a!==this.MaxLength&&(this.MaxLength=Number.isInteger(a)?a:null,this.Validate())};bbbfly.memo._onTextChanged=function(){this.Validate()};bbbfly.memo._onGetClassName=function(a,b){b=String.isString(b)?b:"";a.Enabled&&a.Invalid&&(b+="Invalid");return b};
bbbfly.Edit=function(a,b,c,d){a=a||{};ng_MergeDef(a,{Buttons:null,Events:{OnReadOnlyChanged:bbbfly.edit._onReadOnlyChanged,OnInvalidChanged:null},Methods:{SetInvalid:bbbfly.edit._setInvalid,GetButton:bbbfly.edit._getButton,SetFocusBefore:bbbfly.edit._setFocusBefore,SetFocusAfter:bbbfly.edit._setFocusAfter}});bbbfly.edit._normalizeButtons(a);bbbfly.hint&&bbbfly.hint.Hintify(a);d||(d="ngEdit");return ngCreateControlAsType(a,d,b,c)};
bbbfly.Memo=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Required:!1,MaxLength:null},Events:{OnTextChanged:bbbfly.memo._onTextChanged,OnGetClassName:bbbfly.memo._onGetClassName,OnInvalidChanged:null},Methods:{SetInvalid:bbbfly.edit._setInvalid,Validate:bbbfly.memo._validate,ValidLength:bbbfly.memo._validLength,SetRequired:bbbfly.memo._setRequired,SetMaxLength:bbbfly.memo._setMaxLength,SetFocusBefore:bbbfly.edit._setFocusBefore,SetFocusAfter:bbbfly.edit._setFocusAfter}});bbbfly.hint&&bbbfly.hint.Hintify(a);
return ngCreateControlAsType(a,"ngMemo",b,c)};bbbfly.editbox._setAlt=function(a,b){!String.isString(a)&&null!==a||a===this.Alt||(this.Alt=a,Boolean.isBoolean(b)&&!b||this.Update())};bbbfly.editbox._setText=function(a,b){!String.isString(a)&&null!==a||a===this.Text||(this.Text=a,Boolean.isBoolean(b)&&!b||this.Update())};bbbfly.editbox._getAlt=function(){return String.isString(this.AltRes)?ngTxt(this.AltRes):String.isString(this.Alt)?this.Alt:null};
bbbfly.editbox._getText=function(){return String.isString(this.Text)?this.Text:null};bbbfly.editbox._getButtons=function(){return Object.isObject(this._Buttons)?this._Buttons:{}};bbbfly.editbox._getButton=function(a){a=this.GetButtons()[a];return Object.isObject(a)?a:null};
bbbfly.editbox._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);if(Object.isObject(this._Buttons)&&Object.isObject(a.Buttons))for(var d in a.Buttons)b=a.Buttons[d],Object.isObject(b)&&(Object.isObject(this.ButtonDef)&&ng_MergeDef(b,this.ButtonDef),this._Buttons[d]=this.CreateControl(b))};
bbbfly.EditBox=function(a,b,c){a=a||{};ng_MergeDef(a,{Buttons:null,Data:{WrapperOptions:{Orientation:bbbfly.Wrapper.orientation.horizontal,TrackChanges:!0},ButtonDef:{Type:"bbbfly.Button",Data:{AutoSize:bbbfly.Button.autosize.both}},Alt:null,AltRes:null,Text:null,TextAlign:bbbfly.EditBox.textalign.left,_Buttons:{}},Events:{},Methods:{DoCreate:bbbfly.editbox._doCreate,SetAlt:bbbfly.editbox._setAlt,SetText:bbbfly.editbox._setText,GetAlt:bbbfly.editbox._getAlt,GetText:bbbfly.editbox._getText,GetButtons:bbbfly.editbox._getButtons,
GetButton:bbbfly.editbox._getButton}});bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"bbbfly.Wrapper",b,c)};bbbfly.EditBox.textalign={left:1,center:2,right:3};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_edit={OnInit:function(){ngRegisterControlType("bbbfly.Edit",bbbfly.Edit);ngRegisterControlType("bbbfly.EditBox",bbbfly.EditBox);ngRegisterControlType("bbbfly.Memo",bbbfly.Memo)}};
