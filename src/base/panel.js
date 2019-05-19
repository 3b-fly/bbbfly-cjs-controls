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
bbbfly.frame = {};

/** @ignore */
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateClassName(node);
  return true;
};

/** @ignore */
bbbfly.panel._doUpdateClassName = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  node.className = this.GetClassName();
};

/** @ignore */
bbbfly.panel._getState = function(){
  return {
    disabled: !this.Enabled,
    invalid: !!this.Invalid,
    mouseOver: !!(this.MouseInControl && !this.ReadOnly)
  };
};

/** @ignore */
bbbfly.panel._getClassName = function(className){
  if(String.isString(className)){
    className = this.BaseClassName+className;
  }
  else{
    className = this.BaseClassName;
    if(!this.Enabled){className += ' '+className+'Disabled';}
    else if(this.Invalid){className += ' '+className+'Invalid';}
  }
  return className;
};

/** @ignore */
bbbfly.panel._doChangeState = function(update){
  if(update){this.Update();}
  else{this.DoUpdateClassName();}
};

/** @ignore */
bbbfly.panel._setEnabled = function(enabled,update){
  if(!Boolean.isBoolean(enabled)){enabled = true;}
  if(this.Enabled === enabled){return true;}

  if(
    Function.isFunction(this.OnSetEnabled)
    && !this.OnSetEnabled(enabled)
  ){return false;}

  if(!Boolean.isBoolean(update)){update = true;}
  this.SetChildControlsEnabled(enabled,this);

  this.Enabled = enabled;
  this.DoChangeState(this,update);

  if(Function.isFunction(this.OnEnabledChanged)){
    this.OnEnabledChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._setInvalid = function(invalid,update){
  if(!Boolean.isBoolean(invalid)){invalid = true;}
  if(this.Invalid === invalid){return true;}

  if(
    Function.isFunction(this.OnSetInvalid)
    && !this.OnSetInvalid(invalid)
  ){return false;}

  if(!Boolean.isBoolean(update)){update = true;}

  this.Invalid = invalid;
  this.DoChangeState(update);

  if(Function.isFunction(this.OnInvalidChanged)){
    this.OnInvalidChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._setReadOnly = function(readOnly,update){
  if(!Boolean.isBoolean(readOnly)){readOnly = true;}
  if(readOnly === this.ReadOnly){return true;}

  if(
    Function.isFunction(this.OnSetReadOnly)
    && !this.OnSetReadOnly(readOnly)
  ){return false;}

  if(!Boolean.isBoolean(update)){update = true;}

  this.ReadOnly = readOnly;
  this.DoChangeState(update);

  if(Function.isFunction(this.OnReadOnlyChanged)){
    this.OnReadOnlyChanged();
  }
  return true;
};

/** @ignore */
bbbfly.frame._doCreate = function(def,ref,node){
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
      Type: 'bbbfly.Panel',
      id: this.ID + '_F',
      ScrollBars: ssNone,
      style: { zIndex: 1 },
      className: this.BaseClassName+'FramePanel',
      Data: { _FrameProxy: null }
    },
    ControlsPanel: {
      L:0,T:0,R:0,B:0,
      Type: 'bbbfly.Panel',
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
bbbfly.frame._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateControlsPanel(node);
  return this.DoUpdate.callParent(node);
};

/** @ignore */
bbbfly.frame._doMouseEnter = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  if(!this.ReadOnly){state.mouseOver = true;}

  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};

/** @ignore */
bbbfly.frame._doMouseLeave = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  if(!this.ReadOnly){state.mouseOver = false;}

  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};

/** @ignore */
bbbfly.frame._doChangeState = function(update){
  this.DoChangeState.callParent(update);
  if(!update){this.DoUpdateImages();}
};

/** @ignore */
bbbfly.frame._doUpdateFrame = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  var fPanel = this.GetFramePanel();
  if(!node || !fPanel){return;}

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  fPanel.SetBounds({ T:0, L:0, W:w, H:h });

  var fNode = fPanel.Elm();
  if(!fNode){return;}

  var frame = this.GetFrame();
  var state = this.GetState();

  fPanel._FrameProxy = bbbfly.Renderer.FrameProxy(frame,state,this.ID);
  fNode.innerHTML = bbbfly.Renderer.FrameHTML(fPanel._FrameProxy,state);
};

/** @ignore */
bbbfly.frame._doUpdateImages = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameProxy(proxy,state);
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};

/** @ignore */
bbbfly.frame._doUpdateControlsPanel = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  var cPanel = this.GetControlsPanel();
  if(!node || !cPanel){return;}

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  var dims = this.GetFrameDims();

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
bbbfly.frame._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};

/** @ignore */
bbbfly.frame._getFrameDims = function(){
  var dims = { L:0, T:0, R:0, B:0 };

  var fPanel = this.GetFramePanel();
  if(fPanel && Object.isObject(fPanel._FrameProxy)){
    dims.L = fPanel._FrameProxy.L.W;
    dims.T = fPanel._FrameProxy.T.H;
    dims.R = fPanel._FrameProxy.R.W;
    dims.B = fPanel._FrameProxy.B.H;
  }
  return dims;
};

/** @ignore */
bbbfly.frame._getFramePanel = function(){
  return this.FramePanel ? this.FramePanel : null;
};

/** @ignore */
bbbfly.frame._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};

/** @ignore */
bbbfly.frame._getControlsHolder = function(){
  return this.ControlsPanel ? this.ControlsPanel : this;
};

/**
 * @class
 * @type control
 * @extends ngPanel
 *
 * @description
 *   Panel with invalid and readonly state support.
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
 */
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Enabled: true,
      Invalid: false,
      ReadOnly: false
    },
    ParentReferences: true,
    Events: {
      /**
       * @event
       * @name OnSetEnabled
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} enabled - Value to set
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.Panel#SetEnabled|SetEnabled()}
       * @see {@link bbbfly.Panel#event:OnEnabledChanged|OnEnabledChanged}
       */
      OnSetEnabled: null,
      /**
       * @event
       * @name OnEnabledChanged
       * @memberof bbbfly.Panel#
       *
       * @see {@link bbbfly.Panel#SetEnabled|SetEnabled()}
       * @see {@link bbbfly.Panel#event:OnSetEnabled|OnSetEnabled}
       */
      OnEnabledChanged: null,
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
      DoUpdate: bbbfly.panel._doUpdate,
      /** @private */
      DoChangeState: bbbfly.panel._doChangeState,
      /** @private */
      DoUpdateClassName: bbbfly.panel._doUpdateClassName,

      /**
       * @function
       * @name GetState
       * @memberof bbbfly.Panel#
       *
       * @return {bbbfly.Renderer.state} Control state
       */
      GetState: bbbfly.panel._getState,
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
       * @name SetEnabled
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} [enabled=true] - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.Panel#event:OnSetEnabled|OnSetEnabled}
       * @see {@link bbbfly.Panel#event:OnEnabledChanged|OnEnabledChanged}
       */
      SetEnabled: bbbfly.panel._setEnabled,
      /**
       * @function
       * @name SetInvalid
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} [invalid=true] - Value to set
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
       * @param {boolean} [readonly=true] - Value to set
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

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
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
 * @property {boolean|bbbfly.Renderer.frame} [Frame=false] - Frame definition
 *   Define frame or set to true before panel creation to support frame
 */
bbbfly.Frame = function(def,ref,parent){
  def = def || {};

  /**
   * @definition
   * @memberof bbbfly.Frame
   * @property {ngControl} [FramePanel=undefined]
   * @property {ngControl} [ControlsPanel=undefined]
   */

  ng_MergeDef(def,{
    Data: {
      Frame: false
    },
    FramePanel: undefined,
    ControlsPanel: undefined,
    Methods: {
      /** @private */
      DoCreate: bbbfly.frame._doCreate,
      /** @private */
      DoUpdate: bbbfly.frame._doUpdate,
      /** @private */
      DoMouseEnter: bbbfly.frame._doMouseEnter,
      /** @private */
      DoMouseLeave: bbbfly.frame._doMouseLeave,
      /** @private */
      DoChangeState: bbbfly.frame._doChangeState,
      /** @private */
      DoUpdateFrame: bbbfly.frame._doUpdateFrame,
      /** @private */
      DoUpdateImages: bbbfly.frame._doUpdateImages,
      /** @private */
      DoUpdateControlsPanel: bbbfly.frame._doUpdateControlsPanel,

      /**
       * @function
       * @name GetFrame
       * @memberof bbbfly.Frame#
       *
       * @return {frame} Frame definition
       */
      GetFrame: bbbfly.frame._getFrame,
      /**
       * @function
       * @name GetFrameDims
       * @memberof bbbfly.Frame#
       *
       * @return {object} Frame dimensions
       */
      GetFrameDims: bbbfly.frame._getFrameDims,
      /**
       * @function
       * @name GetFramePanel
       * @memberof bbbfly.Frame#
       *
       * @return {object|null} FramePanel control
       *
       * @see {@link bbbfly.Frame#GetControlsPanel|GetControlsPanel()}
       * @see {@link bbbfly.Frame#GetControlsHolder|GetControlsHolder()}
       */
      GetFramePanel: bbbfly.frame._getFramePanel,
      /**
       * @function
       * @name GetControlsPanel
       * @memberof bbbfly.Frame#
       *
       * @return {object|null} ControlsPanel control
       *
       * @see {@link bbbfly.Frame#GetFramePanel|GetFramePanel()}
       * @see {@link bbbfly.Frame#GetControlsHolder|GetControlsHolder()}
       */
      GetControlsPanel: bbbfly.frame._getControlsPanel,
      /**
       * @function
       * @name GetControlsHolder
       * @memberof bbbfly.Frame#
       *
       * @return {object} ControlsPanel control or self
       *
       * @see {@link bbbfly.Frame#GetFramePanel|GetFramePanel()}
       * @see {@link bbbfly.Frame#GetControlsPanel|GetControlsPanel()}
       */
      GetControlsHolder: bbbfly.frame._getControlsHolder
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
    ngRegisterControlType('bbbfly.Frame',bbbfly.Frame);
  }
};