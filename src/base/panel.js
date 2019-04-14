﻿/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage panel
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.panel = {};

/** @ignore */
bbbfly.panel._doCreate = function(def,ref,node){
  if(!def.Data || (typeof def.Data.Frame === 'undefined')){return;}

  var refDef = {
    FramePanel: {},
    ControlsPanel: {}
  };

  if(Object.isObject(def.FramePanel)){
    refDef.FramePanel = def.FramePanel;
  }
  if(Object.isObject(def.ControlsPanel)){
    refDef.ControlsPanel = def.ControlsPanel;
  }

  ng_MergeDef(refDef,{
    FramePanel: {
      L:0,T:0,R:0,B:0,
      Type: 'ngPanel',
      id: this.ID + '_F',
      ScrollBars: ssDefault,
      style: { zIndex: 1 }
    },
    ControlsPanel: {
      L:0,T:0,R:0,B:0,
      Type: 'ngPanel',
      id: this.ID + '_P',
      ScrollBars: ssAuto,
      style: { zIndex: 2 },
      Controls: def.Controls,
      ModifyControls: def.ModifyControls
    }
  });

  if(!def.ParentReferences){
    this.Controls = {};
    this.Controls.Owner = this;
    ref = this.Controls;
  }

  var refs = ngCreateControls(refDef,undefined,node);

  this.ControlsPanel = refs.ControlsPanel;
  this.ControlsPanel.Owner = this;

  this.FramePanel = refs.FramePanel;
  this.FramePanel.Owner = this;

  delete def.Controls;
  delete def.ModifyControls;
  delete refs.ControlsPanel;
  delete refs.FramePanel;

  this.UpdateClassName();
  ngCloneRefs(ref,refs);
};

/** @ignore */
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateControlsPanel(node);
  return true;
};

/** @ignore */
bbbfly.panel._doUpdateFrame = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var fNode = fPanel.Elm();
  if(!fNode){return;}

  var html = new ngStringBuilder();

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  var frame = {};
  ngc_ImgBox(
    html,this.ID,'bbbfly.Panel',
    0,this.Enabled,
    0,0,w,h,false,
    this.Frame,
    '','',undefined,
    frame
  );
  ng_SetInnerHTML(fNode,html.toString());

  this._FrameDims = {
    T: frame.Top.H,
    L: frame.Left.W,
    R: frame.Right.W,
    B: frame.Bottom.H
  };
};

/** @ignore */
bbbfly.panel._doUpdateImages = function(){
  ngc_ChangeBox(this.ID,0,this.Enabled,this.Frame);
};

/** @ignore */
bbbfly.panel._doUpdateControlsPanel = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  var cPanel = this.GetControlsPanel();
  if(!node || !cPanel){return;}

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  var dims = Object.isObject(this._FrameDims)
    ? this._FrameDims: { T:0, L:0, R:0, B:0 };

  cPanel.SetBounds({
    W: (w - dims.L - dims.R),
    H: (h - dims.T - dims.B),
    T: dims.T,
    L: dims.L,
    R: null,
    B: null
  });
};

/** @ignore */
bbbfly.panel._updateClassName = function(){
  var node = this.Elm();
  if(node){node.className = this.GetClassName();}
};

/** @ignore */
bbbfly.panel._getClassName = function(className){
  if(!String.isString(className)){className = '';}

  if(!this.Enabled){className += 'Disabled';}
  else if(this.Invalid){className += 'Invalid';}

  return this.BaseClassName+className;
};

/** @ignore */
bbbfly.panel._getFramePanel = function(){
  return this.FramePanel ? this.FramePanel : null;
};

/** @ignore */
bbbfly.panel._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};

/** @ignore */
bbbfly.panel._getControlsHolder = function(){
  return this.ControlsPanel ? this.ControlsPanel : this;
};

/** @ignore */
bbbfly.panel._setInvalid = function(invalid,update){
  invalid = (invalid !== false);
  update = (update !== false);

  if(this.Invalid === invalid){return true;}

  if(this.OnSetInvalid && !this.OnSetInvalid(this,invalid,update)){
    return false;
  }

  if(this.DoSetInvalid){this.DoSetInvalid(invalid,update);}
  return true;
};

/** @ignore */
bbbfly.panel._doSetInvalid = function(invalid,update){
  this.Invalid = !!invalid;
  this.UpdateClassName();

  if(update){this.Update();}
  else{this.DoUpdateImages();}
};

/** @ignore */
bbbfly.panel._onEnabledChanged = function(){
  this.UpdateClassName();
};

/**
 * @class
 * @type control
 * @extends ngPanel
 *
 * @description
 *   Panel with conditioned frame support.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Panel.definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {boolean} [Enabled=true]
 * @property {boolean} [Invalid=false]
 * @property {frame} [Frame=undefined]
 *   Define this property before panel creation to add frame support
 */
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  /**
   * @definition
   * @memberof bbbfly.Panel
   * @property {ngControl} [FramePanel=null]
   * @property {ngControl} [ControlsPanel=null]
   * @property {boolean} [ParentReferences=true]
   */

  ng_MergeDef(def,{
    ramePanel: null,
    ControlsPanel: null,
    ParentReferences: true,
    Data: {
      Enabled: true,
      Invalid: false,
      Frame: undefined,

      /** @private */
      _FrameDims: {}
    },
    Events: {
      /** @private */
      OnEnabledChanged: bbbfly.panel._onEnabledChanged,
      /**
       * @event
       * @name OnSetInvalid
       * @memberof bbbfly.Panel#
       *
       * @param {bbbfly.Panel} bar - Control reference
       * @param {boolean} invalid - If validity state should change to invalid
       * @param {boolean} update - If should be updated
       * @return {boolean} Return false to deny validity change
       *
       * @see {@link bbbfly.Panel#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.Panel#DoSetInvalid|DoSetInvalid()}
       */
      OnSetInvalid: null
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.panel._doCreate,
      /** @private */
      DoUpdate: bbbfly.panel._doUpdate,
      /** @private */
      DoUpdateFrame: bbbfly.panel._doUpdateFrame,
      /** @private */
      DoUpdateImages: bbbfly.panel._doUpdateImages,
      /** @private */
      DoUpdateControlsPanel: bbbfly.panel._doUpdateControlsPanel,
      /** @private */
      UpdateClassName: bbbfly.panel._updateClassName,
      /**
       * @function
       * @name GetClassName
       * @memberof bbbfly.Panel#
       *
       * @param {string} [className=undefined] - Control part class name
       * @return {string} Control class name
       */
      GetClassName: bbbfly.panel._getClassName,
      /**
       * @function
       * @name GetFramePanel
       * @memberof bbbfly.Panel#
       *
       * @return {object|null} FramePanel control
       *
       * @see {@link bbbfly.Panel#GetControlsPanel|GetControlsPanel()}
       * @see {@link bbbfly.Panel#GetControlsHolder|GetControlsHolder()}
       */
      GetFramePanel: bbbfly.panel._getFramePanel,
      /**
       * @function
       * @name GetControlsPanel
       * @memberof bbbfly.Panel#
       *
       * @return {object|null} ControlsPanel control
       *
       * @see {@link bbbfly.Panel#GetFramePanel|GetFramePanel()}
       * @see {@link bbbfly.Panel#GetControlsHolder|GetControlsHolder()}
       */
      GetControlsPanel: bbbfly.panel._getControlsPanel,
      /**
       * @function
       * @name GetControlsHolder
       * @memberof bbbfly.Panel#
       *
       * @return {object} ControlsPanel control or self
       *
       * @see {@link bbbfly.Panel#GetFramePanel|GetFramePanel()}
       * @see {@link bbbfly.Panel#GetControlsPanel|GetControlsPanel()}
       */
      GetControlsHolder: bbbfly.panel._getControlsHolder,
      /**
       * @function
       * @name SetInvalid
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} invalid - If set invalid or valid
       * @param {boolean} [update=true] - If update toolbar
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.Panel#DoSetInvalid|DoSetInvalid()}
       * @see {@link bbbfly.Panel#event:OnSetInvalid|OnSetInvalid}
       */
      SetInvalid: bbbfly.panel._setInvalid,
      /**
       * @function
       * @name DoSetInvalid
       * @memberof bbbfly.Panel#
       * @description Use this method to implement validity change
       *
       * @param {boolean} invalid - Validity state
       * @param {boolean} [update=true] - If update toolbar
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.Panel#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.Panel#event:OnSetInvalid|OnSetInvalid}
       */
      DoSetInvalid: bbbfly.panel._doSetInvalid
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
  }
};