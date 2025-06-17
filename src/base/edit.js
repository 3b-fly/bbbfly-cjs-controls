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
bbbfly.dropdbox = {};
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
  return Object.isObject(this.InputPanel) ? this.InputPanel : null;
};

/** @ignore */
bbbfly.editbox._getButtons = function(){
  return Object.isObject(this.Buttons) ? this.Buttons : {};
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
  else{
    iNode.focus();
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
  this.Focus();
  this.SetCaretPos(0);
};

/** @ignore */
bbbfly.editbox._focusEnd = function(){
  var text = this.GetText();

  this.Focus();
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

        bbbfly.DOM.AddEvent(input,'change',function(event){
          edit.DoInputChange(input,(event ? event : window.event));
        });

        cHolderNode.appendChild(input);
        this.UpdateInputValue();
      }
    }

    this.InputPanel = inputPanel;
  }

  if(Object.isObject(def.Buttons)){
    this.Buttons = {};

    for(var btnId in def.Buttons){
      var btnDef = def.Buttons[btnId];

      if(Object.isObject(btnDef)){
        if(Object.isObject(this.ButtonDef)){
          ng_MergeDef(btnDef,this.ButtonDef);
        }

        var btn = this.CreateControl(btnDef);

        if(Object.isObject(btn)){
          btn.Owner = this;
          this.Buttons[btnId] = btn;
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
bbbfly.editbox._doFocus = function(input,event){
  if(this.Selected){return;}

  if(
    Function.isFunction(this.OnFocus)
    && !this.OnFocus(input)
  ){return;}

  this.SetSelected(true,false);
  
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

      if(btn && Function.isFunction(btn.Click)){
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

      if(btn && Function.isFunction(btn.Click)){
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
bbbfly.editbox._doInputChange = function(input){
  if(!this._AltTextMode){
    if(String.isString(input.value) && input.value){
      this.SetText(input.value);
      return;
    }
  }
  this.SetText(null);
};

/** @ignore */
bbbfly.dropdbox._doDispose = function(){
  var ddCtrl = this.GetDropDown();
  if(ddCtrl){ddCtrl.Dispose();}

  var ddHolder = document.getElementById(this.ID+'_H');
  if(ddHolder){ddHolder.remove();}

  return true;
};

/** @ignore */
bbbfly.dropdbox._createControls = function(def,ref,node){
  this.CreateControls.callParent(def,ref,node);
  if(def.DropDown === null){return;}

  var appNode = ngApp.TopElm();
  if(!appNode){return;}

  var ddHolder = document.createElement('DIV');
  ddHolder.id = this.ID+'_H';

  ddHolder.style.zIndex = 100000;
  ddHolder.style.display = 'vsible';
  ddHolder.style.position = 'absolute';
  ddHolder.style.overflow = 'visible';
  ddHolder.style.top = '-1px';
  ddHolder.style.left = '-1px';
  ddHolder.style.width = '0px';
  ddHolder.style.height = '0px';

  appNode.appendChild(ddHolder);

  var refDef = {};

  if(Object.isObject(def.DropDown)){
    refDef.DropDown = ng_CopyVar(def.DropDown);
  }

  ng_MergeDef(refDef,{
    DropDown: {
      Type: 'bbbfly.Frame',
      id: this.ID + '_D',
      Data: {
        IsPopup: true,
        Visible: false
      }
    }
  });

  var refs = ngCreateControls(refDef,undefined,ddHolder);

  if(refs.DropDown){
    this.DropDown = refs.DropDown;
    this.DropDown.Owner = this;
  }
  else{
    ddHolder.remove();
  }
};

/** @ignore */
bbbfly.dropdbox._storeDropDownBounds = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return false;}

  this._OrigDropDownBounds = ng_CopyVar(ddCtrl.Bounds);
};

/** @ignore */
bbbfly.dropdbox._restoreDropDownBounds = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return false;}

  var oBounds = this._OrigDropDownBounds;

  if(Object.isObject(oBounds)){
    ddCtrl.Bounds = undefined;
    ddCtrl.SetBounds(oBounds);
  }
};

/** @ignore */
bbbfly.dropdbox._getDropDown = function(){
  return Object.isObject(this.DropDown) ? this.DropDown : null;
};

/** @ignore */
bbbfly.dropdbox._showDropDown = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return false;}

  if(!ddCtrl.Visible){
    this.StoreDropDownBounds(ddCtrl);
    this.UpdateDropDownPosition(ddCtrl);
    ddCtrl.SetVisible(true);
  }
  return true;
};

/** @ignore */
bbbfly.dropdbox._hideDropDown = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return false;}

  if(ddCtrl.Visible){
    ddCtrl.SetVisible(false);
    this.RestoreDropDownBounds(ddCtrl);
  }
  return true;
};

/** @ignore */
bbbfly.dropdbox._toggleDropDown = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return false;}

  return ddCtrl.Visible
    ? this.HideDropDown(ddCtrl)
    : this.ShowDropDown(ddCtrl);
};

/** @ignore */
bbbfly.dropdbox._updateDropDownPosition = function(ddCtrl){
  if(!Object.isObject(ddCtrl)){ddCtrl = this.GetDropDown();}
  if(!ddCtrl){return;}

  var editNode = this.Elm();
  var ddNode = ddCtrl.Elm();
  if(!editNode || !ddNode){return;}

  var hBounds = {
    L:-1,T:-1,
    W:0,H:0
  };

  var dBounds = {
    L:undefined,R:undefined,
    T:undefined,B:undefined,
    W:undefined,H:undefined
  };

  var oBounds = this._OrigDropDownBounds;
  if(Object.isObject(oBounds)){
    dBounds.W = oBounds.W;
    dBounds.H = oBounds.H;
  }

  if(this.Visible){
    ng_BeginMeasureElement(editNode);
    var editW = ng_OuterWidth(editNode);
    var editH = ng_OuterHeight(editNode);
    ng_EndMeasureElement(editNode);

    var parentNode = ddNode.parentNode;
    
    ng_BeginMeasureElement(parentNode);
    var parentW = ng_ClientWidthEx(parentNode);
    var parentH = ng_ClientHeightEx(parentNode);
    ng_EndMeasureElement(parentNode);

    var editPos = ng_ParentPosition(
      editNode,parentNode,true
    );

    var scrollX = ng_ScrollX(parentNode);
    var scrollY = ng_ScrollY(parentNode);

    var boundVals = {
      L: Math.round(scrollX+editPos.x),
      R: Math.round(scrollX+editPos.x+editW),
      T: Math.round(scrollY+editPos.y),
      B: Math.round(scrollY+editPos.y+editH),
      H: Math.round(editH),
      W: Math.round(editW)
    };

    switch(this.DropDownAlign){
      case bbbfly.DropDownBox.ddalign.left:
      case bbbfly.DropDownBox.ddalign.left_top:
      case bbbfly.DropDownBox.ddalign.left_bottom:
        hBounds.L = boundVals.L;
        dBounds.R = 0;
      break;
      case bbbfly.DropDownBox.ddalign.right:
      case bbbfly.DropDownBox.ddalign.right_top:
      case bbbfly.DropDownBox.ddalign.right_bottom:
        hBounds.L = boundVals.R;
        dBounds.L = 0;
      break;
      case bbbfly.DropDownBox.ddalign.top:
      case bbbfly.DropDownBox.ddalign.top_left:
      case bbbfly.DropDownBox.ddalign.top_right:
        hBounds.T = boundVals.T;
        dBounds.B = 0;
      break;
      case bbbfly.DropDownBox.ddalign.bottom:
      case bbbfly.DropDownBox.ddalign.bottom_left:
      case bbbfly.DropDownBox.ddalign.bottom_right:
        hBounds.T = boundVals.B;
        dBounds.T = 0;
      break;
    }

    switch(this.DropDownAlign){
      case bbbfly.DropDownBox.ddalign.left:
      case bbbfly.DropDownBox.ddalign.right:
        hBounds.T = boundVals.T;
        dBounds.T = 0;
        dBounds.H = boundVals.H;
      break;
      case bbbfly.DropDownBox.ddalign.left_top:
      case bbbfly.DropDownBox.ddalign.right_top:
        hBounds.T = boundVals.T;
        dBounds.T = 0;
      break;
      case bbbfly.DropDownBox.ddalign.left_bottom:
      case bbbfly.DropDownBox.ddalign.right_bottom:
        hBounds.T = boundVals.B;
        dBounds.B = 0;
      break;
      case bbbfly.DropDownBox.ddalign.top:
      case bbbfly.DropDownBox.ddalign.bottom:
        hBounds.L = boundVals.L;
        dBounds.L = 0;
        dBounds.W = boundVals.W;
      break;
      case bbbfly.DropDownBox.ddalign.top_left:
      case bbbfly.DropDownBox.ddalign.bottom_left:
        hBounds.L = boundVals.L;
        dBounds.L = 0;
      break;
      case bbbfly.DropDownBox.ddalign.top_right:
      case bbbfly.DropDownBox.ddalign.bottom_right:
        hBounds.L = boundVals.R;
        dBounds.R = 0;
      break;
    }
  }

  var ddHolder = document.getElementById(this.ID+'_H');
  if(ddHolder){ng_SetBounds(ddHolder,hBounds);}
  
  if(ddCtrl.SetBounds(dBounds)){
    ddCtrl.Update();
  }
};

/** @ignore */
bbbfly.dropdbox._onFocus = function(input){
  this.HideDropDown();
  return true;
};

/** @ignore */
bbbfly.dropdbox._onDropDownVisibleChanged = function(){
  if(Function.isFunction(this.Owner.OnDropDownChanged)){
    this.Owner.OnDropDownChanged(this);
  }
};

/** @ignore */
bbbfly.dropdbox._getDropDownClassName =function(suffix){
  var cn = '_DropDown';

  if(String.isString(suffix)){cn += suffix;}
  return this.Owner.GetClassName(cn);
};

/** @ignore */
bbbfly.dropdbox._isInsideDropDown = function(target,type){
  return (
    bbbfly.DOM.ElementContains(this.Elm(),target)
    || ((type !== 1) && bbbfly.DOM.ElementContains(this.Owner.Elm(),target))
  );
};

/** @ignore */
bbbfly.dropdbox._onDropDownChanged = function(ddCtrl){
  var btn = this.GetButton('DropDown');

  if(btn && Function.isFunction(btn.SetSelected)){
    btn.SetSelected(ddCtrl ? ddCtrl.Visible : false);
  }
};

/** @ignore */
bbbfly.dropdbox._onDropDownBtnClick = function(){
  var ddCtrl = this.Owner.GetDropDown();
  this.Owner.ToggleDropDown(ddCtrl);
};

/** @ignore */
bbbfly.dropdbox._onKeyUp = function(code,input){
  var ddCtrl = this.GetDropDown();
  if(!ddCtrl){return true;}

  switch(code){
    case 33: // PgUp
    case 38: // Up
    case 27: // Escape
      if(ddCtrl.Visible){
        this.HideDropDown(ddCtrl);
        return false;
      }
    break;
    case 34: // PgDown
    case 40: // Down
      if(!ddCtrl.Visible){
        this.ShowDropDown(ddCtrl);
        return false;
      }
    break;
  }
  return true;
};

/** @ignore */
bbbfly.dropdbox._onUpdated = function(){
  var ddCtrl = this.GetDropDown();
  if(!ddCtrl || !ddCtrl.Visible){return;}

  this.UpdateDropDownPosition(ddCtrl);
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
      _AltTextMode: false
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

/**
 * @class
 * @type control
 * @extends bbbfly.EditBox
 *
 * @description
 *   Basic DropDownBox Control.
 *
 * @inpackage edit
 *
 * @param {bbbfly.DropDownBox.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {bbbfly.DropDownBox.ddalign} [DropDownAlign=bottom]
 */
bbbfly.DropDownBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      DropDownAlign: bbbfly.DropDownBox.ddalign.bottom,

      /** @private */
      _OrigDropDownBounds: null
    },
    DropDown: {
      Events: {
        OnVisibleChanged: bbbfly.dropdbox._onDropDownVisibleChanged
      },
      Methods: {
        GetClassName: bbbfly.dropdbox._getDropDownClassName,
        IsInsidePopup: bbbfly.dropdbox._isInsideDropDown
      }
    },
    Buttons: {
      DropDown: {
        Events: {
          OnClick: bbbfly.dropdbox._onDropDownBtnClick
        }
      }
    },
    Events: {
      /** @private */
      OnFocus: bbbfly.dropdbox._onFocus,
      /** @private */
      OnKeyUp: bbbfly.dropdbox._onKeyUp,
      /** @private */
      OnUpdated: bbbfly.dropdbox._onUpdated,

      /**
       * @event
       * @name OnDropDownChanged
       * @memberof bbbfly.DropDownBox#
       *
       * @param {ngControl} ddCtrl - Drop down control
       *
       * @see {@link bbbfly.DropDownBox#ShowDropDown|ShowDropDown()}
       * @see {@link bbbfly.DropDownBox#HideDropDown|HideDropDown()}
       * @see {@link bbbfly.DropDownBox#ToggleDropDown|ToggleDropDown()}
       */
      OnDropDownChanged: bbbfly.dropdbox._onDropDownChanged
    },
    Methods: {
      /** @private */
      DoDispose: bbbfly.dropdbox._doDispose,
      /** @private */
      CreateControls: bbbfly.dropdbox._createControls,
      /** @private */
      StoreDropDownBounds: bbbfly.dropdbox._storeDropDownBounds,
      /** @private */
      RestoreDropDownBounds: bbbfly.dropdbox._restoreDropDownBounds,

      /**
       * @function
       * @name GetDropDown
       * @memberof bbbfly.DropDownBox#
       *
       * @return {object|null} Drop down panel control
       *
       * @see {@link bbbfly.DropDownBox#ShowDropDown|ShowDropDown()}
       * @see {@link bbbfly.DropDownBox#HideDropDown|HideDropDown()}
       * @see {@link bbbfly.DropDownBox#ToggleDropDown|ToggleDropDown()}
       * @see {@link bbbfly.DropDownBox#UpdateDropDownPosition|UpdateDropDownPosition()}
       * @see {@link bbbfly.DropDownBox#event:OnDropDownChanged|OnDropDownChanged}
       */
      GetDropDown: bbbfly.dropdbox._getDropDown,
      /**
       * @function
       * @name ShowDropDown
       * @memberof bbbfly.DropDownBox#
       *
       * @param {ngControl} [ddCtrl=undefined] - Drop down control
       * @return {boolean} If succesful
       *
       * @see {@link bbbfly.DropDownBox#GetDropDown|GetDropDown()}
       * @see {@link bbbfly.DropDownBox#HideDropDown|HideDropDown()}
       * @see {@link bbbfly.DropDownBox#ToggleDropDown|ToggleDropDown()}
       * @see {@link bbbfly.DropDownBox#event:OnDropDownChanged|OnDropDownChanged}
       */
      ShowDropDown: bbbfly.dropdbox._showDropDown,
      /**
       * @function
       * @name HideDropDown
       * @memberof bbbfly.DropDownBox#
       *
       * @param {ngControl} [ddCtrl=undefined] - Drop down control
       * @return {boolean} If succesful
       *
       * @see {@link bbbfly.DropDownBox#GetDropDown|GetDropDown()}
       * @see {@link bbbfly.DropDownBox#ShowDropDown|ShowDropDown()}
       * @see {@link bbbfly.DropDownBox#ToggleDropDown|ToggleDropDown()}
       * @see {@link bbbfly.DropDownBox#event:OnDropDownChanged|OnDropDownChanged}
       */
      HideDropDown: bbbfly.dropdbox._hideDropDown,
      /**
       * @function
       * @name ToggleDropDown
       * @memberof bbbfly.DropDownBox#
       *
       * @param {ngControl} [ddCtrl=undefined] - Drop down control
       * @return {boolean} If succesful
       *
       * @see {@link bbbfly.DropDownBox#GetDropDown|GetDropDown()}
       * @see {@link bbbfly.DropDownBox#ShowDropDown|ShowDropDown()}
       * @see {@link bbbfly.DropDownBox#HideDropDown|HideDropDown()}
       * @see {@link bbbfly.DropDownBox#event:OnDropDownChanged|OnDropDownChanged}
       */
      ToggleDropDown: bbbfly.dropdbox._toggleDropDown,

      /**
       * @function
       * @name UpdateDropDownPosition
       * @memberof bbbfly.DropDownBox#
       *
       * @param {ngControl} [ddCtrl=undefined] - Drop down control
       *
       * @see {@link bbbfly.DropDownBox#GetDropDown|GetDropDown()}
       */
      UpdateDropDownPosition: bbbfly.dropdbox._updateDropDownPosition
    }
  });

  return ngCreateControlAsType(def,'bbbfly.EditBox',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Line|bbbfly.DropDownBox.DropDownAlign}
 */
bbbfly.DropDownBox.ddalign = {
  left: 1,
  left_top: 2,
  left_bottom: 3,
  right: 4,
  right_top: 5,
  right_bottom: 6,
  top: 7,
  top_left: 8,
  top_right: 9,
  bottom: 10,
  bottom_left: 11,
  bottom_right: 12
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_edit'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Edit',bbbfly.Edit);
    ngRegisterControlType('bbbfly.Memo',bbbfly.Memo);
    
    ngRegisterControlType('bbbfly.EditBox',bbbfly.EditBox);
    ngRegisterControlType('bbbfly.DropDownBox',bbbfly.DropDownBox);
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

/**
 * @interface Definition
 * @memberOf bbbfly.DropDownBox
 * @extends bbbfly.EditBox.Definition
 *
 * @description DropDownBox control definition
 *
 * @property {ngControl.Definition} [DropDown=undefined] - Drop down control definition
 */
