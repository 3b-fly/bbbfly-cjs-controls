/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.panel={};
bbbfly.panel._doCreate=function(a,b,c){if(this.Frame){var d={FramePanel:{},ControlsPanel:{}};Object.isObject(a.FramePanel)&&(d.FramePanel=a.FramePanel);Object.isObject(a.ControlsPanel)&&(d.ControlsPanel=a.ControlsPanel);ng_MergeDef(d,{FramePanel:{L:0,T:0,R:0,B:0,Type:"ngPanel",id:this.ID+"_F",ScrollBars:ssNone,style:{zIndex:1},className:this.BaseClassName+"FramePanel",Data:{_FrameProxy:null}},ControlsPanel:{L:0,T:0,R:0,B:0,Type:"ngPanel",id:this.ID+"_P",ScrollBars:ssAuto,style:{zIndex:2},Controls:a.Controls,
ModifyControls:a.ModifyControls,className:this.BaseClassName+"ControlsPanel"}});a.ParentReferences||(this.Controls={},this.Controls.Owner=this,b=this.Controls);c=ngCreateControls(d,void 0,c);this.ControlsPanel=c.ControlsPanel;this.ControlsPanel.Owner=this;this.FramePanel=c.FramePanel;this.FramePanel.Owner=this;delete a.Controls;delete a.ModifyControls;delete c.ControlsPanel;delete c.FramePanel;ngCloneRefs(b,c)}};
bbbfly.panel._doUpdate=function(a){this.DoUpdateFrame(a);this.DoUpdateClassName(a);this.DoUpdateControlsPanel(a);return!0};
bbbfly.panel._doUpdateFrame=function(a){"undefined"===typeof a&&(a=this.Elm());var b=this.GetFramePanel();if(a&&b){ng_BeginMeasureElement(a);var c=ng_ClientWidth(a),d=ng_ClientHeight(a);ng_EndMeasureElement(a);b.SetBounds({T:0,L:0,W:c,H:d});if(a=b.Elm())c=this.GetFrame(),d=this.GetState(),b._FrameProxy=bbbfly.Renderer.FrameProxy(c,d,this.ID),a.innerHTML=bbbfly.Renderer.FrameHTML(b._FrameProxy,d)}};
bbbfly.panel._doUpdateImages=function(){var a=this.GetFramePanel();if(a&&(a=a._FrameProxy,Object.isObject(a))){var b=this.GetState();bbbfly.Renderer.UpdateFrameProxy(a,b);bbbfly.Renderer.UpdateFrameHTML(a,b)}};bbbfly.panel._doUpdateClassName=function(a){"undefined"===typeof a&&(a=this.Elm());a.className=this.GetClassName()};
bbbfly.panel._doUpdateControlsPanel=function(a){"undefined"===typeof a&&(a=this.Elm());var b=this.GetControlsPanel();if(a&&b){ng_BeginMeasureElement(a);var c=ng_ClientWidth(a),d=ng_ClientHeight(a);ng_EndMeasureElement(a);a=this.GetFrameDims();b.SetBounds({W:c-a.L-a.R,H:d-a.T-a.B,T:a.T,L:a.L,R:null,B:null})}};bbbfly.panel._doMouseEnter=function(){var a=this.GetFramePanel();if(a&&(a=a._FrameProxy,Object.isObject(a))){var b=this.GetState();bbbfly.Renderer.UpdateFrameHTML(a,b)}};
bbbfly.panel._doMouseLeave=function(){var a=this.GetFramePanel();if(a&&(a=a._FrameProxy,Object.isObject(a))){var b=this.GetState();bbbfly.Renderer.UpdateFrameHTML(a,b)}};bbbfly.panel._getState=function(){return{disabled:!this.Enabled,invalid:!!this.Invalid,mouseOver:!!this.MouseInControl}};bbbfly.panel._getFrame=function(){return Object.isObject(this.Frame)?this.Frame:{}};
bbbfly.panel._getFrameDims=function(){var a={L:0,T:0,R:0,B:0},b=this.GetFramePanel();b&&Object.isObject(b._FrameProxy)&&(a.L=b._FrameProxy.L.W,a.T=b._FrameProxy.T.H,a.R=b._FrameProxy.R.W,a.B=b._FrameProxy.B.H);return a};bbbfly.panel._getClassName=function(a){String.isString(a)?a=this.BaseClassName+a:(a=this.BaseClassName,this.Enabled?this.Invalid&&(a+=" "+a+"Invalid"):a+=" "+a+"Disabled");return a};bbbfly.panel._getFramePanel=function(){return this.FramePanel?this.FramePanel:null};
bbbfly.panel._getControlsPanel=function(){return this.ControlsPanel?this.ControlsPanel:null};bbbfly.panel._getControlsHolder=function(){return this.ControlsPanel?this.ControlsPanel:this};bbbfly.panel._doChangeState=function(a,b){b?a.Update():(a.DoUpdateImages(),a.DoUpdateClassName())};
bbbfly.panel._setInvalid=function(a,b){if(this.Invalid===a)return!0;if(Function.isFunction(this.OnSetInvalid)&&!this.OnSetInvalid(a))return!1;this.Invalid=!!a;bbbfly.panel._doChangeState(this,b);Function.isFunction(this.OnInvalidChanged)&&this.OnInvalidChanged();return!0};
bbbfly.panel._setReadOnly=function(a,b){if(a===this.ReadOnly)return!0;if(Function.isFunction(this.OnSetReadOnly)&&!this.OnSetReadOnly(a))return!1;this.ReadOnly=!!a;bbbfly.panel._doChangeState(this,b);Function.isFunction(this.OnReadOnlyChanged)&&this.OnReadOnlyChanged();return!0};
bbbfly.Panel=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Enabled:!0,Invalid:!1,ReadOnly:!1,Frame:!1},FramePanel:void 0,ControlsPanel:void 0,ParentReferences:!0,Events:{OnSetInvalid:null,OnInvalidChanged:null,OnSetReadOnly:null,OnReadOnlyChanged:null},Methods:{DoCreate:bbbfly.panel._doCreate,DoUpdate:bbbfly.panel._doUpdate,DoUpdateFrame:bbbfly.panel._doUpdateFrame,DoUpdateImages:bbbfly.panel._doUpdateImages,DoUpdateClassName:bbbfly.panel._doUpdateClassName,DoUpdateControlsPanel:bbbfly.panel._doUpdateControlsPanel,
DoMouseEnter:bbbfly.panel._doMouseEnter,DoMouseLeave:bbbfly.panel._doMouseLeave,GetState:bbbfly.panel._getState,GetFrame:bbbfly.panel._getFrame,GetFrameDims:bbbfly.panel._getFrameDims,GetClassName:bbbfly.panel._getClassName,GetFramePanel:bbbfly.panel._getFramePanel,GetControlsPanel:bbbfly.panel._getControlsPanel,GetControlsHolder:bbbfly.panel._getControlsHolder,SetInvalid:bbbfly.panel._setInvalid,SetReadOnly:bbbfly.panel._setReadOnly}});return ngCreateControlAsType(a,"ngPanel",b,c)};
ngUserControls=ngUserControls||[];ngUserControls.bbbfly_panel={OnInit:function(){ngRegisterControlType("bbbfly.Panel",bbbfly.Panel)}};
