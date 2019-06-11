/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.panel = {};
bbbfly.frame = {};
bbbfly.line = {};
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateHtmlClass(node);
  this.DoUpdateHtmlState(node);
  return true;
};
bbbfly.panel._doMouseEnter = function(event,options){
  this.DoUpdateHtmlState(options.Element);
};
bbbfly.panel._doMouseLeave = function(event,options){
  this.DoUpdateHtmlState(options.Element);
};
bbbfly.panel._doUpdateHtmlClass = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  node.className = this.GetClassName();
};
bbbfly.panel._doUpdateHtmlState = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateHTMLState(node,state);
};
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
bbbfly.panel._getClassName = function(className){
  return String.isString(className)
    ? this.BaseClassName+className
    : this.BaseClassName;
};
bbbfly.panel._getControlsHolder = function(){
  return this;
};
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
      className: 'FramePanel',
      Data: {
        _FrameProxy: null,
        _FrameHtml: ''
      }
    },
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
bbbfly.frame._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateControlsPanel(node);
  return this.DoUpdate.callParent(node);
};
bbbfly.frame._doMouseEnter = function(event,options){
  this.DoMouseEnter.callParent(event,options);

  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
bbbfly.frame._doMouseLeave = function(event,options){
  this.DoMouseLeave.callParent(event,options);

  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
bbbfly.frame._doChangeState = function(update){
  this.DoChangeState.callParent(update);
  if(!update){this.DoUpdateImages();}
};
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
bbbfly.frame._doUpdateImages = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameProxy(proxy,state);
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
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
bbbfly.frame._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};
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
bbbfly.frame._getFramePanel = function(){
  return this.FramePanel ? this.FramePanel : null;
};
bbbfly.frame._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};
bbbfly.frame._getControlsHolder = function(){
  var cPanel = this.GetControlsPanel();
  return cPanel ? cPanel : this.GetControlsHolder.callParent();
};
bbbfly.line._setBounds = function(bounds){
  if(Object.isObject(bounds)){
    switch(this.Orientation){
      case bbbfly.Line.orientation.horizontal: delete bounds.H; break;
      case bbbfly.Line.orientation.vertical: delete bounds.W; break;
    }
  }

  return this.SetBounds.callParent(bounds);
};
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
      OnSetEnabled: null,
      OnEnabledChanged: null,
      OnSetInvalid: null,
      OnInvalidChanged: null,
      OnSetReadOnly: null,
      OnReadOnlyChanged: null
    },
    Methods: {
      DoUpdate: bbbfly.panel._doUpdate,
      DoMouseEnter: bbbfly.panel._doMouseEnter,
      DoMouseLeave: bbbfly.panel._doMouseLeave,
      DoChangeState: bbbfly.panel._doChangeState,
      DoUpdateHtmlClass: bbbfly.panel._doUpdateHtmlClass,
      DoUpdateHtmlState: bbbfly.panel._doUpdateHtmlState,
      GetState: bbbfly.panel._getState,
      GetClassName: bbbfly.panel._getClassName,
      GetControlsHolder: bbbfly.panel._getControlsHolder,
      SetEnabled: bbbfly.panel._setEnabled,
      SetInvalid: bbbfly.panel._setInvalid,
      SetReadOnly: bbbfly.panel._setReadOnly
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};
bbbfly.Frame = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Frame: false
    },
    FramePanel: undefined,
    ControlsPanel: undefined,
    Methods: {
      DoCreate: bbbfly.frame._doCreate,
      DoUpdate: bbbfly.frame._doUpdate,
      DoMouseEnter: bbbfly.frame._doMouseEnter,
      DoMouseLeave: bbbfly.frame._doMouseLeave,
      DoChangeState: bbbfly.frame._doChangeState,
      DoUpdateFrame: bbbfly.frame._doUpdateFrame,
      DoUpdateImages: bbbfly.frame._doUpdateImages,
      DoUpdateControlsPanel: bbbfly.frame._doUpdateControlsPanel,
      GetFrame: bbbfly.frame._getFrame,
      GetFrameDims: bbbfly.frame._getFrameDims,
      GetFramePanel: bbbfly.frame._getFramePanel,
      GetControlsPanel: bbbfly.frame._getControlsPanel,
      GetControlsHolder: bbbfly.frame._getControlsHolder
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};
bbbfly.Line = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Orientation: bbbfly.Line.orientation.horizontal
    },
    Methods: {
      SetBounds: bbbfly.line._setBounds
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
bbbfly.Line.orientation = {
  vertical: 1,
  horizontal: 2
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
    ngRegisterControlType('bbbfly.Frame',bbbfly.Frame);
    ngRegisterControlType('bbbfly.Line',bbbfly.Line);
  }
};