/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");$jscomp.polyfill("Object.is",function(a){return a?a:function(a,c){return a===c?0!==a||1/a===1/c:a!==a&&c!==c}},"es6","es3");$jscomp.polyfill("Array.prototype.includes",function(a){return a?a:function(a,c){var b=this;b instanceof String&&(b=String(b));var e=b.length;for(c=c||0;c<e;c++)if(b[c]==a||Object.is(b[c],a))return!0;return!1}},"es7","es3");
$jscomp.checkStringArgs=function(a,b,c){if(null==a)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""};$jscomp.polyfill("String.prototype.includes",function(a){return a?a:function(a,c){return-1!==$jscomp.checkStringArgs(this,a,"includes").indexOf(a,c||0)}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.panelgroup={};
bbbfly.panel={};bbbfly.envelope={};bbbfly.frame={};bbbfly.line={};bbbfly.panelgroup._newGroupId=function(){return"bbbfly.PanelGroup_"+this._LastGroupId++};bbbfly.panelgroup._registerControl=function(a,b){var c=!1;if(Object.isObject(b))for(var d in b)if(b.hasOwnProperty(d)){var e=bbbfly.PanelGroup.state[d.toLowerCase()];this.RegisterGroup(a,e,b[d])&&(c=!0)}return c};
bbbfly.panelgroup._registerGroup=function(a,b,c){if(!(Object.isObject(a)&&String.isString(a.ID)&&Number.isInteger(b)&&String.isString(c)))return!1;switch(b){case bbbfly.PanelGroup.state.visible:Function.isFunction(a.AddEvent)&&a.AddEvent("OnVisibleChanged",bbbfly.panelgroup._onControlVisibleChanged);var d=a.Visible;break;case bbbfly.PanelGroup.state.selected:Function.isFunction(a.AddEvent)&&a.AddEvent("OnSelectedChanged",bbbfly.panelgroup._onControlSelectedChanged);d=a.Selected;break;default:return!1}var e=
this._Groups[c],f=this._ControlGroups[a.ID];Object.isObject(e)||(e={targets:[],on:null},this._Groups[c]=e);Object.isObject(f)||(f={},this._ControlGroups[a.ID]=f);e.targets.push({ctrl:a,state:b});f[b]=e;d&&bbbfly.PanelGroup.ApplyControlState(a,b,d);return!0};
bbbfly.panelgroup._unregisterControl=function(a){if(!Object.isObject(a)||!String.isString(a.ID))return!1;var b=this._ControlGroups[a.ID];delete this._ControlGroups[a.ID];for(var c in b){var d=b[c],e;for(e in d.targets)d.targets[e].ctrl===a&&delete d.targets[e],Object.isObject(d.on)&&d.on.ctrl===a&&(d.on=null)}Function.isFunction(a.RemoveEvent)&&(a.RemoveEvent("OnVisibleChanged",bbbfly.panelgroup._onControlVisibleChanged),a.RemoveEvent("OnSelectedChanged",bbbfly.panelgroup._onControlSelectedChanged));
return!0};
bbbfly.panelgroup._applyControlState=function(a,b,c){if(!Object.isObject(a)||!String.isString(a.ID))return!1;var d=this._ControlGroups[a.ID];if(!Object.isObject(d))return!1;d=d[b];if(!Object.isObject(d))return!1;if(c)for(var e in d.targets)if(c=d.targets[e],c.ctrl===a&&c.state===b)d.on=c;else{if(Object.isObject(c.ctrl))switch(c.state){case bbbfly.PanelGroup.state.visible:Function.isFunction(c.ctrl.SetVisible)&&c.ctrl.SetVisible(!1);break;case bbbfly.PanelGroup.state.selected:Function.isFunction(c.ctrl.SetSelected)&&c.ctrl.SetSelected(!1)}}else Object.isObject(d.on)&&
d.on.ctrl===a&&d.on.state===b&&(d.on=null);return!0};bbbfly.panelgroup._onControlVisibleChanged=function(){bbbfly.PanelGroup.ApplyControlState(this,bbbfly.PanelGroup.state.visible,this.Visible)};bbbfly.panelgroup._onControlSelectedChanged=function(){bbbfly.PanelGroup.ApplyControlState(this,bbbfly.PanelGroup.state.selected,this.Selected)};bbbfly.panel._doCreate=function(){this.Group&&bbbfly.PanelGroup.RegisterControl(this,this.Group)};bbbfly.panel._doDispose=function(){return bbbfly.PanelGroup.UnregisterControl(this)};
bbbfly.panel._doUpdate=function(a){this.DoUpdateHtmlClass(a);this.DoUpdateHtmlState(a);this.DoUpdateHtmlOverflow(a);return!0};bbbfly.panel._doMouseEnter=function(a,b){return this.DoUpdateHtmlState(b.Element)};bbbfly.panel._doMouseLeave=function(a,b){return this.DoUpdateHtmlState(b.Element)};bbbfly.panel._doUpdateHtmlClass=function(a){"undefined"===typeof a&&(a=this.Elm());a&&(a.className=this.GetClassName())};
bbbfly.panel._doUpdateHtmlState=function(a){"undefined"===typeof a&&(a=this.Elm());var b=this.GetState();a&&bbbfly.Renderer.UpdateHTMLState(a,b);return b};bbbfly.panel._doUpdateHtmlOverflow=function(a){"undefined"===typeof a&&(a=this.Elm());a&&bbbfly.Renderer.UpdateHTMLOverflow(a,this.OverflowX,this.OverflowY);return{OverflowX:this.OverflowX,OverflowY:this.OverflowY}};
bbbfly.panel._getState=function(){return{disabled:!this.Enabled,readonly:!!this.ReadOnly,invalid:!!this.Invalid,selected:!!this.Selected,mouseover:!(!this.Enabled||this.ReadOnly||!ngMouseInControls[this.ID])}};bbbfly.panel._getClassName=function(a){return String.isString(a)?this.BaseClassName+a:this.BaseClassName};bbbfly.panel._getControlsHolder=function(){return this};bbbfly.panel._doChangeState=function(a){a?this.Update():(a=this.Elm(),this.DoUpdateHtmlClass(a),this.DoUpdateHtmlState(a))};
bbbfly.panel._doChangeOverflow=function(a){a?this.Update():(a=this.Elm(),this.DoUpdateHtmlOverflow(a))};bbbfly.panel._setEnabled=function(a,b){Boolean.isBoolean(a)||(a=!0);if(this.Enabled===a)return!0;if(Function.isFunction(this.OnSetEnabled)&&!this.OnSetEnabled(a))return!1;this.SetChildControlsEnabled(a,this);this.Enabled=a;Boolean.isBoolean(b)||(b=!0);this.DoChangeState(b);Function.isFunction(this.OnEnabledChanged)&&this.OnEnabledChanged();return!0};
bbbfly.panel._setInvalid=function(a,b){Boolean.isBoolean(a)||(a=!0);if(this.Invalid===a)return!0;if(Function.isFunction(this.OnSetInvalid)&&!this.OnSetInvalid(a))return!1;this.Invalid=a;Boolean.isBoolean(b)||(b=!0);this.DoChangeState(b);Function.isFunction(this.OnInvalidChanged)&&this.OnInvalidChanged();return!0};
bbbfly.panel._setReadOnly=function(a,b){Boolean.isBoolean(a)||(a=!0);if(a===this.ReadOnly)return!0;if(Function.isFunction(this.OnSetReadOnly)&&!this.OnSetReadOnly(a))return!1;this.ReadOnly=a;Boolean.isBoolean(b)||(b=!0);this.DoChangeState(b);Function.isFunction(this.OnReadOnlyChanged)&&this.OnReadOnlyChanged();return!0};
bbbfly.panel._setSelected=function(a,b){Boolean.isBoolean(a)||(a=!0);if(a===this.Selected)return!0;if(Function.isFunction(this.OnSetSelected)&&!this.OnSetSelected(a))return!1;this.Selected=a;Boolean.isBoolean(b)||(b=!0);this.DoChangeState(b);Function.isFunction(this.OnSelectedChanged)&&this.OnSelectedChanged();return!0};
bbbfly.panel._setOverflow=function(a,b,c){var d=bbbfly.Renderer.overflow;Object.includes(d,a)||(a=d.hidden);Object.includes(d,b)||(b=d.hidden);if(a===this.OverflowX&&b===this.OverflowY)return!0;if(Function.isFunction(this.OnSetOverflow)&&!this.OnSetOverflow(a,b))return!1;this.OverflowX=a;this.OverflowY=b;Boolean.isBoolean(c)||(c=!0);this.DoChangeOverflow(c);Function.isFunction(this.OnOverflowChanged)&&this.OnOverflowChanged();return!0};
bbbfly.panel._addChildControl=function(a){this.AddChildControl.callParent(a);Function.isFunction(this.OnChildControlAdded)&&this.OnChildControlAdded(a)};bbbfly.panel._removeChildControl=function(a){this.RemoveChildControl.callParent(a);Function.isFunction(this.OnChildControlRemoved)&&this.OnChildControlRemoved(a)};
bbbfly.panel._createControl=function(a){if(!Object.isObject(a))return null;var b=this.GetControlsHolder(),c=ngCreateControl(a,void 0,b.ID);if(!Object.isObject(c))return null;a.parent=b.ID;a.id=c.ID;Function.isFunction(b.AddChildControl)&&b.AddChildControl(c);c.Create(a);return c};bbbfly.panel._disposeControls=function(){var a=this.GetControlsHolder(),b;for(b in a.ChildControls){var c=a.ChildControls[b];Function.isFunction(c.Dispose)&&c.Dispose()}};
bbbfly.envelope._trackControl=function(a,b){Object.isObject(a)&&(Boolean.isBoolean(b)||(b=!0),Array.isArray(a._trackers)||(a._trackers=[]),b?(a._trackers.push({ctrl:this,options:{}}),Function.isFunction(a.AddEvent)&&(a.AddEvent("OnVisibleChanged",bbbfly.envelope._onTrackedControlVisibleChanged,!0),a.AddEvent("OnUpdated",bbbfly.envelope._onTrackedControlUpdated,!0))):(b=Array.indexOf(a._trackers,this),0<=b&&a._trackers.splice(b,1),1>a._trackers.length&&(delete a._trackers,Function.isFunction(a.RemoveEvent)&&
(a.RemoveEvent("OnVisibleChanged",bbbfly.envelope._onTrackedControlVisibleChanged),a.RemoveEvent("OnUpdated",bbbfly.envelope._onTrackedControlUpdated)))))};
bbbfly.envelope._trackChildControls=function(a,b,c){a=this.GetControlsHolder();if(Function.isFunction(a.AddEvent)){var d=this;a.AddEvent("OnChildControlAdded",function(a){d.TrackControl(a,!0)});a.AddEvent("OnChildControlRemoved",function(a){d.TrackControl(a,!1)})}if(Array.isArray(a.ChildControls))for(var e in a.ChildControls)this.TrackControl(a.ChildControls[e],!0)};
bbbfly.envelope._isTrackedControlChanged=function(a,b){var c=a.Visible,d=b.Visible;a=a.Bounds?a.Bounds:{};var e=b.Bounds?b.Bounds:{};b.Visible=c;b.Bounds=ng_CopyVar(a);return c!==d||a.L!==e.L||a.R!==e.R||a.T!==e.T||a.B!==e.B?!0:!1};bbbfly.envelope._onTrackedControlChanged=function(){this.Update(!1)};bbbfly.envelope._onTrackedControlVisibleChanged=function(){if(Array.isArray(this._trackers)&&!this.Visible)for(var a in this._trackers)bbbfly.envelope._onTrackedControlChange(this,this._trackers[a])};
bbbfly.envelope._onTrackedControlUpdated=function(){if(Array.isArray(this._trackers))for(var a in this._trackers)bbbfly.envelope._onTrackedControlChange(this,this._trackers[a])};bbbfly.envelope._onTrackedControlChange=function(a,b){b&&Object.isObject(b.ctrl)&&Function.isFunction(b.ctrl.IsTrackedControlChanged)&&b.ctrl.IsTrackedControlChanged(a,b.options)&&Function.isFunction(b.ctrl.OnTrackedControlChanged)&&b.ctrl.OnTrackedControlChanged(a)};
bbbfly.frame._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);this.CreateControls(a,b,c)};bbbfly.frame._createControls=function(a,b,c){var d={};this.CreateControlsDef(a,d)&&(c=ngCreateControls(d,void 0,c),this.SetControlsRef(a,c)&&(a.ParentReferences||(this.Controls={},this.Controls.Owner=this,b=this.Controls),ngCloneRefs(b,c)))};
bbbfly.frame._createControlsDef=function(a,b){var c=!1;this.NeedsFramePanel()&&null!==a.FramePanel&&(Object.isObject(a.FramePanel)&&(b.FramePanel=ng_CopyVar(a.FramePanel)),ng_MergeDef(b,{FramePanel:{L:0,T:0,R:0,B:0,Type:"bbbfly.Panel",id:this.ID+"_F",style:{zIndex:100},className:"FramePanel",Data:{_FrameProxy:null,_FrameHtml:""}}}),c=!0);if(this.NeedsControlsPanel()&&null!==a.ControlsPanel){Object.isObject(a.ControlsPanel)&&(b.ControlsPanel=ng_CopyVar(a.ControlsPanel));var d=c=bbbfly.Renderer.overflow.hidden;
Object.isObject(a.Data)&&(a.Data.hasOwnProperty("OverflowX")&&(c=a.Data.OverflowX,delete a.Data.OverflowX),a.Data.hasOwnProperty("OverflowY")&&(d=a.Data.OverflowY,delete a.Data.OverflowY));ng_MergeDef(b,{ControlsPanel:{L:0,T:0,R:0,B:0,Type:"bbbfly.Panel",id:this.ID+"_P",style:{zIndex:200},Data:{OverflowX:c,OverflowY:d},Controls:a.Controls,ModifyControls:a.ModifyControls,className:"ControlsPanel"}});delete a.Controls;delete a.ModifyControls;c=!0}return c};
bbbfly.frame._setControlsRef=function(a,b){a=!1;b.FramePanel&&(this.FramePanel=b.FramePanel,this.FramePanel.Owner=this,delete b.FramePanel,a=!0);b.ControlsPanel&&(this.ControlsPanel=b.ControlsPanel,this.ControlsPanel.Owner=this,delete b.ControlsPanel,a=!0);return a};bbbfly.frame._doUpdate=function(a){this.DoUpdateFrame(a);this.DoUpdateControlsPanel(a);return this.DoUpdate.callParent(a)};
bbbfly.frame._doMouseEnter=function(a,b){a=this.DoMouseEnter.callParent(a,b);if(b=this.GetFramePanel())b=b._FrameProxy,Object.isObject(b)&&bbbfly.Renderer.UpdateFrameHTML(b,a);return a};bbbfly.frame._doMouseLeave=function(a,b){a=this.DoMouseLeave.callParent(a,b);if(b=this.GetFramePanel())b=b._FrameProxy,Object.isObject(b)&&bbbfly.Renderer.UpdateFrameHTML(b,a);return a};bbbfly.frame._doChangeState=function(a){this.DoChangeState.callParent(a);a||this.DoUpdateImages()};
bbbfly.frame._doUpdateFrame=function(){var a=this.GetFramePanel();if(a){var b=a.Elm();if(b){var c=this.GetFrame(),d=this.GetState(),e=d.mouseover;d.mouseover=!1;c=bbbfly.Renderer.FrameProxy(c,d,this.ID);var f=bbbfly.Renderer.FrameHTML(c,d);d.mouseover=e;a._FrameProxy=c;f!==a._FrameHtml&&(a._FrameHtml=f,b.innerHTML=f,e&&bbbfly.Renderer.UpdateFrameHTML(c,d))}}};
bbbfly.frame._doUpdateImages=function(){var a=this.GetFramePanel();if(a&&(a=a._FrameProxy,Object.isObject(a))){var b=this.GetState();bbbfly.Renderer.UpdateFrameProxy(a,b);bbbfly.Renderer.UpdateFrameHTML(a,b)}};bbbfly.frame._doUpdateControlsPanel=function(){var a=this.GetControlsPanel();if(a){var b=this.GetFrameDims();a.SetBounds({L:b.L,T:b.T,R:b.R,B:b.B,W:null,H:null})}};bbbfly.frame._needsFramePanel=function(){return!!this.Frame};bbbfly.frame._needsControlsPanel=function(){return!!this.Frame};
bbbfly.frame._getFrame=function(){return Object.isObject(this.Frame)?this.Frame:{}};
bbbfly.frame._getFrameDims=function(){var a={L:0,T:0,R:0,B:0,W:void 0,H:void 0},b=this.GetFramePanel();if(Object.isObject(b)){var c=b.Bounds;b=b._FrameProxy;Object.isObject(c)&&(Number.isInteger(c.L)&&(a.L+=c.L),Number.isInteger(c.T)&&(a.T+=c.T),Number.isInteger(c.R)&&(a.R+=c.R),Number.isInteger(c.B)&&(a.B+=c.B));Object.isObject(b)&&(Number.isInteger(b.L.W)&&(a.L+=b.L.W),Number.isInteger(b.T.H)&&(a.T+=b.T.H),Number.isInteger(b.R.W)&&(a.R+=b.R.W),Number.isInteger(b.B.H)&&(a.B+=b.B.H),Number.isInteger(b.C.W)&&
(a.W=b.C.W),Number.isInteger(b.C.H)&&(a.H=b.C.H))}return a};bbbfly.frame._getFramePanel=function(){return this.FramePanel?this.FramePanel:null};bbbfly.frame._getControlsPanel=function(){return this.ControlsPanel?this.ControlsPanel:null};bbbfly.frame._getControlsHolder=function(){var a=this.GetControlsPanel();return a?a:this.GetControlsHolder.callParent()};
bbbfly.line._setBounds=function(a){Object.isObject(a)||(a={});var b=this.GetFrameDims();switch(this.Orientation){case bbbfly.Line.orientation.horizontal:a.H=b.T+b.B;Number.isInteger(b.H)&&(a.H+=b.H);break;case bbbfly.Line.orientation.vertical:a.W=b.L+b.R,Number.isInteger(b.W)&&(a.W+=b.W)}return this.SetBounds.callParent(a)};
bbbfly.PanelGroup={_Groups:{},_ControlGroups:{},_LastGroupId:0,NewGroupId:bbbfly.panelgroup._newGroupId,RegisterControl:bbbfly.panelgroup._registerControl,RegisterGroup:bbbfly.panelgroup._registerGroup,UnregisterControl:bbbfly.panelgroup._unregisterControl,ApplyControlState:bbbfly.panelgroup._applyControlState};bbbfly.PanelGroup.state={visible:1,selected:2};
bbbfly.Panel=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Enabled:!0,Invalid:!1,ReadOnly:!1,Selected:!1,OverflowX:bbbfly.Renderer.overflow.hidden,OverflowY:bbbfly.Renderer.overflow.hidden,Group:null},ParentReferences:!0,Events:{OnSetEnabled:null,OnEnabledChanged:null,OnSetInvalid:null,OnInvalidChanged:null,OnSetReadOnly:null,OnReadOnlyChanged:null,OnSetSelected:null,OnSelectedChanged:null,OnSetOverflow:null,OnOverflowChanged:null,OnChildControlAdded:null,OnChildControlRemoved:null},Methods:{DoCreate:bbbfly.panel._doCreate,
DoDispose:bbbfly.panel._doDispose,DoUpdate:bbbfly.panel._doUpdate,DoMouseEnter:bbbfly.panel._doMouseEnter,DoMouseLeave:bbbfly.panel._doMouseLeave,DoChangeState:bbbfly.panel._doChangeState,DoChangeOverflow:bbbfly.panel._doChangeOverflow,DoUpdateHtmlClass:bbbfly.panel._doUpdateHtmlClass,DoUpdateHtmlState:bbbfly.panel._doUpdateHtmlState,DoUpdateHtmlOverflow:bbbfly.panel._doUpdateHtmlOverflow,GetState:bbbfly.panel._getState,GetClassName:bbbfly.panel._getClassName,GetControlsHolder:bbbfly.panel._getControlsHolder,
SetEnabled:bbbfly.panel._setEnabled,SetInvalid:bbbfly.panel._setInvalid,SetReadOnly:bbbfly.panel._setReadOnly,SetSelected:bbbfly.panel._setSelected,SetOverflow:bbbfly.panel._setOverflow,AddChildControl:bbbfly.panel._addChildControl,RemoveChildControl:bbbfly.panel._removeChildControl,CreateControl:bbbfly.panel._createControl,DisposeControls:bbbfly.panel._disposeControls}});return ngCreateControlAsType(a,"ngPanel",b,c)};
bbbfly.Envelope=function(a,b,c){a=a||{};ng_MergeDef(a,{Events:{OnTrackedControlChanged:bbbfly.envelope._onTrackedControlChanged},Methods:{TrackControl:bbbfly.envelope._trackControl,TrackChildControls:bbbfly.envelope._trackChildControls,IsTrackedControlChanged:bbbfly.envelope._isTrackedControlChanged}});return ngCreateControlAsType(a,"bbbfly.Panel",b,c)};
bbbfly.Frame=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Frame:!1},FramePanel:void 0,ControlsPanel:void 0,Methods:{DoCreate:bbbfly.frame._doCreate,CreateControls:bbbfly.frame._createControls,CreateControlsDef:bbbfly.frame._createControlsDef,SetControlsRef:bbbfly.frame._setControlsRef,DoUpdate:bbbfly.frame._doUpdate,DoMouseEnter:bbbfly.frame._doMouseEnter,DoMouseLeave:bbbfly.frame._doMouseLeave,DoChangeState:bbbfly.frame._doChangeState,DoUpdateFrame:bbbfly.frame._doUpdateFrame,DoUpdateImages:bbbfly.frame._doUpdateImages,
DoUpdateControlsPanel:bbbfly.frame._doUpdateControlsPanel,NeedsFramePanel:bbbfly.frame._needsFramePanel,NeedsControlsPanel:bbbfly.frame._needsControlsPanel,GetFrame:bbbfly.frame._getFrame,GetFrameDims:bbbfly.frame._getFrameDims,GetFramePanel:bbbfly.frame._getFramePanel,GetControlsPanel:bbbfly.frame._getControlsPanel,GetControlsHolder:bbbfly.frame._getControlsHolder}});return ngCreateControlAsType(a,"bbbfly.Envelope",b,c)};
bbbfly.Line=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Orientation:bbbfly.Line.orientation.horizontal},Methods:{SetBounds:bbbfly.line._setBounds}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};bbbfly.Line.orientation={vertical:1,horizontal:2};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_panel={OnInit:function(){ngRegisterControlType("bbbfly.Panel",bbbfly.Panel);ngRegisterControlType("bbbfly.Envelope",bbbfly.Envelope);ngRegisterControlType("bbbfly.Frame",bbbfly.Frame);ngRegisterControlType("bbbfly.Line",bbbfly.Line)}};
