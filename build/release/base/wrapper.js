/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.wrapper={};bbbfly.wrapper._doCreate=function(a,b,e){this.DoCreate.callParent(a,b,e);a=this.GetControlsHolder();if(Function.isFunction(a.AddEvent)){var d=this;a.AddEvent("OnChildControlAdded",function(a){d.TrackControl(a,!0)});a.AddEvent("OnChildControlRemoved",function(a){d.TrackControl(a,!1)})}for(var c in a.ChildControls)this.TrackControl(a.ChildControls[c],!0);this._Stretcher||(this._Stretcher=this.CreateChildControl({Type:"bbbfly.Panel"}))};
bbbfly.wrapper._onUpdate=function(){var a=this.GetControlsHolder(),b=bbbfly.wrapper._getWrapperOptions(this);a.SetScrollBars(b.AutoSize?ssNone:ssAuto);return!0};
bbbfly.wrapper._onUpdated=function(){var a=this.GetControlsHolder(),b=a.Elm(),e=a.ChildControls;if(e){a=bbbfly.wrapper._getWrapperOptions(this);var d=null,c={value:{position:{start:0,end:0},margin:{start:null,end:null}}};switch(a.Orientation){case bbbfly.Wrapper.orientation.vertical:c.float={start:"top",end:"bottom",stretch:"stretch"};c.direction={start:"top",end:"bottom"};c.padding={start:"PaddingBottom",end:"PaddingTop"};c.margin={start:"MarginTop",end:"MarginBottom"};!this._handlingSizeChange&&
b&&(d=ng_ClientWidth(b));break;case bbbfly.Wrapper.orientation.horizontal:c.float={start:"left",end:"right",stretch:"stretch"};c.direction={start:"left",end:"right"};c.padding={start:"PaddingRight",end:"PaddingLeft"};c.margin={start:"MarginLeft",end:"MarginRight"};!this._handlingSizeChange&&b&&(d=ng_ClientHeight(b));break;default:return}bbbfly.wrapper._overwriteMargin(c,"start",a,"padding");bbbfly.wrapper._overwriteMargin(c,"end",a,"padding");var g=0,f=0,l=[];for(n in e){var h=e[n];if(h.Visible&&
(!this._Stretcher||h!==this._Stretcher)){var k=bbbfly.wrapper._getWrapOptions(h,a);switch(k.Float){case bbbfly.Wrapper.float[c.float.start]:bbbfly.wrapper._setMargin(c,"end",k,"margin");bbbfly.wrapper._positionCtrl(h,c,"start",a);bbbfly.wrapper._overwriteMargin(c,"end",k,"margin");g++;break;case bbbfly.Wrapper.float[c.float.end]:bbbfly.wrapper._setMargin(c,"start",k,"margin");bbbfly.wrapper._positionCtrl(h,c,"end",a);bbbfly.wrapper._overwriteMargin(c,"start",k,"margin");f++;break;case bbbfly.Wrapper.float[c.float.stretch]:l.push(h)}}}var n=
bbbfly.wrapper._canPlaceStretchCtrls(this,l,c,a);if(0<l.length)for(var m in l)h=l[m],k=bbbfly.wrapper._getWrapOptions(h,a),n?(e=ng_CopyVar(c),bbbfly.wrapper._setMargin(e,"start",k,"margin"),bbbfly.wrapper._setMargin(e,"end",k,"margin"),bbbfly.wrapper._positionCtrl(h,e,"stretch",a)):bbbfly.wrapper._positionCtrl(h,c,"hide",a);this._Stretcher&&this._Stretcher.SetVisible(!1);a.AutoSize?(bbbfly.wrapper._setMargin(c,"end",a,"value"),bbbfly.wrapper._autoSize(this,c,a)):!n&&this._Stretcher&&(1>f?(bbbfly.wrapper._setMargin(c,
"end",a,"value"),bbbfly.wrapper._positionStretcher(this._Stretcher,c,"start",a),this._Stretcher.SetVisible(!0)):1>g&&(bbbfly.wrapper._setMargin(c,"start",a,"value"),bbbfly.wrapper._positionStretcher(this._Stretcher,c,"end",a),this._Stretcher.SetVisible(!0)));if(b&&!this._handlingSizeChange){m=null;switch(a.Orientation){case bbbfly.Wrapper.orientation.vertical:m=ng_ClientWidth(b);break;case bbbfly.Wrapper.orientation.horizontal:m=ng_ClientHeight(b)}m!==d&&(this._handlingSizeChange=!0,this.Update(),
this._handlingSizeChange=!1)}}};
bbbfly.wrapper._isTrackedControlChanged=function(a,b){var e=bbbfly.wrapper._getWrapperOptions(this),d=bbbfly.wrapper._getWrapOptions(a,e);if(!d.TrackChanges)return!1;var c=d.Float,g=b.Float,f=a.Visible,l=b.Visible;a=a.Bounds?a.Bounds:{};var h=b.Bounds?b.Bounds:{};b.Float=c;b.Visible=f;b.Bounds=ng_CopyVar(a);if(c!==g||f!==l)return!0;switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:if(a.H!==h.H)switch(d.Float){case bbbfly.Wrapper.float.top:case bbbfly.Wrapper.float.bottom:case bbbfly.Wrapper.float.stretch:return!0}break;case bbbfly.Wrapper.orientation.horizontal:if(a.W!==
h.W)switch(d.Float){case bbbfly.Wrapper.float.left:case bbbfly.Wrapper.float.right:case bbbfly.Wrapper.float.stretch:return!0}}return!1};bbbfly.wrapper._getWrapperOptions=function(a){a=ng_CopyVar(a.WrapperOptions);if("object"!==typeof a||null===a)a={};ng_MergeDef(a,{Orientation:bbbfly.Wrapper.orientation.vertical,AutoSize:!1,PaddingTop:null,PaddingBottom:null,PaddingLeft:null,PaddingRight:null,TrackChanges:!1});return a};
bbbfly.wrapper._getWrapOptions=function(a,b){a=ng_CopyVar(a.WrapOptions);if("object"!==typeof a||null===a)a={};var e={Float:void 0,MarginTop:void 0,MarginBottom:void 0,MarginLeft:void 0,MarginRight:void 0,TrackChanges:b.TrackChanges};switch(b.Orientation){case bbbfly.Wrapper.orientation.vertical:e.Float=bbbfly.Wrapper.float.top;break;case bbbfly.Wrapper.orientation.horizontal:e.Float=bbbfly.Wrapper.float.left}ng_MergeDef(a,e);return a};
bbbfly.wrapper._setMargin=function(a,b,e,d){var c=null,g=b;switch(b){case "start":g="end";break;case "end":g="start"}switch(d){case "margin":c=e[a.margin[g]];break;case "value":c=a.value.margin[g]}Number.isNumber(c)&&(e=a.value.margin[b],!Number.isNumber(e)||c>e)&&(a.value.margin[b]=c);bbbfly.wrapper._addMargin(a,b)};bbbfly.wrapper._addMargin=function(a,b){var e=a.value.margin[b];if(Number.isNumber(e))switch(b){case "start":a.value.position.end+=e;break;case "end":a.value.position.start+=e}};
bbbfly.wrapper._overwriteMargin=function(a,b,e,d){e=e[a[d][b]];a.value.margin[b]=Number.isNumber(e)?e:null};
bbbfly.wrapper._positionCtrl=function(a,b,e,d){switch(d.Orientation){case bbbfly.Wrapper.orientation.vertical:d="T";var c="B";var g="H";break;case bbbfly.Wrapper.orientation.horizontal:d="L";c="R";g="W";break;default:return}b=b.value.position;var f={};switch(e){case "start":f[d]=b.start;f[c]=void 0;break;case "end":f[c]=b.end;f[d]=void 0;break;case "hide":f[d]=b.start;f[c]=void 0;f[g]=0;break;case "stretch":f[d]=b.start,f[c]=b.end,f[g]=void 0}a.SetBounds(f)&&a.Update();switch(e){case "start":case "end":a=
a.Bounds[g],Number.isNumber(a)&&(b[e]+=a)}};
bbbfly.wrapper._positionStretcher=function(a,b,e,d){var c=b.value.margin[e];c=Number.isNumber(c)&&0<c?1:0;switch(d.Orientation){case bbbfly.Wrapper.orientation.vertical:d={T:void 0,B:void 0,H:c,L:0,R:0,W:void 0};switch(e){case "start":d.T=b.value.position.start-c;break;case "end":d.B=b.value.position.end-c}a.SetBounds(d);break;case bbbfly.Wrapper.orientation.horizontal:d={L:void 0,R:void 0,W:c,T:0,B:0,H:void 0};switch(e){case "start":d.L=b.value.position.start-c;break;case "end":d.R=b.value.position.end-
c}a.SetBounds(d)}};bbbfly.wrapper._canPlaceStretchCtrls=function(a,b,e,d){if(!d.AutoSize&&0<b.length){b=a.GetControlsHolder().Elm();a=Infinity;if(b){ng_BeginMeasureElement(b);switch(d.Orientation){case bbbfly.Wrapper.orientation.vertical:a=ng_ClientHeight(b);break;case bbbfly.Wrapper.orientation.horizontal:a=ng_ClientWidth(b)}ng_EndMeasureElement(b)}e=e.value.position;return e.start<a&&e.end<a}return!1};
bbbfly.wrapper._autoSize=function(a,b,e){b=b.value.position.start+b.value.position.end;var d=a.GetControlsPanel();if(d&&d.Bounds)switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:Number.isNumber(d.Bounds.T)&&(b+=d.Bounds.T);Number.isNumber(d.Bounds.B)&&(b+=d.Bounds.B);break;case bbbfly.Wrapper.orientation.horizontal:Number.isNumber(d.Bounds.L)&&(b+=d.Bounds.L);Number.isNumber(d.Bounds.R)&&(b+=d.Bounds.R);break;default:return}d=!1;switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:a.SetBounds({H:b})&&
(d=!0,a.Update());break;case bbbfly.Wrapper.orientation.horizontal:a.SetBounds({W:b})&&(d=!0,a.Update())}d&&Function.isFunction(a.OnAutoSized)&&a.OnAutoSized()};
bbbfly.Wrapper=function(a,b,e){a=a||{};ng_MergeDef(a,{ScrollBars:ssNone,Data:{WrapperOptions:void 0,_Stretcher:null},Events:{OnUpdate:bbbfly.wrapper._onUpdate,OnUpdated:bbbfly.wrapper._onUpdated,OnAutoSized:null},Methods:{DoCreate:bbbfly.wrapper._doCreate,IsTrackedControlChanged:bbbfly.wrapper._isTrackedControlChanged}});return ngCreateControlAsType(a,"bbbfly.Frame",b,e)};bbbfly.Wrapper.orientation={vertical:1,horizontal:2};bbbfly.Wrapper.float={none:0,top:1,bottom:2,left:3,right:4,stretch:5};
ngUserControls=ngUserControls||[];ngUserControls.bbbfly_wrapper={OnInit:function(){ngRegisterControlType("bbbfly.Wrapper",bbbfly.Wrapper)}};
