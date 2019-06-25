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
bbbfly.line = {};

/** @ignore */
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateHtmlClass(node);
  this.DoUpdateHtmlState(node);
  return true;
};

/** @ignore */
bbbfly.panel._doMouseEnter = function(event,options){
  this.DoUpdateHtmlState(options.Element);
};

/** @ignore */
bbbfly.panel._doMouseLeave = function(event,options){
  this.DoUpdateHtmlState(options.Element);
};

/** @ignore */
bbbfly.panel._doUpdateHtmlClass = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  node.className = this.GetClassName();
};

/** @ignore */
bbbfly.panel._doUpdateHtmlState = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateHTMLState(node,state);
};

/** @ignore */
bbbfly.panel._getState = function(){
  return {
    disabled: !this.Enabled,
    readonly: !!this.ReadOnly,
    invalid: !!this.Invalid,

    mouseover: !!(
      this.Enabled && !this.ReadOnly
      && ngMouseInControls[this.ID]
    )
  };
};

/** @ignore */
bbbfly.panel._getClassName = function(suffix){
  return String.isString(suffix)
    ? this.BaseClassName+suffix
    : this.BaseClassName;
};

/** @ignore */
bbbfly.panel._getControlsHolder = function(){
  return this;
};

/** @ignore */
bbbfly.panel._doChangeState = function(update){
  if(update){
    this.Update();
  }
  else{
    var node = this.Elm();
    this.DoUpdateHtmlClass(node);
    this.DoUpdateHtmlState(node);
  }
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
  this.DoChangeState(update);

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

  var refDef = {};

  if(def.FramePanel !== null){
    if(Object.isObject(def.FramePanel)){
      refDef.FramePanel = ng_CopyVar(def.FramePanel);
    }

    ng_MergeDef(refDef,{
      FramePanel: {
        L:0,T:0,R:0,B:0,
        Type: 'bbbfly.Panel',
        id: this.ID + '_F',
        ScrollBars: ssNone,
        style: { zIndex: 1 },
        className: 'FramePanel',
        Data: {
          _FrameProxy: null,
          _FrameHtml: ''
        }
      }
    });
  }

  if(def.ControlsPanel !== null){
    if(Object.isObject(def.ControlsPanel)){
      refDef.ControlsPanel = ng_CopyVar(def.ControlsPanel);
    }

    ng_MergeDef(refDef,{
      ControlsPanel: {
        L:0,T:0,R:0,B:0,
        Type: 'bbbfly.Panel',
        id: this.ID + '_P',
        ScrollBars: ssAuto,
        style: { zIndex: 2 },
        Controls: def.Controls,
        ModifyControls: def.ModifyControls,
        className: 'ControlsPanel'
      }
    });
  }

  if(!def.ParentReferences){
    this.Controls = {};
    this.Controls.Owner = this;
    ref = this.Controls;
  }

  var refs = ngCreateControls(refDef,undefined,node);

  if(refs.ControlsPanel){
    this.ControlsPanel = refs.ControlsPanel;
    this.ControlsPanel.Owner = this;
  }

  if(refs.FramePanel){
    this.FramePanel = refs.FramePanel;
    this.FramePanel.Owner = this;
  }

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
bbbfly.frame._doMouseEnter = function(event,options){
  this.DoMouseEnter.callParent(event,options);

  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};

/** @ignore */
bbbfly.frame._doMouseLeave = function(event,options){
  this.DoMouseLeave.callParent(event,options);

  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
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

  var over = state.mouseover;

  state.mouseover = false;
  var proxy = bbbfly.Renderer.FrameProxy(frame,state,this.ID);
  var html = bbbfly.Renderer.FrameHTML(proxy,state);
  state.mouseover = over;

  fPanel._FrameProxy = proxy;
  if(html === fPanel._FrameHtml){return;}

  fPanel._FrameHtml = html;
  fNode.innerHTML = html;

  if(over){
    bbbfly.Renderer.UpdateFrameHTML(proxy,state);
  }
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
  var dims = { L:0, T:0, R:0, B:0, W:undefined, H:undefined };

  var fPanel = this.GetFramePanel();
  var fProxy = (fPanel) ? fPanel._FrameProxy : null;

  if(Object.isObject(fProxy)){
    if(Number.isInteger(fProxy.L.W)){dims.L = fProxy.L.W;}
    if(Number.isInteger(fProxy.T.H)){dims.T = fProxy.T.H;}
    if(Number.isInteger(fProxy.R.W)){dims.R = fProxy.R.W;}
    if(Number.isInteger(fProxy.B.H)){dims.B = fProxy.B.H;}
    if(Number.isInteger(fProxy.C.W)){dims.W = fProxy.C.W;}
    if(Number.isInteger(fProxy.C.H)){dims.H = fProxy.C.H;}
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
  var cPanel = this.GetControlsPanel();
  return cPanel ? cPanel : this.GetControlsHolder.callParent();
};

/** @ignore */
bbbfly.line._setBounds = function(bounds){
  if(!Object.isObject(bounds)){bounds = {};}
  var dims = this.GetFrameDims();

  switch(this.Orientation){
    case bbbfly.Line.orientation.horizontal:
      bounds.H = dims.T+dims.B;
      if(Number.isInteger(dims.H)){bounds.H += dims.H;}
    break;
    case bbbfly.Line.orientation.vertical:
      bounds.W = dims.L+dims.R;
      if(Number.isInteger(dims.W)){bounds.W += dims.W;}
    break;
  }

  return this.SetBounds.callParent(bounds);
};

/**
 * @class
 * @type control
 * @extends ngPanel
 *
 * @description
 *   Panel with basic states support.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Panel.Definition} [def=undefined] - Descendant definition
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
      DoMouseEnter: bbbfly.panel._doMouseEnter,
      /** @private */
      DoMouseLeave: bbbfly.panel._doMouseLeave,
      /** @private */
      DoChangeState: bbbfly.panel._doChangeState,
      /** @private */
      DoUpdateHtmlClass: bbbfly.panel._doUpdateHtmlClass,
      /** @private */
      DoUpdateHtmlState: bbbfly.panel._doUpdateHtmlState,

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
       * @param {string} [suffix=undefined] - Control part class name
       * @return {string} Control class name
       */
      GetClassName: bbbfly.panel._getClassName,
      /**
       * @function
       * @name GetControlsHolder
       * @memberof bbbfly.Panel#
       *
       * @return {object} self
       */
      GetControlsHolder: bbbfly.panel._getControlsHolder,

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
 * @extends bbbfly.Panel
 *
 * @description
 *   Panel with conditioned frame support.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Frame.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {boolean|bbbfly.Renderer.frame} [Frame=false] - Frame definition
 *   Define frame or set to true before panel creation to support frame
 */
bbbfly.Frame = function(def,ref,parent){
  def = def || {};

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

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @description
 *   Frame control with fixed dimension in one direction.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Frame.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {bbbfly.Line.orientation} [Orientation=horizontal]
 */
bbbfly.Line = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Orientation: bbbfly.Line.orientation.horizontal
    },
    Methods: {
      /** @private */
      SetBounds: bbbfly.line._setBounds
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Line.Orientation}
 */
bbbfly.Line.orientation = {
  vertical: 1,
  horizontal: 2
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
    ngRegisterControlType('bbbfly.Frame',bbbfly.Frame);
    ngRegisterControlType('bbbfly.Line',bbbfly.Line);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Panel
 * @extends ngControl.Definition
 *
 * @description Panel control definition
 */

/**
 * @interface Definition
 * @memberOf bbbfly.Frame
 * @extends bbbfly.Panel.Definition
 *
 * @description Frame control definition
 *
 * @property {ngControl.Definition} [FramePanel=undefined] - Control definition
 * @property {ngControl.Definition} [ControlsPanel=undefined] - Control definition
 */
