/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.button={};bbbfly.button.NormalizeDef=function(a){a=a||{};ng_MergeDef(a,{Methods:{GetState:bbbfly.button._ngGetState,DoUpdate:bbbfly.button._ngDoUpdate}});return a};bbbfly.button._ngDoUpdate=function(a){this.DoUpdate.callParent(a);a=document.getElementById(this.ID+"_T");bbbfly.Renderer.UpdateHTMLState(a,this.GetState());return!0};
bbbfly.button._ngGetState=function(){return{disabled:!this.Enabled,readonly:!!this.ReadOnly,invalid:!!this.Invalid,mouseover:!(!this.Enabled||this.ReadOnly||!ngMouseInControls[this.ID])}};bbbfly.Button=function(a,b,c){a=bbbfly.button.NormalizeDef(a);bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngButton",b,c)};bbbfly.CheckBox=function(a,b,c){a=bbbfly.button.NormalizeDef(a);bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngCheckBox",b,c)};
bbbfly.RadioButton=function(a,b,c){a=bbbfly.button.NormalizeDef(a);bbbfly.hint&&bbbfly.hint.Hintify(a);return ngCreateControlAsType(a,"ngRadioButton",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_strl_button={OnInit:function(){ngRegisterControlType("bbbfly.Button",bbbfly.Button);ngRegisterControlType("bbbfly.CheckBox",bbbfly.CheckBox);ngRegisterControlType("bbbfly.RadioButton",bbbfly.RadioButton)}};
