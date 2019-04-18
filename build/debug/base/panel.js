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
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateClassName(node);
  this.DoUpdateControlsPanel(node);
  return true;
};
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
bbbfly.panel._doUpdateImages = function(){
  ngc_ChangeBox(this.ID,0,this.Enabled,this.GetFrame());
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
bbbfly.panel._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};
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
    FramePanel: null,
    ControlsPanel: null,
    ParentReferences: true,
    Data: {
      Enabled: true,
      Invalid: false,
      ReadOnly: false,
      Frame: false,
      _FrameDims: {}
    },
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
      GetFrame: bbbfly.panel._getFrame,
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