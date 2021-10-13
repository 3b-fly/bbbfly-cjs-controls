/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.toolbar = {};
bbbfly.toolbar._setControlsPanelProps = function(){
  var cPanel = this.GetControlsPanel();
  if(!cPanel){return;}

  ng_MergeVarReplace(cPanel,{
    AutoSize: this.AutoSize,
    Vertical: this.Vertical,
    VPadding: this.VPadding,
    HPadding: this.HPadding,
    VAlign: this.VAlign,
    HAlign: this.HAlign,
    Wrapable: this.Wrapable
  },true);
};
bbbfly.toolbar._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.SetControlsPanelProps();
};
bbbfly.toolbar._update = function(recursive){
  this.SetControlsPanelProps();
  return this.Update.callParent(recursive);
};
bbbfly.toolbar._onControlsPanelUpdated = function(){
  var ctrl = this.Owner;
  if(ctrl && ctrl.AutoSize){

    var dims = ctrl.GetFrameDims();
    var bounds = {};

    if(ctrl.Vertical){
      bounds.W = (this.Bounds.W + dims.L + dims.R);
    }
    else{
      bounds.H = (this.Bounds.H + dims.T + dims.B);
    }

    ctrl.SetBounds(bounds);
    ctrl.DoUpdateFrame();
  }
};
bbbfly.toolbar._callToolBarFunction = function(funcName,args){
  var cPanel = this.GetControlsPanel();
  var cPanelFnc = (cPanel) ? cPanel[funcName] : null;

  if(Function.isFunction(cPanelFnc)){
    return cPanelFnc.apply(cPanel,(args ? args : []));
  }
};
bbbfly.toolbar._ctrlBringToFront = function(control){
  return this.CallToolbarFunction('CtrlBringToFront',[control]);
};
bbbfly.toolbar._ctrlSendToBack = function(control){
  return this.CallToolbarFunction('CtrlSendToBack',[control]);
};
bbbfly.toolbar._ctrlInsertAfter = function(control,after){
  return this.CallToolbarFunction('CtrlInsertAfter',[control,after]);
};
bbbfly.toolbar._ctrlInsertBefore = function(control,before){
  return this.CallToolbarFunction('CtrlInsertBefore',[control,before]);
};
bbbfly.ToolBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      AutoSize: false,
      Vertical: false,
      VPadding: 0,
      HPadding: 0,
      VAlign: bbbfly.ToolBar.valign.top,
      HAlign: bbbfly.ToolBar.halign.left,
      Wrapable: true
    },
    ControlsPanel: {
      Type: 'ngToolBar',
      Events: {
        OnUpdated: bbbfly.toolbar._onControlsPanelUpdated
      }
    },
    Methods: {
      Update: bbbfly.toolbar._update,
      DoCreate: bbbfly.toolbar._doCreate,
      SetControlsPanelProps: bbbfly.toolbar._setControlsPanelProps,
      CallToolBarFunction: bbbfly.toolbar._callToolbarFunction,
      CtrlBringToFront: bbbfly.toolbar._ctrlBringToFront,
      CtrlSendToBack: bbbfly.toolbar._ctrlSendToBack,
      CtrlInsertAfter: bbbfly.toolbar._ctrlInsertAfter,
      CtrlInsertBefore: bbbfly.toolbar._ctrlInsertBefore
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
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