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
bbbfly.editbox._setText = function(text,update,forceChange){
  if(!String.isString(text) && (text !== null)){return false;}

  if(
    Function.isFunction(this.OnSetText)
    && !this.OnSetText(text,update)
  ){return false;}

  if(text === ''){text = null;}
  var changed = ((this.Text !== text) || forceChange);
  
  this.Text = text;
  if(!changed){return true;}

  if(Function.isFunction(this.OnTextChanged)){
    this.OnTextChanged();
  }

  if(!Boolean.isBoolean(update) || update){
    this.Update();
  }

  return true;
};

/** @ignore */
bbbfly.editbox._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  return null;
};

/** @ignore */
bbbfly.editbox._setAltText = function(text,update,forceChange){
  if(!String.isString(text) && (text !== null)){return false;}

  if(
    Function.isFunction(this.OnSetAltText)
    && !this.OnSetAltText(text,update)
  ){return false;}

  if(text === ''){text = null;}
  var changed = ((this.AltText !== text) || forceChange);

  this.AltText = text;
  if(!changed){return true;}

  if(Function.isFunction(this.OnAltTextChanged)){
    this.OnAltTextChanged();
  }

  if(!Boolean.isBoolean(update) || update){
    this.Update();
  }
};

/** @ignore */
bbbfly.editbox._getAltText = function(){
  if(String.isString(this.AltTextRes)){
    return ngTxt(this.AltTextRes);
  }
  else if(String.isString(this.AltText)){
    return this.AltText;
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
bbbfly.editbox._setCaretPos = function(pos){
  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  if(Function.isFunction(iNode.setSelectionRange)){
    iNode.focus();
    iNode.setSelectionRange(pos,pos);
  }
  else if(Function.isFunction(iNode.createTextRange)){
    var range = iNode.createTextRange();
    range.collapse(true);
    range.moveEnd('character',pos);
    range.moveStart('character',pos);
    range.select();
  }
};

/** @ignore */
bbbfly.editbox._getCaretPos = function(){
  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return 0;}

  if(Number.isInteger(iNode.selectionStart)){
    return iNode.selectionStart;
  }
  else if(document.selection){
    iNode.focus();

    var selection = document.selection.createRange();
    selection.moveStart('character',-iNode.value.length);
    return selection.text.length;
  }

  return 0;
};

/** @ignore */
bbbfly.editbox._focus = function(){
  if(this.Selected){return;}

  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  iNode.focus();
};

/** @ignore */
bbbfly.editbox._blur = function(){
  if(!this.Selected){return;}

  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  iNode.blur();
};

/** @ignore */
bbbfly.editbox._focusStart = function(){
  this.Focus(true);
  this.SetCaretPos(0);
};

/** @ignore */
bbbfly.editbox._focusEnd = function(){
  var text = this.GetText();

  this.Focus(true);
  this.SetCaretPos(String.isString(text) ? text.length : 0);
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

        input.spellcheck = false;
    
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

        var edit = this;

        bbbfly.DOM.AddEvent(input,'focus',function(event){
          edit.DoFocus(input,(event ? event : window.event));
        });
        bbbfly.DOM.AddEvent(input,'blur',function(event){
          edit.DoBlur(input,(event ? event : window.event));
        });

        bbbfly.DOM.AddEvent(input,'keydown',function(event){
          edit.DoKeyDown(input,(event ? event : window.event));
        });
        bbbfly.DOM.AddEvent(input,'keyup',function(event){
          edit.DoKeyUp(input,(event ? event : window.event));
        });

        bbbfly.DOM.AddEvent(input,'mousedown',function(event){
          edit.DoMouseDown(input,(event ? event : window.event));
        });

        bbbfly.DOM.AddEvent(input,'change',function(event){
          edit.DoInputChange(input,(event ? event : window.event));
        });

        cHolderNode.appendChild(input);
        this.UpdateInputValue();
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
  if(!this.DoUpdate.callParent(node)){return false;}

  this.DoUpdateInput(node);
  return true;
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
      iNode.type = this._AltTextMode ? 'text' : 'password';
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

  if(Number.isInteger(this.MaxLength) && !this._AltTextMode){
    iNode.setAttribute('maxlength',this.MaxLength);
  }
  else{
    iNode.removeAttribute('maxlength');
  }

  var auto = String.isString(this.AutoComplete) ? this.AutoComplete : 'off';
  iNode.autocomplete = auto;

  if(this.Enabled && !this.ReadOnly){
    iNode.style.cursor = 'text';
    iNode.removeAttribute('readonly');
  }
  else{
    iNode.style.cursor = 'default';
    iNode.setAttribute('readonly','readonly');
  }

  if(this._AltTextMode){
    iNode.setAttribute('alttext','1');
  }
  else{
    iNode.removeAttribute('alttext');
  }
};

/** @ignore */
bbbfly.editbox._updateInputValue = function(){
  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  var text = this.GetText();
  var altText = this.GetAltText();
  
  if(String.isString(text) && text){
    this._AltTextMode = false;
    iNode.value = text;
  }
  else{
    text = String.isString(altText) ? altText : '';
    this._AltTextMode = true;
    iNode.value = text;

    this.SetCaretPos(0);
  }
};

/** @ignore */
bbbfly.editbox._onTextChanged = function(){
  this.UpdateInputValue();
};

/** @ignore */
bbbfly.editbox._onAltTextChanged = function(){
  this.UpdateInputValue();
};

/** @ignore */
bbbfly.editbox._doFocus = function(input){
  if(this.Selected){return;}

  if(
    Function.isFunction(this.OnFocus)
    && !this.OnFocus(input)
  ){return;}

  this.SetSelected(true,false);

  if(this._AltTextMode){
    this.SetCaretPos(0);
  }
  
  if(
    this.SelectText && !this._AltTextMode
    && this.Enabled && !this.ReadOnly
  ){
    if(Function.isFunction(input.select)){
      input.select();
    }
    else if(Function.isFunction(input.setSelectionRange)){
      input.setSelectionRange(0,99999);
    }
  }
};

/** @ignore */
bbbfly.editbox._doBlur = function(input){
  if(!this.Selected){return;}

  if(
    Function.isFunction(this.OnBlur)
    && !this.OnBlur(input)
  ){return;}

  this.SetSelected(false,false);
};

/** @ignore */
bbbfly.editbox._doKeyDown = function(input,event){
  if(!this.Enabled || this.ReadOnly){return;}

  var target = event.target || event.srcElement || event.originalTarget;
  if(!target || (target !== input)){return;}

  if(
    Function.isFunction(this.OnKeyDown)
    && !this.OnKeyDown(event.keyCode,input)
  ){return;}

  if(this._AltTextMode){
    switch(event.keyCode){
      case 35: // End
      case 36: // Home
      case 37: // Left
      case 39: // Right
      case 38: // Up
      case 40: // Down
      case 33: // PgUp
      case 34: // PgDown
      case 8:  // Backspace
      case 46: // Delete
        if(event.preventDefault){event.preventDefault();}
        event.returnValue = false;
      break;
    }
  }
};

/** @ignore */
bbbfly.editbox._doKeyUp = function(input,event){
  if(!this.Enabled || this.ReadOnly){return;}

  var target = event.target || event.srcElement || event.originalTarget;
  if(!target || (target !== input)){return;}

  if(
    Function.isFunction(this.OnKeyUp)
    && !this.OnKeyUp(event.keyCode,input)
  ){return;}

  switch(event.keyCode){
    case 13: // Enter
      var btn = String.isString(this.SubmitButton)
        ? this.GetButton(this.SubmitButton)
        : null;

      if(
        Object.isObject(btn)
        && Function.isFunction(btn.Click)
      ){
        var timer = setTimeout(function(){
          clearTimeout(timer);
          btn.Click(event);
        },10);

        this.Blur();
        if(event.stopPropagation){event.stopPropagation();}
        else{event.cancelBubble = true;}
      }
    break;
    case 27: // Escape
      var btn = String.isString(this.CancelButton)
        ? this.GetButton(this.CancelButton)
        : null;

      if(
        Object.isObject(btn)
        && Function.isFunction(btn.Click)
      ){
        var timer = setTimeout(function(){
          clearTimeout(timer);
          btn.Click(event);
        },10);

        this.Blur();
        if(event.stopPropagation){event.stopPropagation();}
        else{event.cancelBubble = true;}
      }
    break;
    default:
      var text = input.value;

      if(this._AltTextMode){
        var altText = this.GetAltText();
        if(!String.isString(altText)){altText = '';}

        if(text === altText){return;}

        if(altText){
          var pos = this.GetCaretPos();

          var trail = text.substring(pos);
          var trailLng = trail.length;

          var altLng = altText.length;
          var rootLng = (altLng - trailLng);
          
          if(trailLng && (altText.substring(rootLng) === trail)){
            altText = altText.substring(0,rootLng);
            text = text.substring(0,pos);
          }

          altLng = altText.length;

          if(altLng && (text.substring(0,altLng) === altText)){
            text = text.substring(altLng);
          }
        }
      }

      this.SetText(text);
    break;
  }
};

/** @ignore */
bbbfly.editbox._doMouseDown = function(input,event){
  if(this._AltTextMode){
    if(event.preventDefault){event.preventDefault();}
    event.returnValue = false;

    if(
      this.Enabled && !this.ReadOnly
      && (input !== document.activeElement)
    ){this.SetCaretPos(0);}
  }
};

/** @ignore */
bbbfly.editbox._doInputChange = function(input){
  if(!this._AltTextMode){
    if(String.isString(input.value) && input.value){
      this.SetText(input.value);
      return;
    }
  }
  this.SetText(null);
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
 * @property {string} [Text=null] - Text string
 * @property {bbbfly.EditBox.textalign} [TextAlign=left] - Text horizontal align
 *
 * @property {string} [AltText=null] - Alternative text string
 * @property {string} [AltTextRes=null] - Alternative text resource ID
 *
 * @property {bbbfly.EditBox.inputtype} [InputType=text]
 * @property {string|null} [AutoComplete=null]
 * @property {integer|null} [MaxLength=null] - Max number of characters
 *
 * @property {boolean} [SelectText=false] - If select text on focus
 * @property {string} [SubmitButton=null] - Submit button ID
 * @property {string} [CancelButton=null] - Cancel button ID
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

      Text: null,
      TextAlign: bbbfly.EditBox.textalign.left,

      AltText: null,
      AltTextRes: null,

      InputType: bbbfly.EditBox.inputtype.text,
      AutoComplete: null,
      MaxLength: null,

      SelectText: false,
      SubmitButton: null,
      CancelButton: null,

      /** @private */
      _AltTextMode: false,

      /** @private */
      _InputPanel: {},
      /** @private */
      _Buttons: {}
    },
    InputPanel: undefined,
    Buttons: undefined,
    Events: {
      /**
       * @event
       * @name OnSetText
       * @memberof bbbfly.EditBox#
       *
       * @param {boolean} text - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#event:OnTextChanged|OnTextChanged}
       */
      OnSetText: null,
      /**
       * @event
       * @name OnTextChanged
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#event:OnSetText|OnSetText}
       */
      OnTextChanged: bbbfly.editbox._onTextChanged,

      /**
       * @event
       * @name OnSetAltText
       * @memberof bbbfly.EditBox#
       *
       * @param {boolean} text - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.EditBox#SetAltText|SetAltText()}
       * @see {@link bbbfly.EditBox#event:OnAltTextChanged|OnAltTextChanged}
       */
      OnSetAltText: null,
      /**
       * @event
       * @name OnAltTextChanged
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#SetAltText|SetAltText()}
       * @see {@link bbbfly.EditBox#event:OnSetAltText|OnSetAltText}
       */
      OnAltTextChanged: bbbfly.editbox._onAltTextChanged,

      /**
       * @event
       * @name OnFocus
       * @memberof bbbfly.EditBox#
       *
       * @param {HTMLInputElement} input - Input element
       * @return {boolean} Return false to deny any hanges
       *
       * @see {@link bbbfly.EditBox#event:OnBlur|OnBlur}
       */
      OnFocus: null,

      /**
       * @event
       * @name OnBlur
       * @memberof bbbfly.EditBox#
       *
       * @param {HTMLInputElement} input - Input element
       * @return {boolean} Return false to deny any changes
       *
       * @see {@link bbbfly.EditBox#event:OnFocus|OnFocus}
       */
      OnBlur: null,

      /**
       * @event
       * @name OnKeyDown
       * @memberof bbbfly.EditBox#
       *
       * @param {integer} code - Pressed key code
       * @param {HTMLInputElement} input - Input element
       * @return {boolean} Return false to deny any hanges
       *
       * @see {@link bbbfly.EditBox#event:OnKeyUp|OnKeyUp}
       */
      OnKeyDown: null,

      /**
       * @event
       * @name OnKeyUp
       * @memberof bbbfly.EditBox#
       *
       * @param {integer} code - Pressed key code
       * @param {HTMLInputElement} input - Input element
       * @return {boolean} Return false to deny any changes
       *
       * @see {@link bbbfly.EditBox#event:OnKeyDown|OnKeyDown}
       */
      OnKeyUp: null
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.editbox._doCreate,
      /** @private */
      DoUpdate: bbbfly.editbox._doUpdate,
      /** @private */
      DoUpdateInput: bbbfly.editbox._doUpdateInput,
      /** @private */
      UpdateInputValue: bbbfly.editbox._updateInputValue,
      /** @private */
      DoFocus: bbbfly.editbox._doFocus,
      /** @private */
      DoBlur: bbbfly.editbox._doBlur,
      /** @private */
      DoKeyDown: bbbfly.editbox._doKeyDown,
      /** @private */
      DoKeyUp: bbbfly.editbox._doKeyUp,
      /** @private */
      DoMouseDown: bbbfly.editbox._doMouseDown,
      /** @private */
      DoInputChange: bbbfly.editbox._doInputChange,

      /**
       * @function
       * @name SetText
       * @memberof bbbfly.EditBox#
       *
       * @param {string|null} text - Value to set
       * @param {boolean} [update=true] - If update control
       * @param {boolean} [forceChange=false] - Force to act like value has changed
       * 
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.EditBox#GetText|GetText()}
       * @see {@link bbbfly.EditBox#event:OnSetText|OnSetText}
       * @see {@link bbbfly.EditBox#event:OnTextChanged|OnTextChanged}
       */
      SetText: bbbfly.editbox._setText,
      /**
       * @function
       * @name GetText
       * @memberof bbbfly.EditBox#
       *
       * @return {string|null}
       *
       * @see {@link bbbfly.EditBox#SetText|SetText()}
       * @see {@link bbbfly.EditBox#event:OnSetText|OnSetText}
       * @see {@link bbbfly.EditBox#event:OnTextChanged|OnTextChanged}
       */
      GetText: bbbfly.editbox._getText,

      /**
       * @function
       * @name SetAltText
       * @memberof bbbfly.EditBox#
       *
       * @param {string|null} text - Value to set
       * @param {boolean} [update=true] - If update control
       * @param {boolean} [forceChange=false] - Force to act like value has changed
       *
       * @see {@link bbbfly.EditBox#GetAltText|GetAltText()}
       * @see {@link bbbfly.EditBox#event:OnSetAltText|OnSetAltText}
       * @see {@link bbbfly.EditBox#event:OnAltTextChanged|OnAltTextChanged}
       */
      SetAltText: bbbfly.editbox._setAltText,
      /**
       * @function
       * @name GetAltText
       * @memberof bbbfly.EditBox#
       *
       * @return {string|null}
       *
       * @see {@link bbbfly.EditBox#SetAltText|SetAltText()}
       * @see {@link bbbfly.EditBox#event:OnSetAltText|OnSetAltText}
       * @see {@link bbbfly.EditBox#event:OnAltTextChanged|OnAltTextChanged}
       */
      GetAltText: bbbfly.editbox._getAltText,

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
       * @return {bbbfly.Button|null} Button with passes id
       *
       * @see {@link bbbfly.EditBox#GetInputPanel|GetInputPanel()}
       * @see {@link bbbfly.EditBox#GetButtons|GetButtons()}
       */
      GetButton: bbbfly.editbox._getButton,

      /**
       * @function
       * @name SetCaretPos
       * @memberof bbbfly.EditBox#
       *
       * @param {integer} pos - Caret position
       *
       * @see {@link bbbfly.EditBox#GetCaretPos|GetCaretPos()}
       */
      SetCaretPos: bbbfly.editbox._setCaretPos,
      /**
       * @function
       * @name GetCaretPos
       * @memberof bbbfly.EditBox#
       *
       * @return {integer} Caret position
       *
       * @see {@link bbbfly.EditBox#SetCaretPos|SetCaretPos()}
       */
      GetCaretPos: bbbfly.editbox._getCaretPos,

      /**
       * @function
       * @name Focus
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#FocusStart|FocusStart()}
       * @see {@link bbbfly.EditBox#FocusEnd|FocusEnd()}
       * @see {@link bbbfly.EditBox#Blur|Blur()}
       */
      Focus: bbbfly.editbox._focus,
      /**
       * @function
       * @name Blur
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#Focus|Focus()}
       * @see {@link bbbfly.EditBox#FocusStart|FocusStart()}
       * @see {@link bbbfly.EditBox#FocusEnd|FocusEnd()}
       */
      Blur: bbbfly.editbox._blur,
      /**
       * @function
       * @name FocusStart
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#Focus|Focus()}
       * @see {@link bbbfly.EditBox#FocusEnd|FocusEnd()}
       * @see {@link bbbfly.EditBox#Blur|Blur()}
       */
      FocusStart: bbbfly.editbox._focusStart,
      /**
       * @function
       * @name FocusEnd
       * @memberof bbbfly.EditBox#
       *
       * @see {@link bbbfly.EditBox#Focus|Focus()}
       * @see {@link bbbfly.EditBox#FocusStart|FocusStart()}
       * @see {@link bbbfly.EditBox#Blur|Blur()}
       */
      FocusEnd: bbbfly.editbox._focusEnd
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
