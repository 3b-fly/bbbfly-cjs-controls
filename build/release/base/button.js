/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var g=a[d];g in c||(c[g]={});c=c[g]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.button={};bbbfly.button._setAlt=function(a,b){!String.isString(a)&&null!==a||a===this.Alt||(this.Alt=a,Boolean.isBoolean(b)&&!b||this.Update())};bbbfly.button._setText=function(a,b){!String.isString(a)&&null!==a||a===this.Text||(this.Text=a,Boolean.isBoolean(b)&&!b||this.Update())};
bbbfly.button._getAlt=function(){return String.isString(this.AltRes)?ngTxt(this.AltRes):String.isString(this.Alt)?this.Alt:null};bbbfly.button._getText=function(){return String.isString(this.Text)?this.Text:String.isString(this.TextRes)?ngTxt(this.TextRes):null};bbbfly.button._getIcon=function(){return Object.isObject(this.Icon)?this.Icon:{}};
bbbfly.button._setIcon=function(a,b,c,d,g){if(a&&b&&c){var k=Number.isInteger(b.W)?b.W:0,f=Number.isInteger(b.H)?b.H:0,p=null,e=null,m=null,q=null,h=null,l=null;switch(d){case bbbfly.Button.iconalign.left:p=Number.isInteger(c.L)?c.L:0;l=Math.floor(f/2);e="50%";break;case bbbfly.Button.iconalign.top:e=Number.isInteger(c.T)?c.T:0;h=Math.floor(k/2);p="50%";break;case bbbfly.Button.iconalign.right:m=Number.isInteger(c.R)?c.R:0;l=Math.floor(f/2);e="50%";break;case bbbfly.Button.iconalign.bottom:q=Number.isInteger(c.B)?
c.B:0,h=Math.floor(k/2),p="50%"}c={};h&&(h=bbbfly.Renderer.StyleDim(h,!0),c["margin-left"]=h);l&&(l=bbbfly.Renderer.StyleDim(l,!0),c["margin-top"]=l);a.style.visibility=k&&f?"visible":"hidden";return bbbfly.Renderer.SetImage(a,b,p,e,m,q,g,"Icon",c)}};
bbbfly.button._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);a=document.createElement("DIV");a.id=this.ID+"_H";a.style.zIndex=3;a.style.display="block";a.style.position="absolute";a.style.overflow="hidden";c.appendChild(a);this.GetIcon()&&(a=document.createElement("DIV"),a.id=this.ID+"_I",a.style.zIndex=3,a.style.visibility="hidden",c.appendChild(a))};
bbbfly.button._doUpdate=function(a){if(a){this.DoUpdate.callParent(a);var b=this.GetAlt();String.isString(b)&&b?(this.HTMLEncode&&(b=ng_htmlEncode(b,!1)),a.title=b):a.title="";a.style.cursor=this.HasClick()||this.HasDblClick()?"pointer":"default";this.DoUpdateHolder();this.DoAutoSize()}};
bbbfly.button._doUpdateHolder=function(){var a=document.getElementById(this.ID+"_H"),b=document.getElementById(this.ID+"_I"),c=this.GetText(),d=this.GetIcon(),g=this.GetState(),k=!!Object.isObject(d),f=!(!String.isString(c)||!c),p=g.mouseover;g.mouseover=!1;var e=this.GetFrameDims(),m=null,q=null,h=null,l=null,r=!1;d=bbbfly.Renderer.ImageProxy(d,g,this.ID+"_I");var w=0,x=0,y=0,z=0,t=0;Object.isObject(this.Indent)&&(Number.isInteger(this.Indent.L)&&(w=this.Indent.L),Number.isInteger(this.Indent.T)&&
(x=this.Indent.T),Number.isInteger(this.Indent.R)&&(y=this.Indent.R),Number.isInteger(this.Indent.B)&&(z=this.Indent.B),Number.isInteger(this.Indent.I)&&(t=this.Indent.I),f&&k||(t=0));var n={L:w,T:x,R:y,B:z},u=Number.isInteger(d.W)?d.W:0,v=Number.isInteger(d.H)?d.H:0;k=0;switch(this.IconAlign){case bbbfly.Button.iconalign.left:u&&(r=!0,m=0,n.L+=e.L,e.L+=u+t);k=v;break;case bbbfly.Button.iconalign.top:v&&(r=!0,q=0,n.T+=e.T,e.T+=v+t);k=u;break;case bbbfly.Button.iconalign.right:u&&(r=!0,h=0,n.R+=e.R,
e.R+=u+t);k=v;break;case bbbfly.Button.iconalign.bottom:v&&(r=!0,l=0,n.B+=e.B,e.B+=v+t),k=u}b&&bbbfly.button._setIcon(b,d,n,this.IconAlign,g);b="";if(f){this.HTMLEncode&&(c=ng_htmlEncode(c,!0));f=["word-wrap: normal"];switch(this.TextAlign){case bbbfly.Button.textalign.right:f.push("float: right");f.push("text-align: right");r||(h=0);break;case bbbfly.Button.textalign.center:f.push("float: none");f.push("text-align: center");r||(m=0);break;default:f.push("float: left"),f.push("text-align: left"),
r||(m=0)}this.MultiLine||f.push("white-space: nowrap");f=f.join(";");b+='<div id="'+this.ID+'_TH"><div id="'+this.ID+'_T" class="Text"'+(f?' style="'+f+'"':"")+' unselectable="on">'+c+"</div></div>"}switch(this.AutoSize){case bbbfly.Button.autosize.both:break;case bbbfly.Button.autosize.horizontal:l=q=0;break;case bbbfly.Button.autosize.vertical:h=m=0;break;default:l=h=q=m=0}a&&(a.style.minWidth=bbbfly.Renderer.StyleDim(0),a.style.minHeight=bbbfly.Renderer.StyleDim(k),a.style.marginLeft=bbbfly.Renderer.StyleDim(e.L+
w),a.style.marginTop=bbbfly.Renderer.StyleDim(e.T+x),a.style.marginRight=bbbfly.Renderer.StyleDim(e.R+y),a.style.marginBottom=bbbfly.Renderer.StyleDim(e.B+z),a.style.left=bbbfly.Renderer.StyleDim(m),a.style.top=bbbfly.Renderer.StyleDim(q),a.style.right=bbbfly.Renderer.StyleDim(h),a.style.bottom=bbbfly.Renderer.StyleDim(l));this._IconProxy=d;g.mouseover=p;if(b!==this._HolderHtml)this._HolderHtml=b,a&&(a.innerHTML=b),p&&bbbfly.Renderer.UpdateImageHTML(d,g);else if(a=document.getElementById(this.ID+
"_TH"))a.style.paddingLeft=bbbfly.Renderer.StyleDim(0),a.style.paddingTop=bbbfly.Renderer.StyleDim(0),a.style.paddingRight=bbbfly.Renderer.StyleDim(0),a.style.paddingBottom=bbbfly.Renderer.StyleDim(0)};bbbfly.button._doUpdateImages=function(){var a=this._IconProxy,b=this.GetState();bbbfly.Renderer.UpdateImageProxy(a,b);bbbfly.Renderer.UpdateImageHTML(a,b);this.DoUpdateImages.callParent()};
bbbfly.button._doAutoSize=function(){var a=document.getElementById(this.ID+"_H");if(a){ng_BeginMeasureElement(a);var b=ng_OuterWidth(a),c=ng_OuterHeight(a),d=ng_ClientHeight(a);ng_EndMeasureElement(a);a=!0;if(this.AutoSize){var g={};this.AutoSize&bbbfly.Button.autosize.horizontal&&(g.W=b);this.AutoSize&bbbfly.Button.autosize.vertical&&(g.H=c,a=!1);this.SetBounds(g)}a&&(c=document.getElementById(this.ID+"_T"),b=document.getElementById(this.ID+"_TH"),c&&b&&(c=ng_OuterHeight(c),b.style.paddingTop=bbbfly.Renderer.StyleDim(c<
d?Math.floor((d-c)/2):0)))}};bbbfly.button._doMouseEnter=function(a,b){a=this.DoMouseEnter.callParent(a,b);bbbfly.Renderer.UpdateImageHTML(this._IconProxy,a);return a};bbbfly.button._doMouseLeave=function(a,b){a=this.DoMouseLeave.callParent(a,b);bbbfly.Renderer.UpdateImageHTML(this._IconProxy,a);return a};bbbfly.button._doAcceptCPGestures=function(a,b){b.drag=!1};bbbfly.button._doAcceptGestures=function(a,b){b.doubletap=!0;b.tap=!0};bbbfly.button._doPtrClick=function(a){"control"===a.EventID&&this.Click(a.Event)};
bbbfly.button._doPtrDblClick=function(a){"control"===a.EventID&&this.DblClick(a.Event)};bbbfly.button._click=function(a){this.HasClick&&this.OnClick(a)};bbbfly.button._dblClick=function(a){this.HasDblClick&&this.OnDblClick(a)};bbbfly.button._hasClick=function(){return!this.Enabled||this.ReadOnly?!1:Function.isFunction(this.OnClick)};bbbfly.button._hasDblClick=function(){return!this.Enabled||this.ReadOnly?!1:Function.isFunction(this.OnDblClick)};
bbbfly.button._onClick=function(){this.SelectType&bbbfly.Button.selecttype.click&&this.SetSelected(!this.Selected)};bbbfly.button._onDblClick=function(){this.SelectType&bbbfly.Button.selecttype.dblclick&&this.SetSelected(!this.Selected)};bbbfly.button.NormalizeDef=function(a){a=a||{};ng_MergeDef(a,{Methods:{GetState:bbbfly.button._ngGetState,DoUpdate:bbbfly.button._ngDoUpdate}});return a};
bbbfly.button._ngDoUpdate=function(a){this.DoUpdate.callParent(a);a=document.getElementById(this.ID+"_T");bbbfly.Renderer.UpdateHTMLState(a,this.GetState());return!0};bbbfly.button._ngGetState=function(){return{disabled:!this.Enabled,readonly:!!this.ReadOnly,invalid:!!this.Invalid,mouseover:!(!this.Enabled||this.ReadOnly||!ngMouseInControls[this.ID])}};
bbbfly.Button=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Alt:null,AltRes:null,Text:null,TextRes:null,TextAlign:bbbfly.Button.textalign.left,Icon:null,IconAlign:bbbfly.Button.iconalign.left,Indent:null,AutoSize:bbbfly.Button.autosize.none,SelectType:bbbfly.Button.selecttype.none,MultiLine:!1,HTMLEncode:!0,_IconProxy:null,_HolderHtml:""},ControlsPanel:{Methods:{DoAcceptGestures:bbbfly.button._doAcceptCPGestures}},Events:{OnClick:bbbfly.button._onClick,OnDblClick:bbbfly.button._onDblClick},Methods:{DoCreate:bbbfly.button._doCreate,
DoUpdate:bbbfly.button._doUpdate,DoUpdateHolder:bbbfly.button._doUpdateHolder,DoUpdateImages:bbbfly.button._doUpdateImages,DoAutoSize:bbbfly.button._doAutoSize,DoMouseEnter:bbbfly.button._doMouseEnter,DoMouseLeave:bbbfly.button._doMouseLeave,DoAcceptGestures:bbbfly.button._doAcceptGestures,DoPtrClick:bbbfly.button._doPtrClick,DoPtrDblClick:bbbfly.button._doPtrDblClick,SetAlt:bbbfly.button._setAlt,SetText:bbbfly.button._setText,GetAlt:bbbfly.button._getAlt,GetText:bbbfly.button._getText,GetIcon:bbbfly.button._getIcon,
Click:bbbfly.button._click,DblClick:bbbfly.button._dblClick,HasClick:bbbfly.button._hasClick,HasDblClick:bbbfly.button._hasDblClick}});bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};bbbfly.Button.textalign={left:1,center:2,right:3};bbbfly.Button.iconalign={left:1,top:2,right:3,bottom:4};bbbfly.Button.autosize={none:0,horizontal:1,vertical:2,both:3};bbbfly.Button.selecttype={none:0,click:1,dblclick:2,both:3};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_button={OnInit:function(){ngRegisterControlType("bbbfly.Button",bbbfly.Button)}};
