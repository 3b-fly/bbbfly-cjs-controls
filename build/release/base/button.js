/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.Button=function(a,b,c){a=a||{};bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngButton",b,c)};bbbfly.CheckBox=function(a,b,c){a=a||{};bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngCheckBox",b,c)};bbbfly.RadioButton=function(a,b,c){a=a||{};bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngRadioButton",b,c)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_strl_button={OnInit:function(){ngRegisterControlType("bbbfly.Button",bbbfly.Button);ngRegisterControlType("bbbfly.CheckBox",bbbfly.CheckBox);ngRegisterControlType("bbbfly.RadioButton",bbbfly.RadioButton)}};
