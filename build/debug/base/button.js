/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.button = {};
bbbfly.button.NormalizeDef = function(def){
  def = def || {};

  ng_MergeDef(def,{
    Methods: {
      GetState: bbbfly.button._ngGetState,
      DoUpdate: bbbfly.button._ngDoUpdate
    }
  });
  return def;
};
bbbfly.button._ngDoUpdate = function(node){
  this.DoUpdate.callParent(node);

  var textNode = document.getElementById(this.ID+'_T');
  bbbfly.Renderer.UpdateHTMLState(textNode,this.GetState());
  return true;
};
bbbfly.button._ngGetState = function(){
  return {
    disabled: !this.Enabled,
    readonly: !!this.ReadOnly,
    invalid: !!this.Invalid,

    mouseover: !!(
      this.Enabled && !this.ReadOnly
      && ngMouseInControls[this.ID]
    )
  };
};
bbbfly.Button = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngButton',ref,parent);
};
bbbfly.CheckBox = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngCheckBox',ref,parent);
};
bbbfly.RadioButton = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngRadioButton',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_strl_button'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Button',bbbfly.Button);
    ngRegisterControlType('bbbfly.CheckBox',bbbfly.CheckBox);
    ngRegisterControlType('bbbfly.RadioButton',bbbfly.RadioButton);
  }
};
