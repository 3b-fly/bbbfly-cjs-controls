/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(b,a,c){b!=Array.prototype&&b!=Object.prototype&&(b[a]=c.value)};$jscomp.getGlobal=function(b){return"undefined"!=typeof window&&window===b?b:"undefined"!=typeof global&&null!=global?global:b};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(b,a,c,d){if(a){c=$jscomp.global;b=b.split(".");for(d=0;d<b.length-1;d++){var f=b[d];f in c||(c[f]={});c=c[f]}b=b[b.length-1];d=c[b];a=a(d);a!=d&&null!=a&&$jscomp.defineProperty(c,b,{configurable:!0,writable:!0,value:a})}};$jscomp.polyfill("Number.isFinite",function(b){return b?b:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(b){return b?b:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.bar={};bbbfly.bar._doCreate=function(b,a,c){this.DoCreate.callParent(b,a,c);this._Stretcher||(this._Stretcher=this.CreateChildControl({Type:"bbbfly.Panel",W:1,H:1,Data:{Visible:!1}}))};
bbbfly.bar._onUpdate=function(){var b=this.GetControlsHolder(),a=bbbfly.bar._getBarOptions(this);b.SetScrollBars(a.AutoSize===bbbfly.Bar.autosize.none?ssAuto:ssNone);return!0};
bbbfly.bar._onUpdated=function(){var b=this.GetControlsHolder(),a=b.Elm();if(b=b.ChildControls){var c=bbbfly.bar._getBarOptions(this),d={value:{size:{major:0,minor:0},position:{major:0,minor:0},margin:{major:0,minor:0},idx:{major:0,minor:0},max:{pos:{major:0,minor:0},mpos:{major:0,minor:0}}}};switch(c.Orientation){case bbbfly.Wrapper.orientation.vertical:switch(c.Float){case bbbfly.Bar.float.left_top:d.direction={major:{start:"top",end:"bottom"},minor:{start:"left",end:"right"}};break;case bbbfly.Bar.float.right_top:d.direction=
{major:{start:"top",end:"bottom"},minor:{start:"right",end:"left"}};break;case bbbfly.Bar.float.left_bottom:d.direction={major:{start:"bottom",end:"top"},minor:{start:"left",end:"right"}};break;case bbbfly.Bar.float.right_bottom:d.direction={major:{start:"bottom",end:"top"},minor:{start:"right",end:"left"}}}a&&(ng_BeginMeasureElement(a),d.value.size={major:ng_ClientHeight(a),minor:ng_ClientWidth(a)},ng_EndMeasureElement(a));break;case bbbfly.Wrapper.orientation.horizontal:switch(c.Float){case bbbfly.Bar.float.left_top:d.direction=
{major:{start:"left",end:"right"},minor:{start:"top",end:"bottom"}};break;case bbbfly.Bar.float.right_top:d.direction={major:{start:"right",end:"left"},minor:{start:"top",end:"bottom"}};break;case bbbfly.Bar.float.left_bottom:d.direction={major:{start:"left",end:"right"},minor:{start:"bottom",end:"top"}};break;case bbbfly.Bar.float.right_bottom:d.direction={major:{start:"right",end:"left"},minor:{start:"bottom",end:"top"}}}a&&(ng_BeginMeasureElement(a),d.value.size={major:ng_ClientWidth(a),minor:ng_ClientHeight(a)},
ng_EndMeasureElement(a));break;default:return}d.value.autosize=bbbfly.bar._getAutoSize(c);d.value.padding=bbbfly.bar._getPaddings(d,c);d.value.margin.major=d.value.padding.major.start;d.value.margin.minor=d.value.padding.minor.start;for(var f in b)if(a=b[f],a.Visible&&(!this._Stretcher||a!==this._Stretcher)){var e=bbbfly.bar._getItemOptions(a,c);bbbfly.bar._positionCtrl(a,d,e,d.value.autosize.major||1>d.value.idx.major?null:d.value.size.major)||(bbbfly.bar._newLine(d),bbbfly.bar._positionCtrl(a,d,
e));d.value.idx.major+=1}bbbfly.bar._closeLines(d);bbbfly.bar._autoSize(this,d);this._Stretcher&&bbbfly.bar._positionStretcher(this._Stretcher,d)}};bbbfly.bar._getBarOptions=function(b){b=ng_CopyVar(b.BarOptions);if("object"!==typeof b||null===b)b={};ng_MergeDef(b,{Orientation:bbbfly.Bar.orientation.horizontal,Float:bbbfly.Bar.float.left_top,AutoSize:bbbfly.Bar.autosize.none,PaddingTop:null,PaddingBottom:null,PaddingLeft:null,PaddingRight:null,TrackChanges:!1});return b};
bbbfly.bar._getItemOptions=function(b,a){b=ng_CopyVar(b.BarItemOptions);if("object"!==typeof b||null===b)b={};ng_MergeDef(b,{MarginTop:void 0,MarginBottom:void 0,MarginLeft:void 0,MarginRight:void 0,TrackChanges:a.TrackChanges});return b};
bbbfly.bar._getAutoSize=function(b){var a={major:!1,minor:!1};switch(b.Orientation){case bbbfly.Wrapper.orientation.vertical:b.AutoSize&bbbfly.Bar.autosize.vertical&&(a.major=!0);b.AutoSize&bbbfly.Bar.autosize.horizontal&&(a.minor=!0);break;case bbbfly.Wrapper.orientation.horizontal:b.AutoSize&bbbfly.Bar.autosize.horizontal&&(a.major=!0),b.AutoSize&bbbfly.Bar.autosize.vertical&&(a.minor=!0)}return a};
bbbfly.bar._getMargins=function(b,a){return{major:{start:bbbfly.bar._getMargin(b.direction.major.start,a),end:bbbfly.bar._getMargin(b.direction.major.end,a)},minor:{start:bbbfly.bar._getMargin(b.direction.minor.start,a),end:bbbfly.bar._getMargin(b.direction.minor.end,a)}}};bbbfly.bar._getMargin=function(b,a){var c=null;if(a)switch(b){case "left":c=a.MarginLeft;break;case "right":c=a.MarginRight;break;case "top":c=a.MarginTop;break;case "bottom":c=a.MarginBottom}return Number.isInteger(c)?c:0};
bbbfly.bar._getPaddings=function(b,a){b=b.direction;return{major:{start:bbbfly.bar._getPadding(b.major.start,a),end:bbbfly.bar._getPadding(b.major.end,a)},minor:{start:bbbfly.bar._getPadding(b.minor.start,a),end:bbbfly.bar._getPadding(b.minor.end,a)}}};bbbfly.bar._getPadding=function(b,a){var c=null;switch(b){case "left":c=a.PaddingLeft;break;case "right":c=a.PaddingRight;break;case "top":c=a.PaddingTop;break;case "bottom":c=a.PaddingBottom}return Number.isInteger(c)?c:0};
bbbfly.bar._getBoundNames=function(b){var a={};switch(b.direction.major.start){case "left":a.major={start:"L",end:"R",dim:"W"};break;case "right":a.major={start:"R",end:"L",dim:"W"};break;case "top":a.major={start:"T",end:"B",dim:"H"};break;case "bottom":a.major={start:"B",end:"T",dim:"H"};break;default:return null}switch(b.direction.minor.start){case "left":a.minor={start:"L",end:"R",dim:"W"};break;case "right":a.minor={start:"R",end:"L",dim:"W"};break;case "top":a.minor={start:"T",end:"B",dim:"H"};
break;case "bottom":a.minor={start:"B",end:"T",dim:"H"};break;default:return null}return a};
bbbfly.bar._positionCtrl=function(b,a,c,d){var f=bbbfly.bar._getBoundNames(a);if(!Object.isObject(f))return!1;c=bbbfly.bar._getMargins(a,c);var e=a.value.margin.major,g=a.value.margin.minor;c.major.start>e&&(e=c.major.start);c.minor.start>g&&(g=c.minor.start);e=a.value.position.major+e;g=a.value.position.minor+g;var h={};h[f.major.start]=e;h[f.minor.start]=g;h[f.major.end]=void 0;h[f.minor.end]=void 0;b.SetBounds(h)&&b.Update();if(b=b.Elm()){ng_BeginMeasureElement(b);switch(f.major.dim){case "W":e+=
ng_ClientWidth(b);g+=ng_ClientHeight(b);break;case "H":e+=ng_ClientHeight(b),g+=ng_ClientWidth(b)}ng_EndMeasureElement(b)}if(Number.isInteger(d)&&(f=c.major.end,a.value.padding.major.end>f&&(f=a.value.padding.major.end),e+f>d))return!1;e>a.value.max.pos.major&&(a.value.max.pos.major=e);g>a.value.max.pos.minor&&(a.value.max.pos.minor=g);a.value.position.major=e;a.value.margin.major=c.major.end;e+=c.major.end;g+=c.minor.end;e>a.value.max.mpos.major&&(a.value.max.mpos.major=e);g>a.value.max.mpos.minor&&
(a.value.max.mpos.minor=g);return!0};bbbfly.bar._newLine=function(b){var a=b.value;a.position.major=0;a.position.minor=a.max.pos.minor;a.margin.major=b.value.padding.major.start;a.margin.minor=a.max.mpos.minor-a.max.pos.minor;a.idx.major=0;a.idx.minor+=1};
bbbfly.bar._closeLines=function(b){var a=b.value;a.position.major=a.max.pos.major;a.position.minor=a.max.pos.minor;a.margin.major=a.max.mpos.major-a.max.pos.major;a.margin.minor=a.max.mpos.minor-a.max.pos.minor;b.value.padding.major.end>a.margin.major&&(a.margin.major=b.value.padding.major.end);b.value.padding.minor.end>a.margin.minor&&(a.margin.minor=b.value.padding.minor.end)};
bbbfly.bar._positionStretcher=function(b,a){var c=a.value;0<c.margin.major||0<c.margin.minor||!c.autosize.major||!c.autosize.minor?(--c.margin.major,--c.margin.minor,bbbfly.bar._positionCtrl(b,a)):b.SetVisible(!1)};
bbbfly.bar._autoSize=function(b,a){var c=a.value;if(c.autosize.major||c.autosize.minor)if(a=bbbfly.bar._getBoundNames(a),Object.isObject(a)){var d=c.position.major+c.margin.major,f=c.position.minor+c.margin.minor,e=b.GetControlsPanel();if(e&&e.Bounds){var g=e.Bounds[a.major.start],h=e.Bounds[a.major.end],k=e.Bounds[a.minor.start];e=e.Bounds[a.minor.end];Number.isInteger(g)&&(d+=g);Number.isInteger(h)&&(d+=h);Number.isInteger(k)&&(f+=k);Number.isInteger(e)&&(f+=e)}g={};c.autosize.major&&(g[a.major.dim]=
d);c.autosize.minor&&(g[a.minor.dim]=f);b.SetBounds(g)&&(b.Update(!1),Function.isFunction(b.OnAutoSized)&&b.OnAutoSized())}};bbbfly.Bar=function(b,a,c){b=b||{};ng_MergeDef(b,{ScrollBars:ssNone,Data:{BarOptions:void 0,_Stretcher:null},Events:{OnUpdate:bbbfly.bar._onUpdate,OnUpdated:bbbfly.bar._onUpdated,OnAutoSized:null},Methods:{DoCreate:bbbfly.bar._doCreate}});return ngCreateControlAsType(b,"bbbfly.Frame",a,c)};bbbfly.Bar.orientation={vertical:1,horizontal:2};
bbbfly.Bar.float={left_top:1,right_top:2,left_bottom:3,right_bottom:4};bbbfly.Bar.autosize={none:0,vertical:1,horizontal:2,both:3};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_bar={OnInit:function(){ngRegisterControlType("bbbfly.Bar",bbbfly.Bar)}};
