/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.toolbar={};bbbfly.toolbar._setControlsPanelProps=function(){var a=this.GetControlsPanel();a&&ng_MergeVarReplace(a,{AutoSize:this.AutoSize,Vertical:this.Vertical,VPadding:this.VPadding,HPadding:this.HPadding,VAlign:this.VAlign,HAlign:this.HAlign,Wrapable:this.Wrapable},!0)};bbbfly.toolbar._doCreate=function(a,b,c){this.DoCreate.callParent(a,b,c);this.SetControlsPanelProps()};bbbfly.toolbar._update=function(a){this.SetControlsPanelProps();return this.Update.callParent(a)};
bbbfly.toolbar._onControlsPanelUpdated=function(){var a=this.Owner;if(a&&a.AutoSize){var b=a.GetFrameDims(),c={};a.Vertical?c.W=this.Bounds.W+b.L+b.R:c.H=this.Bounds.H+b.T+b.B;a.SetBounds(c);a.DoUpdateFrame()}};bbbfly.toolbar._callToolBarFunction=function(a,b){var c=this.GetControlsPanel();a=c?c[a]:null;if(Function.isFunction(a))return a.apply(c,b?b:[])};bbbfly.toolbar._ctrlBringToFront=function(a){return this.CallToolbarFunction("CtrlBringToFront",[a])};
bbbfly.toolbar._ctrlSendToBack=function(a){return this.CallToolbarFunction("CtrlSendToBack",[a])};bbbfly.toolbar._ctrlInsertAfter=function(a,b){return this.CallToolbarFunction("CtrlInsertAfter",[a,b])};bbbfly.toolbar._ctrlInsertBefore=function(a,b){return this.CallToolbarFunction("CtrlInsertBefore",[a,b])};
bbbfly.ToolBar=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{AutoSize:!1,Vertical:!1,VPadding:0,HPadding:0,VAlign:bbbfly.ToolBar.valign.top,HAlign:bbbfly.ToolBar.halign.left,Wrapable:!0},ControlsPanel:{Type:"ngToolBar",Events:{OnUpdated:bbbfly.toolbar._onControlsPanelUpdated}},Methods:{Update:bbbfly.toolbar._update,DoCreate:bbbfly.toolbar._doCreate,SetControlsPanelProps:bbbfly.toolbar._setControlsPanelProps,CallToolBarFunction:bbbfly.toolbar._callToolbarFunction,CtrlBringToFront:bbbfly.toolbar._ctrlBringToFront,
CtrlSendToBack:bbbfly.toolbar._ctrlSendToBack,CtrlInsertAfter:bbbfly.toolbar._ctrlInsertAfter,CtrlInsertBefore:bbbfly.toolbar._ctrlInsertBefore}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_layout={OnInit:function(){ngRegisterControlType("bbbfly.ToolBar",bbbfly.ToolBar)}};bbbfly.ToolBar.valign={top:"top",bottom:"bottom"};bbbfly.ToolBar.halign={left:"left",right:"right"};
