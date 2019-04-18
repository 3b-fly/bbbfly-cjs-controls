/**
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
  if(!this.Frame){return;}

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
      style: { zIndex: 1 },
      className: this.BaseClassName+'FramePanel'
    },
    ControlsPanel: {
      L:0,T:0,R:0,B:0,
      Type: 'ngPanel',
      id: this.ID + '_P',
      ScrollBars: ssAuto,
      style: { zIndex: 2 },
      Controls: def.Controls,
      ModifyControls: def.ModifyControls,
      className: this.BaseClassName+'ControlsPanel'
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

  ngCloneRefs(ref,refs);
};

/** @ignore */
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateClassName(node);
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

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  var html = new ngStringBuilder();
  var frame = {};

  ngc_ImgBox(
    html,this.ID,'bbbfly.Panel',
    0,this.Enabled,
    0,0,w,h,false,
    this.GetFrame(),
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
  ngc_ChangeBox(this.ID,0,this.Enabled,this.GetFrame());
};

/** @ignore */
bbbfly.panel._doUpdateClassName = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  node.className = this.GetClassName();
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
bbbfly.panel._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};

/** @ignore */
bbbfly.panel._getClassName = function(className){
  if(String.isString(className)){
    className = this.BaseClassName+className;
  }
  else{
    className = this.BaseClassName;
    if(!this.Enabled){className += ' '+className+'Disabled';}
    else if(this.ReadOnly){className += ' '+className+'ReadOnly';}
    else if(this.Invalid){className += ' '+className+'Invalid';}
  }
  return className;
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
bbbfly.panel._doChangeState = function(ctrl,update){
  if(update){
    ctrl.Update();
  }
  else{
    ctrl.DoUpdateImages();
    ctrl.DoUpdateClassName();
  }
};

/** @ignore */
bbbfly.panel._setInvalid = function(invalid,update){
  if(this.Invalid === invalid){return true;}

  if(
    Function.isFunction(this.OnSetInvalid)
    && !this.OnSetInvalid(invalid)
  ){return false;}

  this.Invalid = !!invalid;
  bbbfly.panel._doChangeState(this,update);

  if(Function.isFunction(this.OnInvalidChanged)){
    this.OnInvalidChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._setReadOnly = function(readOnly,update){
  if(readOnly === this.ReadOnly){return true;}

  if(
    Function.isFunction(this.OnSetReadOnly)
    && !this.OnSetReadOnly(readOnly)
  ){return false;}

  this.ReadOnly = !!readOnly;
  bbbfly.panel._doChangeState(this,update);

  if(Function.isFunction(this.OnReadOnlyChanged)){
    this.OnReadOnlyChanged();
  }
  return true;
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
 * @property {boolean} [ReadOnly=false]
 * @property {boolean|frame} [Frame=false] - Frame definition
 *   Define frame or set to true before panel creation to support frame
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
    FramePanel: null,
    ControlsPanel: null,
    ParentReferences: true,
    Data: {
      Enabled: true,
      Invalid: false,
      ReadOnly: false,
      Frame: false,

      /** @private */
      _FrameDims: {}
    },
    Events: {
      /**
       * @event
       * @name OnSetInvalid
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} invalid - Value to set
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.Panel#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.Panel#event:OnInvalidChanged|OnInvalidChanged}
       */
      OnSetInvalid: null,
      /**
       * @event
       * @name OnInvalidChanged
       * @memberof bbbfly.Panel#
       *
       * @see {@link bbbfly.Panel#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.Panel#event:OnSetInvalid|OnSetInvalid}
       */
      OnInvalidChanged: null,
      /**
       * @event
       * @name OnSetReadOnly
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} readonly - Value to set
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.Panel#SetReadOnly|SetReadOnly()}
       * @see {@link bbbfly.Panel#event:OnReadOnlyChanged|OnReadOnlyChanged}
       */
      OnSetReadOnly: null,
      /**
       * @event
       * @name OnReadOnlyChanged
       * @memberof bbbfly.Panel#
       *
       * @see {@link bbbfly.Panel#SetReadOnly|SetReadOnly()}
       * @see {@link bbbfly.Panel#event:OnSetReadOnly|OnSetReadOnly}
       */
      OnReadOnlyChanged: null

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
      DoUpdateClassName: bbbfly.panel._doUpdateClassName,
      /** @private */
      DoUpdateControlsPanel: bbbfly.panel._doUpdateControlsPanel,
      /**
       * @function
       * @name GetFrame
       * @memberof bbbfly.Panel#
       *
       * @return {frame} Frame definition
       */
      GetFrame: bbbfly.panel._getFrame,
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
       * @param {boolean} invalid - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.Panel#event:OnSetInvalid|OnSetInvalid}
       * @see {@link bbbfly.Panel#event:OnInvalidChanged|OnInvalidChanged}
       */
      SetInvalid: bbbfly.panel._setInvalid,
      /**
       * @function
       * @name SetReadOnly
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} readonly - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.Panel#event:OnSetReadOnly|OnSetReadOnly}
       * @see {@link bbbfly.Panel#event:OnReadOnlyChanged|OnReadOnlyChanged}
       */
      SetReadOnly: bbbfly.panel._setReadOnly
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