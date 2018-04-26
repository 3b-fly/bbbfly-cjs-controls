/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE_GPLv3_with_commercial_exception' file
 */
var bbbfly=bbbfly||{};bbbfly.toolbar={};bbbfly.toolbar._setControlsPanelProps=function(){this.ControlsPanel&&this.ControlsPanel.CtrlInheritsFrom("ngToolBar")&&ng_MergeVarReplace(this.ControlsPanel,{AutoSize:this.AutoSize,Vertical:this.Vertical,VPadding:this.VPadding,HPadding:this.HPadding,VAlign:this.VAlign,HAlign:this.HAlign,Wrapable:this.Wrapable},!0)};
bbbfly.toolbar._setControlsPanelClassName=function(){if(this.ControlsPanel){var a=this.BaseClassName+"ControlsPanel";this.Enabled?this.Invalid&&(a+="Invalid"):a+="Disabled";var b=this.ControlsPanel.Elm();this.ControlsPanel.BaseClassName=a;b&&(b.className=a)}};
bbbfly.toolbar._doCreate=function(a,b,c){var d={ControlsPanel:Object.isObject(a.ControlsPanel)?a.ControlsPanel:{}};ng_MergeDef(d,{ControlsPanel:{L:0,T:0,R:0,B:0,Type:"ngToolBar",id:this.ID+"_P",ScrollBars:ssAuto,Controls:a.Controls,ModifyControls:a.ModifyControls,Events:{OnUpdated:bbbfly.toolbar._onControlsPanelUpdated}},FramePanel:{Type:"ngPanel",id:this.ID+"_F",ScrollBars:ssDefault,style:{position:"absolute",zIndex:800}}});a.ParentReferences||(this.Controls={},this.Controls.Owner=this,b=this.Controls);
c=ngCreateControls(d,void 0,c);this.ControlsPanel=c.ControlsPanel;this.ControlsPanel.Owner=this;this.SetControlsPanelProps();this.SetControlsPanelClassName();delete a.Controls;delete a.ModifyControls;delete c.ControlsPanel;delete c.FramePanel;ngCloneRefs(b,c)};bbbfly.toolbar._doRelease=function(a){a.style.display="none";(a=document.getElementById(this.ID+"_F"))&&ng_SetInnerHTML(a,"")};bbbfly.toolbar._update=function(a){this.SetControlsPanelProps();return this.Update.callParent(a)};
bbbfly.toolbar._doUpdate=function(a){this.DoUpdateFrame(a);this.DoUpdateControlsPanel(a);return!0};bbbfly.toolbar._onControlsPanelUpdated=function(){var a=this.Owner;if(a&&a.AutoSize){var b={};a.Vertical?(b.W=this.Bounds.W,a._FrameDims&&(b.W+=a._FrameDims.L+a._FrameDims.R)):(b.H=this.Bounds.H,a._FrameDims&&(b.H+=a._FrameDims.T+a._FrameDims.B));a.SetBounds(b);a.DoUpdateFrame()}};
bbbfly.toolbar._doUpdateFrame=function(a){"undefined"===typeof a&&(a=this.Elm());var b=document.getElementById(this.ID+"_F");if(a&&b){var c=new ngStringBuilder;ng_BeginMeasureElement(a);var d=ng_ClientWidth(a),e=ng_ClientHeight(a);ng_EndMeasureElement(a);a={};ngc_ImgBox(c,this.ID,"bbbfly.ToolBar",0,this.Enabled,0,0,d,e,!1,this.Frame,"","",void 0,a);ng_SetInnerHTML(b,c.toString());this._FrameDims={T:a.Top.H,L:a.Left.W,R:a.Right.W,B:a.Bottom.H}}};
bbbfly.toolbar._doUpdateControlsPanel=function(a){"undefined"===typeof a&&(a=this.Elm());if(a&&this.ControlsPanel){var b=Object.isObject(this._FrameDims)?this._FrameDims:{T:0,L:0,R:0,B:0},c={T:b.T,L:b.L,R:null,B:null};ng_BeginMeasureElement(a);var d=ng_ClientWidth(a),e=ng_ClientHeight(a);ng_EndMeasureElement(a);c.W=d-b.L-b.R;c.H=e-b.T-b.B;this.ControlsPanel.SetBounds(c)}};bbbfly.toolbar._doUpdateImages=function(){ngc_ChangeBox(this.ID,0,this.Enabled,this.Frame)};
bbbfly.toolbar._setInvalid=function(a,b){a=!1!==a;b=!1!==b;if(this.Invalid===a)return!0;if(this.OnSetInvalid&&!this.OnSetInvalid(this,a,b))return!1;this.Invalid=a;this.DoSetInvalid&&this.DoSetInvalid(a,b);return!0};bbbfly.toolbar._doSetInvalid=function(a,b){this.SetControlsPanelClassName()};bbbfly.toolbar._onEnabledChanged=function(){this.SetControlsPanelClassName()};
bbbfly.toolbar._callControlsPanelFunction=function(a,b){a=this.ControlsPanel?this.ControlsPanel[a]:null;if("function"===typeof a)return a.apply(this.ControlsPanel,b?b:[])};bbbfly.toolbar._ctrlBringToFront=function(a){return this.CallControlsPanelFunction("CtrlBringToFront",[a])};bbbfly.toolbar._ctrlSendToBack=function(a){return this.CallControlsPanelFunction("CtrlSendToBack",[a])};bbbfly.toolbar._ctrlInsertAfter=function(a,b){return this.CallControlsPanelFunction("CtrlInsertAfter",[a,b])};
bbbfly.toolbar._ctrlInsertBefore=function(a,b){return this.CallControlsPanelFunction("CtrlInsertBefore",[a,b])};
bbbfly.ToolBar=function(a,b,c){a=a||{};ng_MergeDef(a,{ParentReferences:!0,Data:{AutoSize:!1,Vertical:!1,VPadding:0,HPadding:0,VAlign:bbbfly.ToolBar.valign.top,HAlign:bbbfly.ToolBar.halign.left,Wrapable:!0,Invalid:!1,Frame:{},_FrameDims:{}},ControlsPanel:null,Events:{OnEnabledChanged:bbbfly.toolbar._onEnabledChanged,OnSetInvalid:null},Methods:{Update:bbbfly.toolbar._update,DoUpdate:bbbfly.toolbar._doUpdate,DoCreate:bbbfly.toolbar._doCreate,DoRelease:bbbfly.toolbar._doRelease,DoUpdateFrame:bbbfly.toolbar._doUpdateFrame,
DoUpdateControlsPanel:bbbfly.toolbar._doUpdateControlsPanel,DoUpdateImages:bbbfly.toolbar._doUpdateImages,SetControlsPanelProps:bbbfly.toolbar._setControlsPanelProps,SetControlsPanelClassName:bbbfly.toolbar._setControlsPanelClassName,CallControlsPanelFunction:bbbfly.toolbar._callControlsPanelFunction,CtrlBringToFront:bbbfly.toolbar._ctrlBringToFront,CtrlSendToBack:bbbfly.toolbar._ctrlSendToBack,CtrlInsertAfter:bbbfly.toolbar._ctrlInsertAfter,CtrlInsertBefore:bbbfly.toolbar._ctrlInsertBefore,SetInvalid:bbbfly.toolbar._setInvalid,
DoSetInvalid:bbbfly.toolbar._doSetInvalid}});return ngCreateControlAsType(a,"ngPanel",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_layout={OnInit:function(){ngRegisterControlType("bbbfly.ToolBar",bbbfly.ToolBar)}};bbbfly.ToolBar.valign={top:"top",bottom:"bottom"};bbbfly.ToolBar.halign={left:"left",right:"right"};
