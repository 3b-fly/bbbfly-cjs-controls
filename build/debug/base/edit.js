/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.edit = {};
bbbfly.memo = {};
bbbfly.edit._onReadOnlyChanged = function(edit,readOnly){
  var ddButton = this.DropDownButton;
  if(ddButton && (ddButton.Visible !== !readOnly)){
    ddButton.SetVisible(!readOnly);
  }
  this.Update();
};
bbbfly.edit._getButton = function(buttonId){
  if(this.Buttons){
    for(var i in this.Buttons){
      if(this.Buttons[i].ButtonId === buttonId){
        return this.Buttons[i];
      }
    }
  }
  return null;
};
bbbfly.edit._setFocusBefore = function(){
  this.SetFocus(true);
  this.SetCaretPos(0);
};
bbbfly.edit._setFocusAfter = function(){
  var text = this.GetText();
  this.SetFocus(true);
  this.SetCaretPos(String.isString(text) ? text.length : 0);
};
bbbfly.edit._normalizeButtons = function(def){
  if(def.Buttons){
    if(Object.isObject(def.Buttons)){
      var buttons = new Array();
      for(var id in def.Buttons){
        var button = def.Buttons[id];
        ng_MergeDef(button,{
          Data: { ButtonId: id }
        });
        buttons.push(button);
      }
      def.Buttons = buttons;
    }
  }
  else{
    def.Buttons = new Array();
  }
};
bbbfly.memo._validate = function(){
  var text = String.trim(this.GetText());
  var valid = (!this.Required || (text.length > 0));

  if(valid && Number.isInteger(this.MaxLength)){
    valid = (text.length <= this.MaxLength);
  }
  this.SetInvalid(!valid);
  return valid;
};
bbbfly.memo._setRequired = function(required){
  if(required === this.Required){return;}

  this.Required = !!required;
  this.Validate();
};
bbbfly.memo._setMaxLength = function(maxLength){
  if(maxLength === this.MaxLength){return;}

  this.MaxLength = (Number.isInteger(maxLength) ? maxLength : null);
  this.Validate();
};
bbbfly.memo._onTextChanged = function(){
  this.Validate();
};
bbbfly.memo._onGetClassName = function(memo,part){
  var className = String.isString(part) ? part : '';

  if(memo.Enabled && memo.Invalid){className += 'Invalid';}
  return className;
};
bbbfly.Edit = function(def,ref,parent,parentType){
  def = def || {};
  ng_MergeDef(def,{
    Buttons: null,
    Events: {
      OnReadOnlyChanged: bbbfly.edit._onReadOnlyChanged
    },
    Methods: {
      GetButton: bbbfly.edit._getButton,
      SetFocusBefore: bbbfly.edit._setFocusBefore,
      SetFocusAfter: bbbfly.edit._setFocusAfter
    }
  });

  bbbfly.edit._normalizeButtons(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}

  if(!parentType){parentType = 'ngEdit';}
  return ngCreateControlAsType(def,parentType,ref,parent);
};
bbbfly.Memo = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data:{
      Required: false,
      MaxLength: null
    },
    Events: {
      OnTextChanged: bbbfly.memo._onTextChanged,
      OnGetClassName: bbbfly.memo._onGetClassName
    },
    Methods: {
      Validate: bbbfly.memo._validate,
      SetRequired: bbbfly.memo._setRequired,
      SetMaxLength: bbbfly.memo._setMaxLength,
      SetFocusBefore: bbbfly.edit._setFocusBefore,
      SetFocusAfter: bbbfly.edit._setFocusAfter
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}

  return ngCreateControlAsType(def,'ngMemo',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_edit'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Edit',bbbfly.Edit);
    ngRegisterControlType('bbbfly.Memo',bbbfly.Memo);
  }
};

/**
 * @interface Button
 * @memberOf bbbfly.Edit
 * @description
 *   Any {@link bbbfly.Edit|Edit} child button can implement this interface.
 *
 * @property {string} [ButtonId=null] - ID unique per edit
 */