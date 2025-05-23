/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.text={};bbbfly.text._setText=function(a,b){!String.isString(a)&&null!==a||a===this.Text||(this.Text=a,Boolean.isBoolean(b)&&!b||this.Update())};bbbfly.text._getText=function(){return String.isString(this.Text)?this.Text:String.isString(this.TextRes)?ngTxt(this.TextRes):null};
bbbfly.text._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);a=document.createElement("SPAN");a.id=this.ID+"_T";a.className="Text";a.style.display="block";a.style.position="absolute";a.style.wordWrap="normal";c.appendChild(a)};bbbfly.text._doUpdate=function(a){if(!this.DoUpdate.callParent(a))return!1;this.DoUpdateText();this.DoAutoSize();return!0};
bbbfly.text._doUpdateText=function(){var a=document.getElementById(this.ID+"_T");if(a){var b=this.GetText(),c=!(!String.isString(b)||!b),d=null,h=null,e=null,k=null,f="",g="center",l="normal";if(c)switch(this.HTMLEncode&&(b=ng_htmlEncode(b,!0)),this.MultiLine||(l="nowrap"),this.TextAlign){case bbbfly.Text.textalign.right:g=f="right";e=0;break;case bbbfly.Text.textalign.center:f="none";g="center";d=0;break;default:g=f="left",d=0}switch(this.AutoSize){case bbbfly.Text.autosize.both:break;case bbbfly.Text.autosize.horizontal:k=
h=0;break;case bbbfly.Text.autosize.vertical:e=d=0;break;default:k=e=h=d=0}this.Selectable?a.removeAttribute("unselectable"):a.setAttribute("unselectable","on");a.style.float=f;a.style.textAlign=g;a.style.whiteSpace=l;a.style.left=bbbfly.Renderer.StyleDim(d);a.style.top=bbbfly.Renderer.StyleDim(h);a.style.right=bbbfly.Renderer.StyleDim(e);a.style.bottom=bbbfly.Renderer.StyleDim(k);a.innerHTML=c?b:""}};
bbbfly.text._doAutoSize=function(){var a=document.getElementById(this.ID+"_T");if(this.AutoSize&&a){var b={};ng_BeginMeasureElement(a);this.AutoSize&bbbfly.Text.autosize.horizontal&&(b.W=ng_OuterWidth(a));this.AutoSize&bbbfly.Text.autosize.vertical&&(b.H=ng_OuterHeight(a));ng_EndMeasureElement(a);this.SetBounds(b)}};
bbbfly.Text=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Text:null,TextRes:null,TextAlign:bbbfly.Text.textalign.left,AutoSize:bbbfly.Text.autosize.none,MultiLine:!1,Selectable:!0},Methods:{DoCreate:bbbfly.text._doCreate,DoUpdate:bbbfly.text._doUpdate,DoUpdateText:bbbfly.text._doUpdateText,DoAutoSize:bbbfly.text._doAutoSize,SetText:bbbfly.text._setText,GetText:bbbfly.text._getText}});bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"bbbfly.Panel",b,c)};
bbbfly.Text.textalign={left:1,center:2,right:3};bbbfly.Text.autosize={none:0,horizontal:1,vertical:2,both:3};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_text={OnInit:function(){ngRegisterControlType("bbbfly.Text",bbbfly.Text)}};
