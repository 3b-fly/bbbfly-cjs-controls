/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.edit = {};
bbbfly.editbox = {};
bbbfly.memo = {};
bbbfly.edit._setInvalid = function(invalid,update){
  var changed = this.SetInvalid.callParent(invalid,update);

  if(changed && Function.isFunction(this.OnInvalidChanged)){
    this.OnInvalidChanged();
  }
  return changed;
};
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
      OnReadOnlyChanged: bbbfly.edit._onReadOnlyChanged,
      OnInvalidChanged: null
    },
    Methods: {
      SetInvalid: bbbfly.edit._setInvalid,
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
      OnGetClassName: bbbfly.memo._onGetClassName,
      OnInvalidChanged: null
    },
    Methods: {
      SetInvalid: bbbfly.edit._setInvalid,
      Validate: bbbfly.memo._validate,
      ValidLength: bbbfly.memo._validLength,
      SetRequired: bbbfly.memo._setRequired,
      SetMaxLength: bbbfly.memo._setMaxLength,
      SetFocusBefore: bbbfly.edit._setFocusBefore,
      SetFocusAfter: bbbfly.edit._setFocusAfter
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}

  return ngCreateControlAsType(def,'ngMemo',ref,parent);
};
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
bbbfly.editbox._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  return null;
};
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
bbbfly.editbox._getAltText = function(){
  if(String.isString(this.AltTextRes)){
    return ngTxt(this.AltTextRes);
  }
  else if(String.isString(this.AltText)){
    return this.AltText;
  }
  return null;
};
bbbfly.editbox._getInputPanel = function(){
  return Object.isObject(this._InputPanel) ? this._InputPanel : null;
};
bbbfly.editbox._getButtons = function(){
  return Object.isObject(this._Buttons) ? this._Buttons : {};
};
bbbfly.editbox._getButton = function(buttonId){
  var btns = this.GetButtons();
  var btn = btns[buttonId];

  return Object.isObject(btn) ? btn : null;
};
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
bbbfly.editbox._focus = function(){
  if(this.Selected){return;}

  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  iNode.focus();
};
bbbfly.editbox._blur = function(){
  if(!this.Selected){return;}

  var iNode = document.getElementById(this.ID+'_II');
  if(!iNode){return;}

  iNode.blur();
};
bbbfly.editbox._focusStart = function(){
  this.Focus();
  this.SetCaretPos(0);
};
bbbfly.editbox._focusEnd = function(){
  var text = this.GetText();

  this.Focus();
  this.SetCaretPos(String.isString(text) ? text.length : 0);
};
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
bbbfly.editbox._doUpdate = function(node){
  if(!this.DoUpdate.callParent(node)){return false;}

  this.DoUpdateInput(node);
  return true;
};
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
bbbfly.editbox._onTextChanged = function(){
  this.UpdateInputValue();
};
bbbfly.editbox._onAltTextChanged = function(){
  this.UpdateInputValue();
};
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
bbbfly.editbox._doBlur = function(input){
  if(!this.Selected){return;}

  if(
    Function.isFunction(this.OnBlur)
    && !this.OnBlur(input)
  ){return;}

  this.SetSelected(false,false);
};
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
bbbfly.editbox._doInputChange = function(input){
  if(!this._AltTextMode){
    if(String.isString(input.value) && input.value){
      this.SetText(input.value);
      return;
    }
  }
  this.SetText(null);
};
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
      _AltTextMode: false,
      _InputPanel: {},
      _Buttons: {}
    },
    InputPanel: undefined,
    Buttons: undefined,
    Events: {
      OnSetText: null,
      OnTextChanged: bbbfly.editbox._onTextChanged,
      OnSetAltText: null,
      OnAltTextChanged: bbbfly.editbox._onAltTextChanged,
      OnFocus: null,
      OnBlur: null,
      OnKeyDown: null,
      OnKeyUp: null
    },
    Methods: {
      DoCreate: bbbfly.editbox._doCreate,
      DoUpdate: bbbfly.editbox._doUpdate,
      DoUpdateInput: bbbfly.editbox._doUpdateInput,
      UpdateInputValue: bbbfly.editbox._updateInputValue,
      DoFocus: bbbfly.editbox._doFocus,
      DoBlur: bbbfly.editbox._doBlur,
      DoKeyDown: bbbfly.editbox._doKeyDown,
      DoKeyUp: bbbfly.editbox._doKeyUp,
      DoInputChange: bbbfly.editbox._doInputChange,
      SetText: bbbfly.editbox._setText,
      GetText: bbbfly.editbox._getText,
      SetAltText: bbbfly.editbox._setAltText,
      GetAltText: bbbfly.editbox._getAltText,
      GetInputPanel: bbbfly.editbox._getInputPanel,
      GetButtons: bbbfly.editbox._getButtons,
      GetButton: bbbfly.editbox._getButton,
      SetCaretPos: bbbfly.editbox._setCaretPos,
      GetCaretPos: bbbfly.editbox._getCaretPos,
      Focus: bbbfly.editbox._focus,
      Blur: bbbfly.editbox._blur,
      FocusStart: bbbfly.editbox._focusStart,
      FocusEnd: bbbfly.editbox._focusEnd
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Wrapper',ref,parent);
};
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
bbbfly.EditBox.textalign = {
  left: 1,
  center: 2,
  right: 3
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_edit'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Edit',bbbfly.Edit);
    ngRegisterControlType('bbbfly.EditBox',bbbfly.EditBox);
    ngRegisterControlType('bbbfly.Memo',bbbfly.Memo);
  }
};
