/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE_GPLv3_with_commercial_exception' file
 */
var bbbfly=bbbfly||{};bbbfly.list={};bbbfly.dropdownlist={};bbbfly.list._normalizeColumns=function(a){if(a.Data.Columns){if(Object.isObject(a.Data.Columns)){var b=[],c;for(c in a.Data.Columns){var d=a.Data.Columns[c];ng_MergeVar(d,{ID:c,Align:"left"});b.push(d)}a.Data.Columns=b}}else a.Data.Columns=[]};
bbbfly.list._normalizeItems=function(a){var b=function(a){if(Array.isArray(a))return a;if(Object.isObject(a)){var c=[],g;for(g in a){var h=a[g];0<c.length&&c.push({Text:"-"});for(var k in h){var e=h[k];e.Items&&(e.Items=b(e.Items));c.push(e)}}return c}return[]};a.Data.Items=b(a.Data.Items)};bbbfly.list._getExpanded=function(){var a=[];this.Scan(function(b,c){c.Items&&!c.Collapsed&&(a[c.ID]=c);return!0});return a};
bbbfly.list._expandItems=function(a){if(!a||"object"!==typeof a)return!1;this.BeginUpdate();var b=[],c;for(c in a){var d=a[c].ID;d?b[d]=a[c]:this.Expand(a[c])}this.Scan(function(a,c){if(!c.Items)return!0;c.ID&&c.ID in b&&a.Expand(c);return!0});this.EndUpdate()};
bbbfly.list._collapseItems=function(a){if(!a||"object"!==typeof a)return!1;this.BeginUpdate();var b=[],c;for(c in a){var d=a[c].ID;d?b[d]=a[c]:this.Collapse(a[c])}this.Scan(function(a,c){if(!c.Items)return!0;c.ID&&c.ID in b&&a.Collapse(c);return!0});this.EndUpdate()};
bbbfly.list._scrollToItem=function(a){if(!a||"object"!==typeof a)return!1;a.ID&&(a=this.FindItemByID(a.ID));var b=this.ItemId(a);if(b){a=document.getElementById(this.ID+"_CB");ng_BeginMeasureElement(a);var c=ng_ClientHeight(a);ng_EndMeasureElement(a);b=document.getElementById(this.ID+"_"+b);b=ng_ParentPosition(b,a).y+a.scrollTop;a.scrollTop=b-Math.round(c/2);return!0}return!1};
bbbfly.list._expandToItem=function(a){if(!a||"object"!==typeof a)return!1;a.ID&&(a=this.FindItemByID(a.ID));this.BeginUpdate();this.Expand(a);var b=!0;a.Parent&&(b=this.ExpandToItem(a.Parent));this.EndUpdate();return b};
bbbfly.list._highlightItem=function(a){if(!a||"object"!==typeof a)return!1;var b=this.HighlightClass,c=this.HighlightInterval,d=this.HighlightFlashCnt;if("string"===typeof b&&"number"===typeof c&&"number"===typeof d){a=this.ItemId(a);var g=document.getElementById(this.ID+"_"+a);if(0>g.className.indexOf(b)){var h=function(a,d,h){if(h._HighlightId===d){var f=g.className;0>f.indexOf(" "+b)&&(g.className=f+" "+b);setTimeout(k,c,a,d,h)}},k=function(a,d,k){var f=g.className,e=f.indexOf(" "+b);if(-1<e){var l=
f.indexOf(" ",e+1);l=l>e+1?l:f.length;g.className=f.substring(0,e)+f.substring(l,f.length)}1<a&&setTimeout(h,c,a-1,d,k)};h(d,++this._HighlightId,this)}return!0}return!1};bbbfly.list._onCalcIndent=function(a,b,c,d){c=0;0<d&&("number"===typeof a.DefaultIndent&&(c+=d*a.DefaultIndent),"number"===typeof b.Indent&&(c+=b.Indent));return c+=a.CalcItemIndent(b)};
bbbfly.list._setInvalid=function(a,b){a=!1!==a;b=!1!==b;if(this.Invalid===a)return!0;if(this.OnSetInvalid&&!this.OnSetInvalid(this,a,b))return!1;this.Invalid=a;this.DoSetInvalid&&this.DoSetInvalid(a,b);return!0};bbbfly.list._selectDropDownItemWithFocus=function(a){a=this.SelectDropDownItem(a);var b=this.DropDownOwner;a&&b&&("function"===typeof b.SetFocusAfter?b.SetFocusAfter():"function"===typeof b.SetFocus&&b.SetFocus());return a};bbbfly.dropdownlist._setFocus=function(){return!1};
bbbfly.dropdownlist._onIconCreated=function(a){a.BaseClassName=a.Owner.BaseClassName+"Icon";a.Owner.Icon=a;return!0};bbbfly.dropdownlist._onIconClick=function(){var a=this.Owner;a.Enabled&&!a.ReadOnly&&(a.DropDownControl.Visible?a.HideDropDown():a.DropDown())};bbbfly.dropdownlist._onDropDownChanged=function(){this.Owner.DropDownButton.Check(this.Visible)};bbbfly.dropdownlist._onListItemChanged=function(a,b,c){this.Icon&&(this.Icon.LeftImg=this.GetIconImg(c),this.Update());return!0};
bbbfly.dropdownlist._getIconImg=function(a){if(a){if(a.EditIconImg)return a.EditIconImg;if(a.Image)return a.Image}return this.DefaultIconImg};bbbfly.dropdownlist._onReadOnlyChanged=function(a,b){(a=a.DropDownButton)&&a.Visible!==!b&&a.SetVisible(!b);this.Update()};
bbbfly.List=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ListIndent:0,DefaultIndent:10,Invalid:!1,HighlightClass:"highlight",HighlightInterval:300,HighlightFlashCnt:2,Columns:null,Items:null,_HighlightId:0},Events:{OnCalcIndent:bbbfly.list._onCalcIndent,OnSetInvalid:null},Methods:{SelectDropDownItemWithFocus:bbbfly.list._selectDropDownItemWithFocus,GetExpanded:bbbfly.list._getExpanded,ExpandItems:bbbfly.list._expandItems,CollapseItems:bbbfly.list._collapseItems,ScrollToItem:bbbfly.list._scrollToItem,
ExpandToItem:bbbfly.list._expandToItem,HighlightItem:bbbfly.list._highlightItem,SetInvalid:bbbfly.list._setInvalid,DoSetInvalid:null}});bbbfly.list._normalizeColumns(a);bbbfly.list._normalizeItems(a);return ngCreateControlAsType(a,"ngList",b,c)};
bbbfly.DropDownList=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ShowIcon:!1,DefaultIconImg:null,IconBtnDef:{Type:"ngButton",Data:{Cursor:"default",ButtonAlign:"left"},OnCreated:bbbfly.dropdownlist._onIconCreated,Events:{OnClick:bbbfly.dropdownlist._onIconClick}}},DropDown:{Type:"bbbfly.List",Events:{OnVisibleChanged:bbbfly.dropdownlist._onDropDownChanged}},Events:{OnListItemChanged:bbbfly.dropdownlist._onListItemChanged,OnReadOnlyChanged:bbbfly.dropdownlist._onReadOnlyChanged},Methods:{SetFocus:bbbfly.dropdownlist._setFocus,
GetIconImg:bbbfly.dropdownlist._getIconImg}});if(a.Data.ShowIcon){Array.isArray(a.Buttons)||(a.Buttons=[]);var d=ng_CopyVar(a.Data.IconBtnDef);ng_MergeDef(a,{Data:{LeftImg:a.Data.DefaultIconImg}});a.Buttons.unshift(d)}return ngCreateControlAsType(a,"ngDropDownList",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_list={OnInit:function(){ngRegisterControlType("bbbfly.List",bbbfly.List);ngRegisterControlType("bbbfly.DropDownList",bbbfly.DropDownList)}};
