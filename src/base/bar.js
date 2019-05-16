/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage bar
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.toolbar = {};

/** @ignore */
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

/** @ignore */
bbbfly.toolbar._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.SetControlsPanelProps();
};

/** @ignore */
bbbfly.toolbar._update = function(recursive){
  this.SetControlsPanelProps();
  return this.Update.callParent(recursive);
};

/** @ignore */
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

/** @ignore */
bbbfly.toolbar._callToolBarFunction = function(funcName,args){
  var cPanel = this.GetControlsPanel();
  var cPanelFnc = (cPanel) ? cPanel[funcName] : null;

  if(Function.isFunction(cPanelFnc)){
    return cPanelFnc.apply(cPanel,(args ? args : []));
  }
};

/** @ignore */
bbbfly.toolbar._ctrlBringToFront = function(control){
  return this.CallToolbarFunction('CtrlBringToFront',[control]);
};

/** @ignore */
bbbfly.toolbar._ctrlSendToBack = function(control){
  return this.CallToolbarFunction('CtrlSendToBack',[control]);
};

/** @ignore */
bbbfly.toolbar._ctrlInsertAfter = function(control,after){
  return this.CallToolbarFunction('CtrlInsertAfter',[control,after]);
};

/** @ignore */
bbbfly.toolbar._ctrlInsertBefore = function(control,before){
  return this.CallToolbarFunction('CtrlInsertBefore',[control,before]);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Panel
 *
 * @description
 *   ToolBar whith frame.
 *
 * @inpackage bar
 *
 * @param {bbbfly.Panel.definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {boolean} [AutoSize=false] - If resize to wrap all child controls
 * @property {boolean} [Vertical=false] - Changes orientafion from horizontal to vertical
 * @property {px} [VPadding=0] - Vertical space between child controls
 * @property {px} [HPadding=0] - Horizontal space between child controls
 * @property {bbbfly.ToolBar.valign} [VAlign=top] - Child controls vertical align
 * @property {bbbfly.ToolBar.halign} [HAlign=left] - Child controls horizontal align
 * @property {boolean} [Wrapable=true] - If child controls can be wraped into multiple lines/columns
 */
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
      /** @private */
      Update: bbbfly.toolbar._update,
      /** @private */
      DoCreate: bbbfly.toolbar._doCreate,
      /** @private */
      SetControlsPanelProps: bbbfly.toolbar._setControlsPanelProps,
      /** @private */
      CallToolBarFunction: bbbfly.toolbar._callToolbarFunction,

      /**
       * @function
       * @name CtrlBringToFront
       * @memberof bbbfly.ToolBar#
       *
       * @param {ngControl} control
       *
       * @see {@link bbbfly.ToolBar#CtrlSendToBack|CtrlSendToBack()}
       */
      CtrlBringToFront: bbbfly.toolbar._ctrlBringToFront,
      /**
       * @function
       * @name CtrlSendToBack
       * @memberof bbbfly.ToolBar#
       *
       * @param {ngControl} control
       *
       * @see {@link bbbfly.ToolBar#CtrlBringToFront|CtrlBringToFront()}
       */
      CtrlSendToBack: bbbfly.toolbar._ctrlSendToBack,
      /**
       * @function
       * @name CtrlInsertAfter
       * @memberof bbbfly.ToolBar#
       *
       * @param {ngControl} control
       * @param {ngControl} after
       *
       * @see {@link bbbfly.ToolBar#CtrlInsertBefore|CtrlInsertBefore()}
       */
      CtrlInsertAfter: bbbfly.toolbar._ctrlInsertAfter,
      /**
       * @function
       * @name CtrlInsertBefore
       * @memberof bbbfly.ToolBar#
       *
       * @param {ngControl} control
       * @param {ngControl} before
       *
       * @see {@link bbbfly.ToolBar#CtrlInsertAfter|CtrlInsertAfter()}
       */
      CtrlInsertBefore: bbbfly.toolbar._ctrlInsertBefore
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_layout'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ToolBar',bbbfly.ToolBar);
  }
};

/**
 * @enum {string}
 * @description
 *   Possible values for
 *   {@link bbbfly.ToolBar|bbbfly.ToolBar.VAlign}
 */
bbbfly.ToolBar.valign = {
  top: 'top',
  bottom: 'bottom'
};

/**
 * @enum {string}
 * @description
 *   Possible values for
 *   {@link bbbfly.ToolBar|bbbfly.ToolBar.HAlign}
 */
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