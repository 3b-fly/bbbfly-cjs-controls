/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,e){if(b){c=$jscomp.global;a=a.split(".");for(e=0;e<a.length-1;e++){var d=a[e];d in c||(c[d]={});c=c[d]}a=a[a.length-1];e=c[a];b=b(e);b!=e&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.image={};bbbfly.imagepreview={};bbbfly.image._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);a=document.createElement("DIV");a.id=this.ID+"_I";a.style.zIndex=300;a.style.visibility="hidden";c.appendChild(a)};bbbfly.image._setAlt=function(a,b){!String.isString(a)&&null!==a||a===this.Alt||(this.Alt=a,Boolean.isBoolean(b)&&!b||this.Update())};
bbbfly.image._setImage=function(a,b){!Object.isObject(a)&&null!==a||a===this.Image||(this.Image=a,Boolean.isBoolean(b)&&!b||this.Update())};bbbfly.image._getAlt=function(){return String.isString(this.AltRes)?ngTxt(this.AltRes):String.isString(this.Alt)?this.Alt:null};bbbfly.image._getImage=function(){return Object.isObject(this.Image)?this.Image:null};
bbbfly.image._doUpdate=function(a){if(a){this.DoUpdate.callParent(a);var b=this.GetAlt();String.isString(b)&&b?(this.HTMLEncode&&(b=ng_htmlEncode(b,!1)),a.title=b):a.title="";this.DoUpdateImage()}};
bbbfly.image._doUpdateImage=function(){var a=document.getElementById(this.ID+"_I"),b=this.GetImage(),c=this.GetState(),e=c.mouseover;c.mouseover=!1;b=bbbfly.Renderer.ImageProxy(b,c,this.ID+"_I");var d=this.GetFrameDims(),f=Number.isInteger(b.W)?b.W:0,g=Number.isInteger(b.H)?b.H:0;a&&(bbbfly.Renderer.SetImage(a,b,d.L,d.T,d.R,d.B,c,"Image"),a.style.visibility=f&&g?"visible":"hidden");this._ImageProxy=b;(c.mouseover=e)&&bbbfly.Renderer.UpdateImageHTML(b,c);this.SetBounds({W:f+d.L+d.R,H:g+d.T+d.B})};
bbbfly.image._doMouseEnter=function(a,b){a=this.DoMouseEnter.callParent(a,b);bbbfly.Renderer.UpdateImageHTML(this._ImageProxy,a);return a};bbbfly.image._doMouseLeave=function(a,b){a=this.DoMouseLeave.callParent(a,b);bbbfly.Renderer.UpdateImageHTML(this._ImageProxy,a);return a};bbbfly.imagepreview._getImgHolder=function(){return this.Controls.Image.GetControlsHolder()};
bbbfly.imagepreview._getImgNode=function(){var a=this.GetImgHolder();if(!a||!String.isString(a.ID))return null;var b=a.ID+"_IMG",c=document.getElementById(b);if(!c){a=a.Elm();if(!a)return null;ng_SetInnerHTML(a,'<img id="'+b+'" style="position:absolute;left:50%;top:50%;max-width:100%;max-height:100%;background-color:transparent"/>');if(c=document.getElementById(b))c.onload=function(){this.style.marginLeft=Number.isNumber(this.width)?-(this.width/2)+"px":"0px";this.style.marginTop=Number.isNumber(this.height)?
-(this.height/2)+"px":"0px"}}return c};bbbfly.imagepreview._setImage=function(a){var b=this.GetImgNode();b&&(b.src="",String.isString(a)&&(b.src=a))};bbbfly.imagepreview._onCreated=function(a){String.isString(a.ImgUrl)&&a.SetImage(a.ImgUrl);return!0};
bbbfly.Image=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Alt:null,AltRes:null,Image:null,HTMLEncode:!0,_ImageProxy:null},Methods:{DoCreate:bbbfly.image._doCreate,DoUpdate:bbbfly.image._doUpdate,DoUpdateImage:bbbfly.image._doUpdateImage,DoMouseEnter:bbbfly.image._doMouseEnter,DoMouseLeave:bbbfly.image._doMouseLeave,SetAlt:bbbfly.image._setAlt,SetImage:bbbfly.image._setImage,GetAlt:bbbfly.image._getAlt,GetImage:bbbfly.image._getImage}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};
bbbfly.ImagePreview=function(a,b,c){a=a||{};ng_MergeDef(a,{ParentReferences:!1,Data:{ImgUrl:null},OnCreated:bbbfly.imagepreview._onCreated,Controls:{Image:{Type:"bbbfly.Panel",L:0,R:0,T:0,B:0}},Methods:{GetImgHolder:bbbfly.imagepreview._getImgHolder,GetImgNode:bbbfly.imagepreview._getImgNode,SetImage:bbbfly.imagepreview._setImage}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_image={OnInit:function(){ngRegisterControlType("bbbfly.Image",bbbfly.Image);ngRegisterControlType("bbbfly.ImagePreview",bbbfly.ImagePreview)}};
