/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.wrapper={};bbbfly.wrapper._onCreated=function(a){a._Stretcher||(a._Stretcher=a.CreateChildControl({Type:"bbbfly.Panel"}))};bbbfly.wrapper._onUpdate=function(){var a=this.GetControlsHolder(),b=bbbfly.wrapper._getWrapperOptions(this);a.SetScrollBars(b.AutoSize?ssNone:ssAuto);return!0};
bbbfly.wrapper._onUpdated=function(){var a=this.GetControlsHolder(),b=a.Elm(),d=a.ChildControls;if(d){a=bbbfly.wrapper._getWrapperOptions(this);var e=null,c={value:{position:{start:0,end:0},margin:{start:null,end:null}}};switch(a.Orientation){case bbbfly.Wrapper.orientation.vertical:c.float={start:"top",end:"bottom",stretch:"stretch"};c.direction={start:"top",end:"bottom"};c.padding={start:"PaddingBottom",end:"PaddingTop"};c.margin={start:"MarginTop",end:"MarginBottom"};!this._handlingSizeChange&&
b&&(e=ng_ClientWidth(b));break;case bbbfly.Wrapper.orientation.horizontal:c.float={start:"left",end:"right",stretch:"stretch"};c.direction={start:"left",end:"right"};c.padding={start:"PaddingRight",end:"PaddingLeft"};c.margin={start:"MarginLeft",end:"MarginRight"};!this._handlingSizeChange&&b&&(e=ng_ClientHeight(b));break;default:return}bbbfly.wrapper._overwriteMargin(c,"start",a,"padding");bbbfly.wrapper._overwriteMargin(c,"end",a,"padding");var f=0,g=0,l=[];for(n in d){var h=d[n];if(!this._Stretcher||
h!==this._Stretcher)if(bbbfly.wrapper._trackChildControl(this,h),h.Visible){var k=bbbfly.wrapper._getWrapOptions(h,a);switch(k.Float){case bbbfly.Wrapper.float[c.float.start]:bbbfly.wrapper._setMargin(c,"end",k,"margin");bbbfly.wrapper._positionCtrl(h,c,"start",a);bbbfly.wrapper._overwriteMargin(c,"end",k,"margin");f++;break;case bbbfly.Wrapper.float[c.float.end]:bbbfly.wrapper._setMargin(c,"start",k,"margin");bbbfly.wrapper._positionCtrl(h,c,"end",a);bbbfly.wrapper._overwriteMargin(c,"start",k,"margin");
g++;break;case bbbfly.Wrapper.float[c.float.stretch]:l.push(h)}}}var n=bbbfly.wrapper._canPlaceStretchCtrls(this,l,c,a);if(0<l.length)for(var m in l)h=l[m],k=bbbfly.wrapper._getWrapOptions(h,a),n?(d=ng_CopyVar(c),bbbfly.wrapper._setMargin(d,"start",k,"margin"),bbbfly.wrapper._setMargin(d,"end",k,"margin"),bbbfly.wrapper._positionCtrl(h,d,"stretch",a)):bbbfly.wrapper._positionCtrl(h,c,"hide",a);this._Stretcher&&this._Stretcher.SetVisible(!1);a.AutoSize?(bbbfly.wrapper._setMargin(c,"end",a,"value"),
bbbfly.wrapper._autoSize(this,c,a)):!n&&this._Stretcher&&(1>g?(bbbfly.wrapper._setMargin(c,"end",a,"value"),bbbfly.wrapper._positionStretcher(this._Stretcher,c,"start",a),this._Stretcher.SetVisible(!0)):1>f&&(bbbfly.wrapper._setMargin(c,"start",a,"value"),bbbfly.wrapper._positionStretcher(this._Stretcher,c,"end",a),this._Stretcher.SetVisible(!0)));if(b&&!this._handlingSizeChange){m=null;switch(a.Orientation){case bbbfly.Wrapper.orientation.vertical:m=ng_ClientWidth(b);break;case bbbfly.Wrapper.orientation.horizontal:m=
ng_ClientHeight(b)}m!==e&&(this._handlingSizeChange=!0,this.Update(),this._handlingSizeChange=!1)}}};bbbfly.wrapper._getWrapperOptions=function(a){a=ng_CopyVar(a.WrapperOptions);if("object"!==typeof a||null===a)a={};ng_MergeDef(a,{Orientation:bbbfly.Wrapper.orientation.vertical,AutoSize:!1,PaddingTop:null,PaddingBottom:null,PaddingLeft:null,PaddingRight:null,TrackChanges:!1});return a};
bbbfly.wrapper._getWrapOptions=function(a,b){a=ng_CopyVar(a.WrapOptions);if("object"!==typeof a||null===a)a={};var d={Float:void 0,MarginTop:void 0,MarginBottom:void 0,MarginLeft:void 0,MarginRight:void 0,TrackChanges:b.TrackChanges};switch(b.Orientation){case bbbfly.Wrapper.orientation.vertical:d.Float=bbbfly.Wrapper.float.top;break;case bbbfly.Wrapper.orientation.horizontal:d.Float=bbbfly.Wrapper.float.left}ng_MergeDef(a,d);return a};
bbbfly.wrapper._trackChildControl=function(a,b){b&&"undefined"===typeof b._trackedBounds&&"undefined"===typeof b._trackedFloat&&Function.isFunction(b.AddEvent)&&(b.AddEvent("OnVisibleChanged",bbbfly.wrapper._onChildControlVisibleChanged,!0),b.AddEvent("OnUpdated",bbbfly.wrapper._onChildControlUpdated,!0),b._parentWrapper=a,b._trackedBounds=null,b._trackedFloat=null)};
bbbfly.wrapper._onChildControlVisibleChanged=function(){var a=bbbfly.wrapper._getWrapperOptions(this._parentWrapper);a=bbbfly.wrapper._getWrapOptions(this,a);a.TrackChanges&&a.Float&&this._parentWrapper.Update(!1)};
bbbfly.wrapper._onChildControlUpdated=function(){var a=bbbfly.wrapper._getWrapperOptions(this._parentWrapper),b=bbbfly.wrapper._getWrapOptions(this,a);if(b.TrackChanges){var d=this.Bounds?ng_CopyVar(this.Bounds):{},e=this._trackedBounds?this._trackedBounds:{};this._trackedBounds=d;var c=b.Float,f=this._trackedFloat;this._trackedFloat=c;if(c!==f)this._parentWrapper.Update(!1);else switch(a.Orientation){case bbbfly.Wrapper.orientation.vertical:if(d.H===e.H)break;b.Float!==bbbfly.Wrapper.float.top&&
b.Float!==bbbfly.Wrapper.float.bottom&&b.Float!==bbbfly.Wrapper.float.stretch||this._parentWrapper.Update(!1);break;case bbbfly.Wrapper.orientation.horizontal:d.W!==e.W&&(b.Float!==bbbfly.Wrapper.float.left&&b.Float!==bbbfly.Wrapper.float.right&&b.Float!==bbbfly.Wrapper.float.stretch||this._parentWrapper.Update(!1))}}};
bbbfly.wrapper._setMargin=function(a,b,d,e){var c=null,f=b;switch(b){case "start":f="end";break;case "end":f="start"}switch(e){case "margin":c=d[a.margin[f]];break;case "value":c=a.value.margin[f]}Number.isNumber(c)&&(d=a.value.margin[b],!Number.isNumber(d)||c>d)&&(a.value.margin[b]=c);bbbfly.wrapper._addMargin(a,b)};bbbfly.wrapper._addMargin=function(a,b){var d=a.value.margin[b];if(Number.isNumber(d))switch(b){case "start":a.value.position.end+=d;break;case "end":a.value.position.start+=d}};
bbbfly.wrapper._overwriteMargin=function(a,b,d,e){d=d[a[e][b]];a.value.margin[b]=Number.isNumber(d)?d:null};
bbbfly.wrapper._positionCtrl=function(a,b,d,e){switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:e="T";var c="B";var f="H";break;case bbbfly.Wrapper.orientation.horizontal:e="L";c="R";f="W";break;default:return}b=b.value.position;var g={};switch(d){case "start":g[e]=b.start;g[c]=void 0;break;case "end":g[c]=b.end;g[e]=void 0;break;case "hide":g[e]=b.start;g[c]=void 0;g[f]=0;break;case "stretch":g[e]=b.start,g[c]=b.end,g[f]=void 0}a.SetBounds(g)&&a.Update();switch(d){case "start":case "end":a=
a.Bounds[f],Number.isNumber(a)&&(b[d]+=a)}};
bbbfly.wrapper._positionStretcher=function(a,b,d,e){var c=b.value.margin[d];c=Number.isNumber(c)&&0<c?1:0;switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:e={T:void 0,B:void 0,H:c,L:0,R:0,W:void 0};switch(d){case "start":e.T=b.value.position.start-c;break;case "end":e.B=b.value.position.end-c}a.SetBounds(e);break;case bbbfly.Wrapper.orientation.horizontal:e={L:void 0,R:void 0,W:c,T:0,B:0,H:void 0};switch(d){case "start":e.L=b.value.position.start-c;break;case "end":e.R=b.value.position.end-
c}a.SetBounds(e)}};bbbfly.wrapper._canPlaceStretchCtrls=function(a,b,d,e){if(!e.AutoSize&&0<b.length){b=a.GetControlsHolder().Elm();a=Infinity;if(b){ng_BeginMeasureElement(b);switch(e.Orientation){case bbbfly.Wrapper.orientation.vertical:a=ng_ClientHeight(b);break;case bbbfly.Wrapper.orientation.horizontal:a=ng_ClientWidth(b)}ng_EndMeasureElement(b)}d=d.value.position;return d.start<a&&d.end<a}return!1};
bbbfly.wrapper._autoSize=function(a,b,d){b=b.value.position.start+b.value.position.end;var e=a.GetControlsPanel();if(e&&e.Bounds)switch(d.Orientation){case bbbfly.Wrapper.orientation.vertical:Number.isNumber(e.Bounds.T)&&(b+=e.Bounds.T);Number.isNumber(e.Bounds.B)&&(b+=e.Bounds.B);break;case bbbfly.Wrapper.orientation.horizontal:Number.isNumber(e.Bounds.L)&&(b+=e.Bounds.L);Number.isNumber(e.Bounds.R)&&(b+=e.Bounds.R);break;default:return}e=!1;switch(d.Orientation){case bbbfly.Wrapper.orientation.vertical:a.SetBounds({H:b})&&
(e=!0,a.Update());break;case bbbfly.Wrapper.orientation.horizontal:a.SetBounds({W:b})&&(e=!0,a.Update())}e&&Function.isFunction(a.OnAutoSized)&&a.OnAutoSized()};bbbfly.Wrapper=function(a,b,d){a=a||{};ng_MergeDef(a,{ScrollBars:ssNone,Data:{WrapperOptions:void 0,_Stretcher:null},OnCreated:bbbfly.wrapper._onCreated,Events:{OnUpdate:bbbfly.wrapper._onUpdate,OnUpdated:bbbfly.wrapper._onUpdated,OnAutoSized:null}});return ngCreateControlAsType(a,"bbbfly.Frame",b,d)};
bbbfly.Wrapper.orientation={vertical:1,horizontal:2};bbbfly.Wrapper.float={none:0,top:1,bottom:2,left:3,right:4,stretch:5};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_wrapper={OnInit:function(){ngRegisterControlType("bbbfly.Wrapper",bbbfly.Wrapper)}};
