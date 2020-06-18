/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.list={};bbbfly.dropdownlist={};bbbfly.list._normalizeColumns=function(a){a.Data.Columns=bbbfly.list._columnsToArray(a.Data.Columns)};bbbfly.list._columnsToArray=function(a){if(Array.isArray(a))return a;if(!Object.isObject(a))return[];var b=[],c;for(c in a){var d=a[c];ng_MergeVar(d,{ID:c,Align:"left"});b.push(d)}return b};
bbbfly.list._normalizeItems=function(a){a.Data.Items=bbbfly.list._itemsToArray(a.Data.Items)};bbbfly.list._itemsToArray=function(a){if(Array.isArray(a))return a;if(!Object.isObject(a))return[];var b=[],c;for(c in a){var d=a[c];0<b.length&&b.push({Text:"-"});for(var e in d){var f=d[e];f.Items&&(f.Items=bbbfly.list._itemsToArray(f.Items));b.push(f)}}return b};bbbfly.list._getExpanded=function(){var a=[];this.Scan(function(b,c){c.Items&&!c.Collapsed&&(a[c.ID]=c);return!0});return a};
bbbfly.list._expandItems=function(a){if(!a||"object"!==typeof a)return!1;this.BeginUpdate();var b=[],c;for(c in a){var d=a[c].ID;d?b[d]=a[c]:this.Expand(a[c])}this.Scan(function(a,c){if(!c.Items)return!0;c.ID&&c.ID in b&&a.Expand(c);return!0});this.EndUpdate()};
bbbfly.list._collapseItems=function(a){if(!a||"object"!==typeof a)return!1;this.BeginUpdate();var b=[],c;for(c in a){var d=a[c].ID;d?b[d]=a[c]:this.Collapse(a[c])}this.Scan(function(a,c){if(!c.Items)return!0;c.ID&&c.ID in b&&a.Collapse(c);return!0});this.EndUpdate()};
bbbfly.list._scrollToItem=function(a){if(!a||"object"!==typeof a)return!1;a.ID&&(a=this.FindItemByID(a.ID));var b=this.ItemId(a);if(b){(a=document.getElementById(this.ID+"_CB"))||(a=this.Elm());if(!a)return!1;ng_BeginMeasureElement(a);var c=ng_ClientHeight(a);ng_EndMeasureElement(a);b=document.getElementById(this.ID+"_"+b);b=ng_ParentPosition(b,a).y+a.scrollTop;a.scrollTop=b-Math.round(c/2);return!0}return!1};
bbbfly.list._expandToItem=function(a){if(!a||"object"!==typeof a)return!1;a.ID&&(a=this.FindItemByID(a.ID));this.BeginUpdate();this.Expand(a);var b=!0;a.Parent&&(b=this.ExpandToItem(a.Parent));this.EndUpdate();return b};
bbbfly.list._highlightItem=function(a){if(!a||"object"!==typeof a)return!1;var b=this.HighlightClass,c=this.HighlightInterval,d=this.HighlightFlashCnt;if(String.isString(b)&&Number.isInteger(c)&&Number.isInteger(d)){a=this.ItemId(a);var e=document.getElementById(this.ID+"_"+a);if(0>e.className.indexOf(b)){var f=function(a,d,f){if(f._HighlightId===d){var g=e.className;0>g.indexOf(" "+b)&&(e.className=g+" "+b);setTimeout(l,c,a,d,f)}},l=function(a,d,l){var g=e.className,h=g.indexOf(" "+b);if(-1<h){var k=
g.indexOf(" ",h+1);k=k>h+1?k:g.length;e.className=g.substring(0,h)+g.substring(k,g.length)}1<a&&setTimeout(f,c,a-1,d,l)};f(d,++this._HighlightId,this)}return!0}return!1};bbbfly.list._updateClassName=function(){var a=this.Elm();if(a){var b=this.BaseClassName;this.Enabled?this.Invalid&&(b=b+" "+b+"Invalid"):b=b+" "+b+"Disabled";a.className=b}};bbbfly.list._onUpdated=function(){this.UpdateClassName()};
bbbfly.list._onCalcIndent=function(a,b,c,d){c=0;0<d&&(Number.isInteger(a.DefaultIndent)&&(c+=d*a.DefaultIndent),Number.isInteger(b.Indent)&&(c+=b.Indent));return c+=a.CalcItemIndent(b)};bbbfly.list._setInvalid=function(a,b){a=!1!==a;b=!1!==b;if(this.Invalid===a)return!0;if(Function.isFunction(this.OnSetInvalid)&&!this.OnSetInvalid(this,a,b))return!1;this.Invalid=a;Function.isFunction(this.DoSetInvalid)&&this.DoSetInvalid(a,b);Function.isFunction(this.OnInvalidChanged)&&this.OnInvalidChanged();return!0};
bbbfly.list._onInvalidChanged=function(){this.UpdateClassName()};bbbfly.list._onEnabledChanged=function(){this.UpdateClassName()};bbbfly.list._onGetColumnCaption=function(a,b){return b?String.isString(b.Text)?b.Text:String.isString(b.TextRes)?ngTxt(b.TextRes):null:null};bbbfly.list._onGetText=function(a,b,c){if(!b)return null;a=b.Text;b=b.TextRes;c&&(a&&(a=a[c.ID]),b&&(b=b[c.ID]));return String.isString(a)?a:String.isString(b)?ngTxt(b):null};
bbbfly.list._selectDropDownItemWithFocus=function(a){a=this.SelectDropDownItem(a);var b=this.DropDownOwner;a&&b&&(Function.isFunction(b.SetFocusAfter)?b.SetFocusAfter():Function.isFunction(b.SetFocus)&&b.SetFocus());return a};bbbfly.dropdownlist._setFocus=function(){return!1};bbbfly.dropdownlist._onIconCreated=function(a){a.BaseClassName=a.Owner.BaseClassName+"Icon";a.Owner.Icon=a;return!0};
bbbfly.dropdownlist._onIconClick=function(){var a=this.Owner;a.Enabled&&!a.ReadOnly&&(a.DropDownControl.Visible?a.HideDropDown():a.DropDown())};bbbfly.dropdownlist._onDropDownChanged=function(){this.Owner.DropDownButton.Check(this.Visible)};bbbfly.dropdownlist._onListItemGetText=function(a,b,c,d){Function.isFunction(b.OnGetText)&&(d=b.OnGetText(b,c));return String.isString(d)?d:""};
bbbfly.dropdownlist._onListItemChanged=function(a,b,c){this.Icon&&(this.Icon.LeftImg=this.GetIconImg(c),this.Update());return!0};bbbfly.dropdownlist._getIconImg=function(a){if(a){if(a.EditIconImg)return a.EditIconImg;if(a.Image)return a.Image}return this.DefaultIconImg};bbbfly.dropdownlist._onReadOnlyChanged=function(a,b){(a=a.DropDownButton)&&a.Visible!==!b&&a.SetVisible(!b);this.Update()};
bbbfly.List=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ListIndent:0,DefaultIndent:10,Invalid:!1,HighlightClass:"highlight",HighlightInterval:300,HighlightFlashCnt:2,Columns:null,Items:null,_HighlightId:0},Events:{OnUpdated:bbbfly.list._onUpdated,OnCalcIndent:bbbfly.list._onCalcIndent,OnEnabledChanged:bbbfly.list._onEnabledChanged,OnSetInvalid:null,OnInvalidChanged:bbbfly.list._onInvalidChanged},OverrideEvents:{OnGetColumnCaption:bbbfly.list._onGetColumnCaption,OnGetText:bbbfly.list._onGetText},
Methods:{UpdateClassName:bbbfly.list._updateClassName,SelectDropDownItemWithFocus:bbbfly.list._selectDropDownItemWithFocus,GetExpanded:bbbfly.list._getExpanded,ExpandItems:bbbfly.list._expandItems,CollapseItems:bbbfly.list._collapseItems,ScrollToItem:bbbfly.list._scrollToItem,ExpandToItem:bbbfly.list._expandToItem,HighlightItem:bbbfly.list._highlightItem,SetInvalid:bbbfly.list._setInvalid,DoSetInvalid:null}});bbbfly.list._normalizeColumns(a);bbbfly.list._normalizeItems(a);return ngCreateControlAsType(a,
"ngList",b,c)};
bbbfly.DropDownList=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ShowIcon:!1,DefaultIconImg:null,IconBtnDef:{Type:"ngButton",Data:{Cursor:"default",ButtonAlign:"left"},OnCreated:bbbfly.dropdownlist._onIconCreated,Events:{OnClick:bbbfly.dropdownlist._onIconClick}}},DropDown:{Type:"bbbfly.List",Events:{OnVisibleChanged:bbbfly.dropdownlist._onDropDownChanged}},Events:{OnListItemGetText:bbbfly.dropdownlist._onListItemGetText,OnListItemChanged:bbbfly.dropdownlist._onListItemChanged,OnReadOnlyChanged:bbbfly.dropdownlist._onReadOnlyChanged},Methods:{SetFocus:bbbfly.dropdownlist._setFocus,
GetIconImg:bbbfly.dropdownlist._getIconImg}});if(a.Data.ShowIcon){Array.isArray(a.Buttons)||(a.Buttons=[]);var d=ng_CopyVar(a.Data.IconBtnDef);ng_MergeDef(a,{Data:{LeftImg:a.Data.DefaultIconImg}});a.Buttons.unshift(d)}return ngCreateControlAsType(a,"ngDropDownList",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_list={OnInit:function(){ngRegisterControlType("bbbfly.List",bbbfly.List);ngRegisterControlType("bbbfly.DropDownList",bbbfly.DropDownList)}};
