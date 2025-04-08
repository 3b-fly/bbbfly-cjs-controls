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
bbbfly.editbox = {};
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
 * @param {string} [parentType='ngEdit'] - Ancestor type
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
 * @param {bbbfly.Memo.Definition} [def=undefined] - Descendant definition
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

/**
 * @interface Definition
 * @memberOf bbbfly.Memo
 * @extends ngControl.Definition
 *
 * @description Memo control definition
 */

/** @ignore */
bbbfly.editbox._setAlt = function(alt,update){
  if(!String.isString(alt) && (alt !== null)){return;}

  if(alt !== this.Alt){
    this.Alt = alt;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.editbox._setText = function(text,update){
  if(!String.isString(text) && (text !== null)){return;}

  if(text !== this.Text){
    this.Text = text;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.editbox._getAlt = function(){
  if(String.isString(this.AltRes)){
    return ngTxt(this.AltRes);
  }
  else if(String.isString(this.Alt)){
    return this.Alt;
  }
  return null;
};

/** @ignore */
bbbfly.editbox._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  return null;
};

/** @ignore */
bbbfly.editbox._getInputPanel = function(){
  return Object.isObject(this._InputPanel) ? this._InputPanel : null;
};

/** @ignore */
bbbfly.editbox._getButtons = function(){
  return Object.isObject(this._Buttons) ? this._Buttons : {};
};

/** @ignore */
bbbfly.editbox._getButton = function(buttonId){
  var btns = this.GetButtons();
  var btn = btns[buttonId];

  return Object.isObject(btn) ? btn : null;
};


/** @ignore */
bbbfly.editbox._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);

  if(def.InputPanel !== null){
    var inputDef = Object.isObject(def.InputPanel)
      ? def.InputPanel : {};
    
    ng_MergeDef(inputDef,{
      Type: 'bbbfly.Frame',
      id: this.ID + '_I',
      className: 'InputPanel',
      Data: {
        WrapOptions: {
          Float: bbbfly.Wrapper.float.stretch
        }
      }
    });

    var inputPanel = this.CreateControl(inputDef);

    if(Object.isObject(inputPanel)){
      var cHolder = inputPanel.GetControlsHolder();
      var cHolderNode = cHolder.Elm();

      if(cHolderNode){
        var input = document.createElement('INPUT');
        input.id = this.ID+'_II';
        input.className = 'Input';
    
        input.style.zIndex = 1;
        input.style.display = 'block';
        input.style.position = 'absolute';

        input.style.top = '0px';
        input.style.right = '0px';
        input.style.bottom = '0px';
        input.style.left = '0px';
        input.style.padding = '0px';
        input.style.margin = '0px';
        input.style.whiteSpace = 'nowrap';

        cHolderNode.appendChild(input);
      }
    }

    this._InputPanel = inputPanel;
   }
  
  if(Object.isObject(def.Buttons)){
    for(var btnId in def.Buttons){
      var btnDef = def.Buttons[btnId];

      if(Object.isObject(btnDef)){
        if(Object.isObject(this.ButtonDef)){
          ng_MergeDef(btnDef,this.ButtonDef);
        }

        var btn = this.CreateControl(btnDef);

        if(Object.isObject(btn)){
          this._Buttons[btnId] = btn;
        }
      }
    }
  }
};

/** @ignore */
bbbfly.editbox._doUpdate = function(node){
  this.DoUpdateInput(node);
  return this.DoUpdate.callParent(node);
};

/** @ignore */
bbbfly.editbox._doUpdateInput = function(){
  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  switch(this.TextAlign){
    case bbbfly.EditBox.textalign.center:
      iNode.style.textAlign = 'center';
    break;
    case bbbfly.EditBox.textalign.right:
      iNode.style.textAlign = 'right';
    break;
    default:
      iNode.style.textAlign = 'left';
    break;
  }

  switch(this.InputType){
    case bbbfly.EditBox.inputtype.password:
      iNode.type = 'password';
      iNode.inputMode = 'text';
    break;
    case bbbfly.EditBox.inputtype.decimal:
      iNode.type = 'text';
      iNode.inputMode = 'decimal';
    break;
    case bbbfly.EditBox.inputtype.email:
      iNode.type = 'text';
      iNode.inputMode = 'email';
    break;
    case bbbfly.EditBox.inputtype.numeric:
      iNode.type = 'text';
      iNode.inputMode = 'numeric';
    break;
    case bbbfly.EditBox.inputtype.search:
      iNode.type = 'text';
      iNode.inputMode = 'search';
    break;
    case bbbfly.EditBox.inputtype.phone:
      iNode.type = 'text';
      iNode.inputMode = 'tel';
    break;
    case bbbfly.EditBox.inputtype.url:
      iNode.type = 'text';
      iNode.inputMode = 'url';
    break;
    default:
      iNode.type = 'text';
      iNode.inputMode = 'text';
    break;
  }

  var auto = String.isString(this.AutoComplete) ? this.AutoComplete : 'off';
  iNode.autocomplete = auto;

  var maxLength = Number.isInteger(this.MaxLength) ? this.MaxLength : -1;
  iNode.setAttribute('maxlength',maxLength);

  var state = this.GetState();

  if(state.disabled || state.readonly){
    iNode.style.cursor = 'default';
    iNode.setAttribute('readonly','readonly');
  }
  else{
    iNode.style.cursor = 'text';
    iNode.removeAttribute('readonly');
  }
};

/**
 * @class
 * @type control
 * @extends bbbfly.Wrapper
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Basic EditBox Control.
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage edit
 *
 * @param {bbbfly.EditBox.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {object} WrapperOptions
 * @property {bbbfly.Wrapper.orientation} WrapperOptions.Orientation=horizontal
 * @property {boolean} WrapperOptions.TrackChanges=true
 *
 * @property {bbbfly.Button.Definition} ButtonDef - Definition shared by all buttons
 *
 * @property {string} [Alt=null] - Alt string
 * @property {string} [AltRes=null] - Alt  resource ID
 * @property {string} [Text=null] - Text string
 * @property {bbbfly.EditBox.textalign} [TextAlign=left]
 *
 * @property {bbbfly.EditBox.inputtype} [InputType=text]
 * @property {string|null} [AutoComplete=null]
 * @property {integer|null} [MaxLength=null]
 */
bbbfly.EditBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      WrapperOptions: {
        Orientation: bbbfly.Wrapper.orientation.horizontal,
        TrackChanges: true
      },

      ButtonDef: {
        Type: 'bbbfly.Button',
        Data: {
          AutoSize: bbbfly.Button.autosize.both
        }
      },

      Alt: null,
      AltRes: null,

      Text: null,
      TextAlign: bbbfly.EditBox.textalign.left,

      InputType: bbbfly.EditBox.inputtype.text,
      AutoComplete: null,
      MaxLength: null,

      /** @private */
      _InputPanel: {},
      /** @private */
      _Buttons: {}
    },
    InputPanel: undefined,
    Buttons: undefined,
    Events: {
      //TODO
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.editbox._doCreate,
      /** @private */
      DoUpdate: bbbfly.editbox._doUpdate,
      /** @private */
      DoUpdateInput: bbbfly.editbox._doUpdateInput,

      /**
       * @function
       * @name SetAlt
       * @memberof bbbfly.EditBox#
       *
       * @param {string|null} alt
       * @param {boolean} [update=true]
       *
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#GetAlt|GetAlt()}
       * @see {@link bbbfly.EditBox#GetText|GetText()}
       */
      SetAlt: bbbfly.editbox._setAlt,
      /**
       * @function
       * @name SetText
       * @memberof bbbfly.EditBox#
       *
       * @param {string|null} text
       * @param {boolean} [update=true]
       *
       * @see {@link bbbfly.EditBox#SetAlt|SetAlt()}
       * @see {@link bbbfly.EditBox#GetAlt|GetAlt()}
       * @see {@link bbbfly.EditBox#GetText|GetText()}
       */
      SetText: bbbfly.editbox._setText,

      /**
       * @function
       * @name GetAlt
       * @memberof bbbfly.EditBox#
       *
       * @return {string|null}
       *
       * @see {@link bbbfly.EditBox#SetAlt|SetAlt()}
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#GetText|GetText()}
       */
      GetAlt: bbbfly.editbox._getAlt,
      /**
       * @function
       * @name GetText
       * @memberof bbbfly.EditBox#
       *
       * @return {string|null}
       *
       * @see {@link bbbfly.EditBox#SetAlt|SetAlt()}
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#GetAlt|GetAlt()}
       */
      GetText: bbbfly.editbox._getText,

      /**
       * @function
       * @name GetInputPanel
       * @memberof bbbfly.EditBox#
       *
       * @return {object|null} Input panel control
       *
       * @see {@link bbbfly.EditBox#GetButtons|GetButtons()}
       * @see {@link bbbfly.EditBox#GetButton|GetButton()}
       */
      GetInputPanel: bbbfly.editbox._getInputPanel,
      /**
       * @function
       * @name GetButtons
       * @memberof bbbfly.EditBox#
       *
       * @return {object}
       *
       * @see {@link bbbfly.EditBox#GetInputPanel|GetInputPanel()}
       * @see {@link bbbfly.EditBox#GetButton|GetButton()}
       */
      GetButtons: bbbfly.editbox._getButtons,
      /**
       * @function
       * @name GetButton
       * @memberof bbbfly.EditBox#
       *
       * @param {string} buttonId - Required button's id
       * @return {bbbfly.Button|null} - Button with passes id
       *
       * @see {@link bbbfly.EditBox#GetInputPanel|GetInputPanel()}
       * @see {@link bbbfly.EditBox#GetButtons|GetButtons()}
       */
      GetButton: bbbfly.editbox._getButton,
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Wrapper',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.EditBox|bbbfly.EditBox.InputType}
 */
bbbfly.EditBox.inputtype = {
  password: 0,
  text: 1,
  decimal: 2,
  email: 3,
  numeric: 4,
  search: 5,
  phone: 6,
  url: 7
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.EditBox|bbbfly.EditBox.TextAlign}
 */
bbbfly.EditBox.textalign = {
  left: 1,
  center: 2,
  right: 3
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_edit'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Edit',bbbfly.Edit);
    ngRegisterControlType('bbbfly.EditBox',bbbfly.EditBox);
    ngRegisterControlType('bbbfly.Memo',bbbfly.Memo);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.EditBox
 * @extends bbbfly.Wrapper.Definition
 *
 * @description EditBox control definition
 *
 * @property {ngControl.Definition} [InputPanel=undefined] - Input panel control definition
 * @property {object} [Buttons=undefined] - Define editbox buttons
 */
