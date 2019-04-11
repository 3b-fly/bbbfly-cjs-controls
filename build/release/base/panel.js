/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.panel={};bbbfly.panel._getControlsPanel=function(){return this.ControlsPanel?this.ControlsPanel:null};bbbfly.panel._getControlsHolder=function(){return this.ControlsPanel?this.ControlsPanel:this};
bbbfly.Panel=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Frame:void 0},Methods:{GetControlsPanel:bbbfly.panel._getControlsPanel,GetControlsHolder:bbbfly.panel._getControlsHolder}});return a.Data&&"undefined"!==typeof a.Data.Frame?ngCreateControlAsType(a,"ngGroup",b,c):ngCreateControlAsType(a,"ngPanel",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_panel={OnInit:function(){ngRegisterControlType("bbbfly.Panel",bbbfly.Panel)}};
