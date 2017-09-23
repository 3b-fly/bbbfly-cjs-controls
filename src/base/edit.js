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
  this.SetCaretPos((typeof text === 'string') ? text.length : 0);
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

/**
 * @class
 * @type control
 * @extends ngEdit
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage edit
 *
 * @param {bbbfly.Edit.definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.Edit = function(def,ref,parent,parentType){
  def = def || {};
  /**
   * @definition
   * @memberof bbbfly.Edit
   * @property {array|object} [Buttons=null] - Define buttons as object to allow their merging
   */
  ng_MergeDef(def, {
    Buttons: null,
    Events: {
      /** @private */
      OnReadOnlyChanged: bbbfly.edit._onReadOnlyChanged
    },
    Methods: {
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

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_edit'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Edit',bbbfly.Edit);
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