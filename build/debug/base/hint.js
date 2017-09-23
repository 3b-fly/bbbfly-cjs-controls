/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */

var bbbfly = bbbfly || {};
bbbfly.hint = {
  hintified: {}
};
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
bbbfly.hint.hintified._hideHint = function(hintId){
  if(this._Hints && this._Hints[hintId] && this._Hints[hintId].Visible){
    this._Hints[hintId].SetVisible(false);
    return true;
  }
  return false;
};
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
bbbfly.hint.hintified._onVisibleChanged = function(){
  if(!this.Visible){this.HideHints();}
};
bbbfly.hint.hintified._onEnabledChanged = function(){
  if(!this.Visible){this.HideHints();}
};
bbbfly.hint.hintified._onUpdated = function(){
  for(var i in this._Hints){
    var hint = this._Hints[i];
    if(hint && hint.Visible){
      this.ShowHint(i,hint.GetText());
    }
  }
};
bbbfly.hint.Hintify = function(def){
  def = def || {};

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
      _Hints: []
    },
    Events: {
      OnVisibleChanged: bbbfly.hint.hintified._onVisibleChanged,
      OnEnabledChanged: bbbfly.hint.hintified._onEnabledChanged,
      OnUpdated: bbbfly.hint.hintified._onUpdated,
      OnCreateHint: null,
      OnShowHint: null
    },
    Methods: {
      ShowHint: bbbfly.hint.hintified._showHint,
      HideHint: bbbfly.hint.hintified._hideHint,
      HideHints: bbbfly.hint.hintified._hideHints
    }
  });

  return def;
};