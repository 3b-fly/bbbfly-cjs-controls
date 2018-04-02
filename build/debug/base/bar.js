/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */

var bbbfly = bbbfly || {};
bbbfly.toolbar = {};
bbbfly.toolbar._setControlsPanelProps = function(){
  if(!this.ControlsPanel){return;}
  if(!this.ControlsPanel.CtrlInheritsFrom('ngToolBar')){return;}

  ng_MergeVarReplace(this.ControlsPanel,{
    AutoSize: this.AutoSize,
    Vertical: this.Vertical,
    VPadding: this.VPadding,
    HPadding: this.HPadding,
    VAlign: this.VAlign,
    HAlign: this.HAlign,
    Wrapable: this.Wrapable
  },true);
};
bbbfly.toolbar._setControlsPanelClassName = function(){
  if(!this.ControlsPanel){return;}

  var cn = this.BaseClassName + 'ControlsPanel';
  if(!this.Enabled){cn += 'Disabled';}
  else if(this.Invalid){cn += 'Invalid';}

  var node = this.ControlsPanel.Elm();
  this.ControlsPanel.BaseClassName = cn;
  if(node){node.className = cn;}
};
bbbfly.toolbar._doCreate = function(def,ref,node){
  var defs = {
    ControlsPanel: (Object.isObject(def.ControlsPanel))
      ? def.ControlsPanel : {}
  };

  ng_MergeDef(defs,{
    ControlsPanel: {
      L:0,T:0,R:0,B:0,
      Type: 'ngToolBar',
      id: this.ID + '_P',
      ScrollBars: ssAuto,
      Controls: def.Controls,
      ModifyControls: def.ModifyControls,
      Events: {
        OnUpdated: bbbfly.toolbar._onControlsPanelUpdated
      }
    },
    FramePanel: {
      Type: 'ngPanel',
      id: this.ID + '_F',
      ScrollBars: ssDefault,
      style: {
        position: 'absolute',
        zIndex: 800
      }
    }
  });

  if(!def.ParentReferences){
    this.Controls = {};
    this.Controls.Owner = this;
    ref = this.Controls;
  }

  var refs = ngCreateControls(defs,undefined,node);
  this.ControlsPanel = refs.ControlsPanel;
  this.ControlsPanel.Owner = this;

  this.SetControlsPanelProps();
  this.SetControlsPanelClassName();

  delete def.Controls;
  delete def.ModifyControls;
  delete refs.ControlsPanel;
  delete refs.FramePanel;

  ngCloneRefs(ref,refs);
};
bbbfly.toolbar._doRelease = function(node){
  node.style.display = 'none';
  var frameNode = document.getElementById(this.ID + '_F');
  if(frameNode){ng_SetInnerHTML(frameNode,'');}
};
bbbfly.toolbar._update = function(recursive){
  this.SetControlsPanelProps();
  return this.Update.callParent(recursive);
};
bbbfly.toolbar._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateControlsPanel(node);
  return true;
};
bbbfly.toolbar._onControlsPanelUpdated = function(){
  var toolBar = this.Owner;
  if(toolBar && toolBar.AutoSize){
    var bounds = {};

    if(toolBar.Vertical){
      bounds.W = this.Bounds.W;
      if(toolBar._FrameDims){
        bounds.W += toolBar._FrameDims.L + toolBar._FrameDims.R;
      }
    }
    else{
      bounds.H = this.Bounds.H;
      if(toolBar._FrameDims){
        bounds.H += toolBar._FrameDims.T + toolBar._FrameDims.B;
      }
    }

    toolBar.SetBounds(bounds);
    toolBar.DoUpdateFrame();
  }
};
bbbfly.toolbar._doUpdateFrame = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  var frameNode = document.getElementById(this.ID + '_F');
  if(!node || !frameNode){return;}

  var html = new ngStringBuilder();

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  var frame = {};
  ngc_ImgBox(
    html,this.ID,'bbbfly.ToolBar',
    0,this.Enabled,
    0,0,w,h,false,
    this.Frame,
    '','',undefined,
    frame
  );
  ng_SetInnerHTML(frameNode,html.toString());

  this._FrameDims = {
    T: frame.Top.H,
    L: frame.Left.W,
    R: frame.Right.W,
    B: frame.Bottom.H
  };
};
bbbfly.toolbar._doUpdateControlsPanel = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node || !this.ControlsPanel){return;}

  var dims = Object.isObject(this._FrameDims)
    ? this._FrameDims: { T:0, L:0, R:0, B:0 };

  var bounds = {
    T: dims.T,
    L: dims.L,
    R: null,
    B: null
  };

  ng_BeginMeasureElement(node);
  var w = ng_ClientWidth(node);
  var h = ng_ClientHeight(node);
  ng_EndMeasureElement(node);

  bounds.W = (w - dims.L - dims.R);
  bounds.H = (h - dims.T - dims.B);

  this.ControlsPanel.SetBounds(bounds);
};
bbbfly.toolbar._doUpdateImages = function(){
  ngc_ChangeBox(this.ID,0,this.Enabled,this.Frame);
};
bbbfly.toolbar._setInvalid = function(invalid,update){
  invalid = (invalid !== false);
  update = (update !== false);

  if(this.Invalid === invalid){return true;}

  if(this.OnSetInvalid && !this.OnSetInvalid(this,invalid,update)){
    return false;
  }

  this.Invalid = invalid;
  if(this.DoSetInvalid){this.DoSetInvalid(invalid,update);}

  return true;
};
bbbfly.toolbar._doSetInvalid = function(invalid,update){
  this.SetControlsPanelClassName();
};
bbbfly.toolbar._onEnabledChanged = function(){
  this.SetControlsPanelClassName();
};
bbbfly.toolbar._callControlsPanelFunction = function(funcName,args){
  var func = (this.ControlsPanel) ? this.ControlsPanel[funcName] : null;

  if(typeof func === 'function'){
    return func.apply(this.ControlsPanel,(args ? args : []));
  }
};
bbbfly.toolbar._ctrlBringToFront = function(control){
  return this.CallControlsPanelFunction('CtrlBringToFront',[control]);
};
bbbfly.toolbar._ctrlSendToBack = function(control){
  return this.CallControlsPanelFunction('CtrlSendToBack',[control]);
};
bbbfly.toolbar._ctrlInsertAfter = function(control,after){
  return this.CallControlsPanelFunction('CtrlInsertAfter',[control,after]);
};
bbbfly.toolbar._ctrlInsertBefore = function(control,before){
  return this.CallControlsPanelFunction('CtrlInsertBefore',[control,before]);
};
bbbfly.ToolBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: true,
    Data: {
      AutoSize: false,
      Vertical: false,
      VPadding: 0,
      HPadding: 0,
      VAlign: bbbfly.ToolBar.valign.top,
      HAlign: bbbfly.ToolBar.halign.left,
      Wrapable: true,

      Invalid: false,
      Frame: {},
      _FrameDims: {}
    },
    ControlsPanel: null,
    Events: {
      OnEnabledChanged: bbbfly.toolbar._onEnabledChanged,
      OnSetInvalid: null
    },
    Methods: {
      Update: bbbfly.toolbar._update,
      DoUpdate: bbbfly.toolbar._doUpdate,
      DoCreate: bbbfly.toolbar._doCreate,
      DoRelease: bbbfly.toolbar._doRelease,
      DoUpdateFrame: bbbfly.toolbar._doUpdateFrame,
      DoUpdateControlsPanel: bbbfly.toolbar._doUpdateControlsPanel,
      DoUpdateImages: bbbfly.toolbar._doUpdateImages,
      SetControlsPanelProps: bbbfly.toolbar._setControlsPanelProps,
      SetControlsPanelClassName: bbbfly.toolbar._setControlsPanelClassName,
      CallControlsPanelFunction: bbbfly.toolbar._callControlsPanelFunction,
      CtrlBringToFront: bbbfly.toolbar._ctrlBringToFront,
      CtrlSendToBack: bbbfly.toolbar._ctrlSendToBack,
      CtrlInsertAfter: bbbfly.toolbar._ctrlInsertAfter,
      CtrlInsertBefore: bbbfly.toolbar._ctrlInsertBefore,
      SetInvalid: bbbfly.toolbar._setInvalid,
      DoSetInvalid: bbbfly.toolbar._doSetInvalid
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_layout'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ToolBar',bbbfly.ToolBar);
  }
};
bbbfly.ToolBar.valign = {
  top: 'top',
  bottom: 'bottom'
};
bbbfly.ToolBar.halign = {
  left: 'left',
  right: 'right'
};

/**
 * @interface ChildControl
 * @memberOf bbbfly.ToolBar
 * @description
 *   {@link bbbfly.ToolBar|ToolBar} child controls can implement
 *   this to modify how toolbar handles them.
 *
 * @property {boolean} [ToolBarIgnore=false] - Do not place control by toolbar
 * @property {boolean} [ToolBarAutoUpdate=true] - If toolbar should update afrer control updated
 * @property {px} [ToolBarIndent=0] - Modify control position by this value after placed
 * @property {px} [ToolBarHPadding=undefined] - Overwrite horizontel space after control (used in horizontal ToolBar)
 * @property {px} [ToolBarVPadding=undefined] - Overwrite vertical space after control (used in vertical ToolBar)
 * @property {px} [ToolBarWidth=undefined] - Consider control having this width for placement purpose
 * @property {px} [ToolBarHeight=undefined] - Consider control having this height for placement purpose
 * @property {boolean} [ToolBarBreak=false] - Break line/column before control
 * @property {boolean} [ToolBarNoWrap=false]
 */