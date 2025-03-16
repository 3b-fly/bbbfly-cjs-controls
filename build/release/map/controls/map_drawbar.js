/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control=bbbfly.map.control||{};bbbfly.map.control.drawbar={control_type:"drawbar"};bbbfly.MapDrawBar=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ControlType:bbbfly.map.control.drawbar.control_type,FrameDef:{Type:"bbbfly.Panel",ParentReferences:!1},ButtonDef:{Type:"bbbfly.Button",Events:{}}},Controls:{},Events:{},Methods:{}});return ngCreateControlAsType(a,"bbbfly.MapControl",b,c)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_map_control_drawbar={OnInit:function(){ngRegisterControlType("bbbfly.MapDrawBar",bbbfly.MapDrawBar)}};
