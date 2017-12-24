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

/** @ignore */
bbbfly.toolbar._setControlsPanelClassName = function(){
  if(!this.ControlsPanel){return;}
  var node = this.ControlsPanel.Elm();

  var cn = this.BaseClassName + 'ControlsPanel';
  if(this.Invalid){cn += 'Invalid';}

  this.ControlsPanel.BaseClassName = cn;
  if(node){node.className = cn;}
};

/** @ignore */
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

/** @ignore */
bbbfly.toolbar._doRelease = function(node){
  node.style.display = 'none';
  var frameNode = document.getElementById(this.ID + '_F');
  if(frameNode){ng_SetInnerHTML(frameNode,'');}
};

/** @ignore */
bbbfly.toolbar._update = function(recursive){
  this.SetControlsPanelProps();
  return this.Update.callParent(recursive);
};

/** @ignore */
bbbfly.toolbar._doUpdate = function(node){
  var frameNode = document.getElementById(this.ID + '_F');
  if(!frameNode){return true;}

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

  if(this.ControlsPanel){
    var bounds = ng_CopyVar(this._FrameDims);
    if(this.AutoSize){
      if(this.Vertical){bounds.R = null;}
      else{bounds.B = null;}
    }

    this.ControlsPanel.SetBounds(bounds);
  }

  return true;
};

/** @ignore */
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
  }
};

/** @ignore */
bbbfly.toolbar._doUpdateImages = function(){
  ngc_ChangeBox(this.ID,0,this.Enabled,this.Frame);
};

/** @ignore */
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

/** @ignore */
bbbfly.toolbar._doSetInvalid = function(invalid,update){
  this.SetControlsPanelClassName();
};

/** @ignore */
bbbfly.toolbar._callControlsPanelFunction = function(funcName,args){
  var func = (this.ControlsPanel) ? this.ControlsPanel[funcName] : null;

  if(typeof func === 'function'){
    return func.apply(this.ControlsPanel,(args ? args : []));
  }
};

/** @ignore */
bbbfly.toolbar._ctrlBringToFront = function(control){
  return this.CallControlsPanelFunction('CtrlBringToFront',[control]);
};

/** @ignore */
bbbfly.toolbar._ctrlSendToBack = function(control){
  return this.CallControlsPanelFunction('CtrlSendToBack',[control]);
};

/** @ignore */
bbbfly.toolbar._ctrlInsertAfter = function(control,after){
  return this.CallControlsPanelFunction('CtrlInsertAfter',[control,after]);
};

/** @ignore */
bbbfly.toolbar._ctrlInsertBefore = function(control,before){
  return this.CallControlsPanelFunction('CtrlInsertBefore',[control,before]);
};

/**
 * @class
 * @type control
 * @extends ngPanel
 *
 * @description
 *   ToolBar whith frame.
 *
 * @inpackage bar
 *
 * @param {object} [def=undefined] - Descendant definition
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
 * @property {boolean} [Invalid=false] - If toolbar is invalid
 * @property {frame} [Frame={}] - Frame images definition
 */
bbbfly.ToolBar = function(def,ref,parent){
  def = def || {};

  /**
   * @definition
   * @memberof bbbfly.ToolBar
   * @property {ngControl} [ControlsPanel=null]
   */

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

      /** @private */
      _FrameDims: {}
    },
    ControlsPanel: null,
    Events: {
      /**
       * @event
       * @name OnSetInvalid
       * @memberof bbbfly.ToolBar#
       *
       * @param {bbbfly.ToolBar} bar - Toolbar reference
       * @param {boolean} invalid - If validity state should change to invalid
       * @param {boolean} update - If list should be updated
       * @return {boolean} Return false to deny validity change
       *
       * @see {@link bbbfly.ToolBar#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.ToolBar#DoSetInvalid|DoSetInvalid()}
       */
      OnSetInvalid: null
    },
    Methods: {
      /** @private */
      Update: bbbfly.toolbar._update,
      /** @private */
      DoUpdate: bbbfly.toolbar._doUpdate,
      /** @private */
      DoCreate: bbbfly.toolbar._doCreate,
      /** @private */
      DoRelease: bbbfly.toolbar._doRelease,
      /** @private */
      DoUpdateImages: bbbfly.toolbar._doUpdateImages,
      /** @private */
      SetControlsPanelProps: bbbfly.toolbar._setControlsPanelProps,
      /** @private */
      SetControlsPanelClassName: bbbfly.toolbar._setControlsPanelClassName,
      /** @private */
      CallControlsPanelFunction: bbbfly.toolbar._callControlsPanelFunction,

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
      CtrlInsertBefore: bbbfly.toolbar._ctrlInsertBefore,
      /**
       * @function
       * @name SetInvalid
       * @memberof bbbfly.ToolBar#
       *
       * @param {boolean} invalid - If set invalid or valid
       * @param {boolean} [update=true] - If update toolbar
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.ToolBar#DoSetInvalid|DoSetInvalid()}
       * @see {@link bbbfly.ToolBar#event:OnSetInvalid|OnSetInvalid}
       */
      SetInvalid: bbbfly.toolbar._setInvalid,
      /**
       * @function
       * @name DoSetInvalid
       * @memberof bbbfly.ToolBar#
       * @description Use this method to implement validity change
       *
       * @param {boolean} invalid - Validity state
       * @param {boolean} [update=true] - If update toolbar
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.ToolBar#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.ToolBar#event:OnSetInvalid|OnSetInvalid}
       */
      DoSetInvalid: bbbfly.toolbar._doSetInvalid
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
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