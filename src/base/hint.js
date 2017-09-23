/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage  hint
 */

/** @ignore */
var bbbfly = bbbfly || {};
/**
 * @namespace
 * @inpackage hint
 */
bbbfly.hint = {
  /** @ignore */
  hintified: {}
};

/** @ignore */
bbbfly.hint.hintified._showHint = function(hintId,message){
  if(typeof hintId !== 'string'){return false;}

  var hint = this._Hints[hintId];
  if(!hint){

    var hintDef = { Data: { HintId: hintId } };
    if(this.HintDefs && this.HintDefs[hintId]){
      ng_MergeDef(hintDef,this.HintDefs[hintId]);
    }
    if(this.HintDef){
      ng_MergeDef(hintDef,this.HintDef);
    }

    if(
      (typeof this.OnCreateHint === 'function')
      && !this.OnCreateHint(this,hintId,hintDef)
    ){return false;}

    hint = ngCreateTextHint(hintDef,'');
    hint.Owner = this;
    this._Hints[hintId] = hint;
  }

  if(hint){
    var resId = (this.HintMessages && this.HintMessages[hintId])
      ? this.HintMessages[hintId] : null;
    hint.SetText((typeof message === 'string') ? message : ngTxt(resId));
  }

  if(
    (typeof this.OnShowHint === 'function')
    && (!this.OnShowHint(this,hintId,hint))
  ){return false;}

  hint = this._Hints[hintId];
  if(hint){
    var node = this.Elm();
    ng_BeginMeasureElement(node);

    if((typeof this.HintXR === 'number')){
      this.HintX = ng_ClientWidth(node) - this.HintXR;
    }
    else if((typeof this.HintXL === 'number')){
      this.HintX = this.HintXL;
    }

    if((typeof this.HintYB === 'number')){
      this.HintY = ng_ClientHeight(node) - this.HintYB;
    }
    else if((typeof this.HintYT === 'number')){
      this.HintY = this.HintYT;
    }

    ng_EndMeasureElement(node);

    var anchor = hint.Anchor ? hint.Anchor : 'auto';
    hint.PopupCtrl(this,anchor);
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.hint.hintified._hideHint = function(hintId){
  if(this._Hints && this._Hints[hintId] && this._Hints[hintId].Visible){
    this._Hints[hintId].SetVisible(false);
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.hint.hintified._hideHints = function(){
  var hidden = false;
  if(this._Hints){
    for(var hintId in this._Hints){
      if(this._Hints[hintId].Visible){
        this._Hints[hintId].SetVisible(false);
        hidden = true;
      }
    }
  }
  return hidden;
};

/** @ignore */
bbbfly.hint.hintified._onVisibleChanged = function(){
  if(!this.Visible){this.HideHints();}
};

/** @ignore */
bbbfly.hint.hintified._onEnabledChanged = function(){
  if(!this.Visible){this.HideHints();}
};

/** @ignore */
bbbfly.hint.hintified._onUpdated = function(){
  for(var i in this._Hints){
    var hint = this._Hints[i];
    if(hint && hint.Visible){
      this.ShowHint(i,hint.GetText());
    }
  }
};

/**
 * @function
 * @name Hintify
 * @memberOf bbbfly.hint
 *
 * @description
 *   Modifies passed defintion to make control
 *   implement {@link bbbfly.hint.Hintified|Hintified} interface.
 *
 * @param {object} [def=undefined] - Control definition
 * @return {object} Control definition
 */
bbbfly.hint.Hintify = function(def){
  def = def || {};

/**
 * @interface
 * @name Hintified
 * @memberOf bbbfly.hint
 *
 * @description
 *   Implements easy hint implementation for any control.
 *
 * @property {object} [HintDef=null] - ngTextHint definition shared by all hints
 * @property {object[]} [HintDefs=null] - ngTextHint definitions with control hint IDs as keys
 * @property {resource[]} [HintMessages=null] - Hint text resouce names with control hint IDs as keys
 * @property {px} [HintXL=undefined] - Hint hotspot distance from left (will be used to calculate HintX)
 * @property {px} [HintXR=undefined] - Hint hotspot distance from right (will be used to calculate HintX)
 * @property {px} [HintYT=undefined] - Hint hotspot distance from top (will be used to calculate HintY)
 * @property {px} [HintYB=undefined] - Hint hotspot distance from bottom (will be used to calculate HintY)
 */

  ng_MergeDef(def,{
    Data: {
      HintDef: {
        Data: { HintId: null }
      },
      HintDefs: null,
      HintMessages: null,
      HintXL: undefined,
      HintXR: undefined,
      HintYT: undefined,
      HintYB: undefined,

      /** @private */
      _Hints: []
    },
    Events: {
      /** @private */
      OnVisibleChanged: bbbfly.hint.hintified._onVisibleChanged,
      /** @private */
      OnEnabledChanged: bbbfly.hint.hintified._onEnabledChanged,
      /** @private */
      OnUpdated: bbbfly.hint.hintified._onUpdated,
      /**
       * @event
       * @name OnCreateHint
       * @memberof bbbfly.hint.Hintified#
       *
       * @param {ngControl} control - Control reference
       * @param {string} hintId - Control hint ID
       * @param {object} hintDef - Hint control definition
       * @return {boolean} If hint can be created
       *
       * @see {@link bbbfly.hint.Hintified#ShowHint|ShowHint()}
       */
      OnCreateHint: null,
      /**
       * @event
       * @name OnShowHint
       * @memberof bbbfly.hint.Hintified#
       *
       * @param {ngControl} control - Control reference
       * @param {string} hintId - Control hint ID
       * @param {ngTextHint} hint - Hint to be shown
       * @return {boolean} If hint can be shown
       *
       * @see {@link bbbfly.hint.Hintified#ShowHint|ShowHint()}
       */
      OnShowHint: null
    },
    Methods: {
      /**
       * @function
       * @name ShowHint
       * @memberof bbbfly.hint.Hintified#
       *
       * @param {string} hintId - Control hint ID
       * @param {string} message - Hint text message
       * @return {boolean} If hint was shown
       *
       * @see {@link bbbfly.hint.Hintified#HideHint|HideHint()}
       * @see {@link bbbfly.hint.Hintified#HideHints|HideHints()}
       * @see {@link bbbfly.hint.Hintified#event:OnCreateHint|OnCreateHint}
       * @see {@link bbbfly.hint.Hintified#event:OnShowHint|OnShowHint}
       */
      ShowHint: bbbfly.hint.hintified._showHint,
      /**
       * @function
       * @name HideHint
       * @memberof bbbfly.hint.Hintified#
       *
       * @param {string} hintId - Control hint ID
       * @return {boolean} If there was any hint to hide
       *
       * @see {@link bbbfly.hint.Hintified#ShowHint|ShowHint()}
       * @see {@link bbbfly.hint.Hintified#HideHints|HideHints()}
       */
      HideHint: bbbfly.hint.hintified._hideHint,
      /**
       * @function
       * @name HideHints
       * @memberof bbbfly.hint.Hintified#
       *
       * @return {boolean} If there was any hint to hide
       *
       * @see {@link bbbfly.hint.Hintified#ShowHint|ShowHint()}
       * @see {@link bbbfly.hint.Hintified#HideHint|HideHint()}
       */
      HideHints: bbbfly.hint.hintified._hideHints
    }
  });

  return def;
};