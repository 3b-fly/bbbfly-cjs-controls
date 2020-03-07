/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,e){a!=Array.prototype&&a!=Object.prototype&&(a[b]=e.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,e,c){if(b){e=$jscomp.global;a=a.split(".");for(c=0;c<a.length-1;c++){var d=a[c];d in e||(e[d]={});e=e[d]}a=a[a.length-1];c=e[a];b=b(c);b!=c&&null!=b&&$jscomp.defineProperty(e,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.tooltip={_leafletPrefix:"bbbfly_map_tooltip_lf-",_packagePrefix:"bbbfly_map_tooltip-",_lastId:0,_styles:{},utils:{}};bbbfly.map.drawing.utils.LeafletId=function(a){a=Object.isObject(a)?L.stamp(a):null;return Number.isInteger(a)?bbbfly.map.tooltip._leafletPrefix+a:a};
bbbfly.map.tooltip.utils.TooltipId=function(a){a=a?a.ID:null;if(String.isString(a))return a;a=bbbfly.map.tooltip._packagePrefix;return a+ ++bbbfly.map.tooltip._lastId};bbbfly.map.tooltip.utils.ObjDim=function(a,b){if(!Object.isObject(a))return 0;a=a[b];return Number.isInteger(a)?a:0};
bbbfly.map.tooltip.utils.AnchorProps=function(a,b,e,c){var d={L:null,T:null,R:null,B:null,OX:null,OXL:null,OXR:null,OY:null,OYT:null,OYB:null,Style:{display:"none"},ImgProxy:null};if(!Object.isObject(b))return d;a=bbbfly.Renderer.ImageProxy(b.Img,c,a+"_"+e);c=a.Anchor||{L:0,T:0};d.ImgProxy=a;if(!a.W||!a.H)return d;switch(e){case "AL":d.L=Number.isInteger(b.L)?b.L:0;d.OX=c.L-d.L;break;case "AT":d.T=Number.isInteger(b.T)?b.T:0;d.OY=c.T-d.T;break;case "AR":d.R=Number.isInteger(b.R)?b.R:0;d.OX=d.R+c.L-
a.W;break;case "AB":d.B=Number.isInteger(b.B)?b.B:0,d.OY=d.B+c.T-a.H}switch(e){case "AL":case "AR":Number.isInteger(b.T)?(d.T=b.T,d.OYT=b.T+c.T):Number.isInteger(b.B)?(d.B=b.B,d.OYB=b.B+a.H-c.T):Number.isInteger(a.H)&&(d.T="50%",d.OY=Math.round(a.H/2)-c.T,d.Style["margin-top"]=bbbfly.Renderer.StyleDim(Math.round(a.H/-2)));break;case "AT":case "AB":Number.isInteger(b.L)?(d.L=b.L,d.OXL=b.L+c.L):Number.isInteger(b.R)?(d.R=b.R,d.OXR=b.R+a.W-c.L):Number.isInteger(a.W)&&(d.L="50%",d.OX=Math.round(a.W/2)-
c.L,d.Style["margin-left"]=bbbfly.Renderer.StyleDim(Math.round(a.W/-2)))}return d};bbbfly.map.tooltip.utils.AnchorsProps=function(a,b,e){var c={AL:null,AT:null,AR:null,AB:null};if(!String.isString(a)||!Object.isObject(b))return c;var d=bbbfly.map.tooltip.utils;b.Left&&(c.AL=d.AnchorProps(a,b.Left,"AL",e));b.Top&&(c.AT=d.AnchorProps(a,b.Top,"AT",e));b.Right&&(c.AR=d.AnchorProps(a,b.Right,"AR",e));b.Bottom&&(c.AB=d.AnchorProps(a,b.Bottom,"AB",e));return c};
bbbfly.map.tooltip.utils.AnchorHTML=function(a,b){return bbbfly.Renderer.ImageHTML(a.ImgProxy,a.L,a.T,a.R,a.B,b,null,a.Style)};bbbfly.map.tooltip.utils.AnchorsHTML=function(a,b){var e="";Object.isObject(a)&&(e+=bbbfly.map.tooltip.utils.AnchorHTML(a.AL,b),e+=bbbfly.map.tooltip.utils.AnchorHTML(a.AT,b),e+=bbbfly.map.tooltip.utils.AnchorHTML(a.AR,b),e+=bbbfly.map.tooltip.utils.AnchorHTML(a.AB,b));return e};
bbbfly.map.tooltip._getText=function(){return String.isString(this.Options.Text)?this.Options.Text:String.isString(this.Options.TextRes)?ngTxt(this.Options.TextRes):null};bbbfly.map.tooltip._getStyle=function(){var a=bbbfly.MapTooltip.Style,b=this.Options.Style;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.MapTooltip.Style.Get(b));return b instanceof a?b:new a};
bbbfly.map.tooltip._getHTML=function(a,b){String.isString(b)&&(b='<span class="frameContent">'+b+"</span>");a=bbbfly.Renderer.FrameProxy(a,null,this.ID);b=bbbfly.Renderer.DynamicFrameHTML(a,null,null,b);return b+=bbbfly.map.tooltip.utils.AnchorsHTML(this._AnchorProps,null)};
bbbfly.map.tooltip._create=function(){if(!this._ParentLayer)return null;var a=this.GetStyle();if(!this._Tooltip){var b=new L.Tooltip({permanent:!0,opacity:a.opacity,className:a.className});b.Owner=this;ng_OverrideMethod(b,"_setPosition",bbbfly.map.tooltip._setPosition);this._ParentLayer.bindTooltip(b);this._Tooltip=b}this._AnchorProps||(this._AnchorProps=bbbfly.map.tooltip.utils.AnchorsProps(this.ID,a.anchors,null));return this._Tooltip};
bbbfly.map.tooltip._dispose=function(){this._ParentLayer&&this._Tooltip&&this._ParentLayer.getTooltip()===this._Tooltip&&(this._ParentLayer.unbindTooltip(),this._AnchorProps=this._Tooltip=null)};
bbbfly.map.tooltip._show=function(a){if(!a instanceof L.Layer)return!1;this._ParentLayer&&this._ParentLayer!==a&&this.Dispose();this._ParentLayer=a;var b=this.Create();if(!b)return!1;var e=this.GetText(),c="";if(String.isString(e)&&""!==e){c=this.GetStyle();var d=this.Options.HTMLEncode;Boolean.isBoolean(d)||(d=!0);d&&(e=ng_htmlEncode(e,!0));c=this.GetHTML(c.frame,e)}c!==this._Html&&(b.setContent(c),this._Html=c);a.isTooltipOpen()||a.openTooltip()};
bbbfly.map.tooltip._hide=function(){this._ParentLayer&&this._Tooltip&&this._ParentLayer.closeTooltip()};
bbbfly.map.tooltip._setPosition=function(a){this._setPosition.callParent(a);a=this._container;var b=this.Owner._AnchorProps;if(a&&b){var e=null,c=L.DomUtil.getClass(a);String.isString(c)&&(-1<c.indexOf("leaflet-tooltip-left")?e="AR":-1<c.indexOf("leaflet-tooltip-top")?e="AB":-1<c.indexOf("leaflet-tooltip-right")?e="AL":-1<c.indexOf("leaflet-tooltip-bottom")&&(e="AT"));for(var d in b){c=b[d];var g=c.ImgProxy;if(g&&(g=document.getElementById(g.Id))){var h=d===e;g.style.display=h?"block":"none";if(h){g=
Math.round(a.offsetHeight/2);h=Math.round(a.offsetWidth/2);var f=L.DomUtil.getPosition(a);switch(d){case "AL":case "AR":f.x+=c.OX;c.OYT?f.y+=g-c.OYT:c.OYB?f.y+=c.OYB-g:c.OY&&(f.y+=c.OY);break;case "AT":case "AB":f.y+=c.OY,c.OXL?f.x+=h-c.OXL:c.OXR?f.x+=c.OXR-h:c.OX&&(f.x+=c.OX)}L.DomUtil.setPosition(a,f)}}}}};
bbbfly.MapTooltip=function(a){Object.isObject(a)||(a={});this.ID=bbbfly.map.tooltip.utils.TooltipId(a);this.Options=a;this._Html="";this._ParentLayer=this._AnchorProps=this._Tooltip=null;this.GetText=bbbfly.map.tooltip._getText;this.GetStyle=bbbfly.map.tooltip._getStyle;this.GetHTML=bbbfly.map.tooltip._getHTML;this.Create=bbbfly.map.tooltip._create;this.Dispose=bbbfly.map.tooltip._dispose;this.Show=bbbfly.map.tooltip._show;this.Hide=bbbfly.map.tooltip._hide};
bbbfly.MapTooltip.Style=function(a){this.anchors=this.frame=null;this.opacity=1;this.className="";Object.isObject(a)&&(Object.isObject(a.frame)&&(this.frame=a.frame),Object.isObject(a.anchors)&&(this.anchors=a.anchors),Number.isNumber(a.opacity)&&(this.opacity=a.opacity),String.isString(a.className)&&(this.className=a.className))};bbbfly.MapTooltip.Style.Get=function(a){return String.isString(a)&&(a=bbbfly.map.tooltip._styles[a],a instanceof bbbfly.MapTooltip.Style)?a:null};
bbbfly.MapTooltip.Style.Define=function(a,b){if(!(b instanceof bbbfly.MapTooltip.Style&&String.isString(a)))return!1;var e=bbbfly.map.tooltip._styles;if("undefined"!==typeof e[a])return!1;e[a]=b;return!0};
