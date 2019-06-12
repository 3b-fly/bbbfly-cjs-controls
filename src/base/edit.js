/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage edit
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.edit = {};
/** @ignore */
bbbfly.memo = {};

/** @ignore */
bbbfly.edit._setInvalid = function(invalid,update){
  var changed = this.SetInvalid.callParent(invalid,update);

  if(changed && Function.isFunction(this.OnInvalidChanged)){
    this.OnInvalidChanged();
  }
  return changed;
};

/** @ignore */
bbbfly.edit._onReadOnlyChanged = function(edit,readOnly){
  var ddButton = this.DropDownButton;
  if(ddButton && (ddButton.Visible !== !readOnly)){
    ddButton.SetVisible(!readOnly);
  }
  this.Update();
};

/** @ignore */
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

/** @ignore */
bbbfly.edit._setFocusBefore = function(){
  this.SetFocus(true);
  this.SetCaretPos(0);
};

/** @ignore */
bbbfly.edit._setFocusAfter = function(){
  var text = this.GetText();
  this.SetFocus(true);
  this.SetCaretPos(String.isString(text) ? text.length : 0);
};

/** @ignore */
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

/** @ignore */
bbbfly.memo._validate = function(){
  var text = this.GetText();
  var valid = (this.Required && (String.trim(text).length < 1))
    ? false : this.ValidLength(text);

  this.SetInvalid(!valid);
  return valid;
};

bbbfly.memo._validLength = function(text){
  if(Number.isInteger(this.MaxLength) && String.isString(text)){
    return (text.length <= this.MaxLength);
  }
  return true;
};

/** @ignore */
bbbfly.memo._setRequired = function(required){
  if(required === this.Required){return;}

  this.Required = !!required;
  this.Validate();
};

/** @ignore */
bbbfly.memo._setMaxLength = function(maxLength){
  if(maxLength === this.MaxLength){return;}

  this.MaxLength = (Number.isInteger(maxLength) ? maxLength : null);
  this.Validate();
};

/** @ignore */
bbbfly.memo._onTextChanged = function(){
  this.Validate();
};

/** @ignore */
bbbfly.memo._onGetClassName = function(memo,part){
  var className = String.isString(part) ? part : '';

  if(memo.Enabled && memo.Invalid){className += 'Invalid';}
  return className;
};

/**
 * @class
 * @type control
 * @extends ngEdit
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is included.
 *
 * @inpackage edit
 *
 * @param {bbbfly.Edit.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 * @param {string} [parentType='ngMemo'] - Ancestor type
 */
bbbfly.Edit = function(def,ref,parent,parentType){
  def = def || {};

  ng_MergeDef(def,{
    Buttons: null,
    Events: {
      /** @private */
      OnReadOnlyChanged: bbbfly.edit._onReadOnlyChanged,
      /**
       * @event
       * @name OnInvalidChanged
       * @memberof bbbfly.Edit#
       */
      OnInvalidChanged: null
    },
    Methods: {
      /** @private */
      SetInvalid: bbbfly.edit._setInvalid,
      /**
       * @function
       * @name GetButton
       * @memberof bbbfly.Edit#
       *
       * @param {string} buttonId - Required button's ButtonId
       * @return {bbbfly.Edit.Button|null} - Button with passes ButtonId
       */
      GetButton: bbbfly.edit._getButton,

      /**
       * @function
       * @name SetFocusBefore
       * @memberof bbbfly.Edit#
       * @description
       *   Focus edit with caret at the text begining.
       *
       * @see {@link bbbfly.Edit#SetFocusAfter|SetFocusAfter()}
       */
      SetFocusBefore: bbbfly.edit._setFocusBefore,

      /**
       * @function
       * @name SetFocusAfter
       * @memberof bbbfly.Edit#
       * @description
       *   Focus edit with caret at the text end.
       *
       * @see {@link bbbfly.Edit#SetFocusBefore|SetFocusBefore()}
       */
      SetFocusAfter: bbbfly.edit._setFocusAfter
    }
  });

  bbbfly.edit._normalizeButtons(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}

  if(!parentType){parentType = 'ngEdit';}
  return ngCreateControlAsType(def,parentType,ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngMemo
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is included.
 *
 * @inpackage edit
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {boolean} [Required=false]
 * @property {integer|null} [MaxLength=null]
 */
bbbfly.Memo = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data:{
      Required: false,
      MaxLength: null
    },
    Events: {
      /** @private */
      OnTextChanged: bbbfly.memo._onTextChanged,
      /** @private */
      OnGetClassName: bbbfly.memo._onGetClassName,
      /**
       * @event
       * @name OnInvalidChanged
       * @memberof bbbfly.Memo#
       */
      OnInvalidChanged: null
    },
    Methods: {
      /** @private */
      SetInvalid: bbbfly.edit._setInvalid,
      /**
       * @function
       * @name Validate
       * @memberof bbbfly.Memo#
       *
       * @return {boolean} If is valid
       */
      Validate: bbbfly.memo._validate,
      /**
       * @function
       * @name ValidLength
       * @memberof bbbfly.Memo#
       *
       * @return {boolean} If length is valid
       */
      ValidLength: bbbfly.memo._validLength,
      /**
       * @function
       * @name SetRequired
       * @memberof bbbfly.Memo#
       *
       * @param {boolean} [required=false] - Value to set
       */
      SetRequired: bbbfly.memo._setRequired,
      /**
       * @function
       * @name SetMaxLength
       * @memberof bbbfly.Memo#
       *
       * @param {integer|null} [maxLength=null] - Value to set
       */
      SetMaxLength: bbbfly.memo._setMaxLength,
      /**
       * @function
       * @name SetFocusBefore
       * @memberof bbbfly.Memo#
       * @description
       *   Focus memo with caret at the text begining.
       *
       * @see {@link bbbfly.Memo#SetFocusAfter|SetFocusAfter()}
       */
      SetFocusBefore: bbbfly.edit._setFocusBefore,

      /**
       * @function
       * @name SetFocusAfter
       * @memberof bbbfly.Memo#
       * @description
       *   Focus memo with caret at the text end.
       *
       * @see {@link bbbfly.Memo#SetFocusBefore|SetFocusBefore()}
       */
      SetFocusAfter: bbbfly.edit._setFocusAfter
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}

  return ngCreateControlAsType(def,'ngMemo',ref,parent);
};

/** @ignore */
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

/**
 * @interface Definition
 * @memberOf bbbfly.Edit
 * @extends ngControl.Definition
 *
 * @description Edit control definition
 *
 * @property {array|object} [Buttons=null] - Define buttons as object to allow their merging
 */
