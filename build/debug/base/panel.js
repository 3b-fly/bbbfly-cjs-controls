/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.panel = {};
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
      ScrollBars: ssNone,
      style: { zIndex: 1 },
      className: this.BaseClassName+'FramePanel',
      Data: { _FrameProxy: null }
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
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateClassName(node);
  this.DoUpdateControlsPanel(node);
  return true;
};
bbbfly.panel._doUpdateFrame = function(node){
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
bbbfly.panel._doUpdateImages = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameProxy(proxy,state);
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
bbbfly.panel._doUpdateClassName = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  node.className = this.GetClassName();
};
bbbfly.panel._doUpdateControlsPanel = function(node){
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
bbbfly.panel._doMouseEnter = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
bbbfly.panel._doMouseLeave = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

  var proxy = fPanel._FrameProxy;
  if(!Object.isObject(proxy)){return;}

  var state = this.GetState();
  bbbfly.Renderer.UpdateFrameHTML(proxy,state);
};
bbbfly.panel._getState = function(){
  return {
    disabled: !this.Enabled,
    invalid: !!this.Invalid,
    mouseOver: !!this.MouseInControl
  };
};
bbbfly.panel._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};
bbbfly.panel._getFrameDims = function(){
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
bbbfly.panel._getFramePanel = function(){
  return this.FramePanel ? this.FramePanel : null;
};
bbbfly.panel._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};
bbbfly.panel._getControlsHolder = function(){
  return this.ControlsPanel ? this.ControlsPanel : this;
};
bbbfly.panel._doChangeState = function(ctrl,update){
  if(update){
    ctrl.Update();
  }
  else{
    ctrl.DoUpdateImages();
    ctrl.DoUpdateClassName();
  }
};
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
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Enabled: true,
      Invalid: false,
      ReadOnly: false,
      Frame: false
    },
    FramePanel: undefined,
    ControlsPanel: undefined,
    ParentReferences: true,
    Events: {
      OnSetInvalid: null,
      OnInvalidChanged: null,
      OnSetReadOnly: null,
      OnReadOnlyChanged: null
    },
    Methods: {
      DoCreate: bbbfly.panel._doCreate,
      DoUpdate: bbbfly.panel._doUpdate,
      DoUpdateFrame: bbbfly.panel._doUpdateFrame,
      DoUpdateImages: bbbfly.panel._doUpdateImages,
      DoUpdateClassName: bbbfly.panel._doUpdateClassName,
      DoUpdateControlsPanel: bbbfly.panel._doUpdateControlsPanel,
      DoMouseEnter: bbbfly.panel._doMouseEnter,
      DoMouseLeave: bbbfly.panel._doMouseLeave,
      GetState: bbbfly.panel._getState,
      GetFrame: bbbfly.panel._getFrame,
      GetFrameDims: bbbfly.panel._getFrameDims,
      GetClassName: bbbfly.panel._getClassName,
      GetFramePanel: bbbfly.panel._getFramePanel,
      GetControlsPanel: bbbfly.panel._getControlsPanel,
      GetControlsHolder: bbbfly.panel._getControlsHolder,
      SetInvalid: bbbfly.panel._setInvalid,
      SetReadOnly: bbbfly.panel._setReadOnly
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
  }
};