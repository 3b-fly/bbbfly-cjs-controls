/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage button
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.button = {};

/** @ignore */
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

/** @ignore */
bbbfly.button._ngDoUpdate = function(node){
  this.DoUpdate.callParent(node);

  var textNode = document.getElementById(this.ID+'_T');
  bbbfly.Renderer.UpdateHTMLState(textNode,this.GetState());
  return true;
};

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends ngButton
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.Button = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngButton',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngCheckBox
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.CheckBox = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngCheckBox',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngRadioButton
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.RadioButton = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngRadioButton',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_strl_button'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Button',bbbfly.Button);
    ngRegisterControlType('bbbfly.CheckBox',bbbfly.CheckBox);
    ngRegisterControlType('bbbfly.RadioButton',bbbfly.RadioButton);
  }
};
