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
bbbfly.panelgroup = {};
/** @ignore */
bbbfly.panel = {};
/** @ignore */
bbbfly.envelope = {};
/** @ignore */
bbbfly.frame = {};
/** @ignore */
bbbfly.line = {};

/** @ignore */
bbbfly.panelgroup._newGroupId = function(){
  var id = this._LastGroupId++;
  return 'bbbfly.PanelGroup_'+id;
};

/** @ignore */
bbbfly.panelgroup._registerControl = function(ctrl,def){
  var registered = false;

  if(Object.isObject(def)){
    for(var s in def){
      if(!def.hasOwnProperty(s)){continue;}

      var state = bbbfly.PanelGroup.state[s.toLowerCase()];
      if(this.RegisterGroup(ctrl,state,def[s])){
        registered = true;
      }
    }
  }
  return registered;
};

/** @ignore */
bbbfly.panelgroup._registerGroup = function(ctrl,state,id){
  if(!Object.isObject(ctrl) || !String.isString(ctrl.ID)){return false;}
  if(!Number.isInteger(state) || !String.isString(id)){return false;}

  var value = false;

  switch(state){
    case bbbfly.PanelGroup.state.visible:
      if(Function.isFunction(ctrl.AddEvent)){
        ctrl.AddEvent(
          'OnVisibleChanged',
          bbbfly.panelgroup._onControlVisibleChanged
        );
      }
      value = ctrl.Visible;
    break;
    case bbbfly.PanelGroup.state.selected:
      if(Function.isFunction(ctrl.AddEvent)){
        ctrl.AddEvent(
          'OnSelectedChanged',
          bbbfly.panelgroup._onControlSelectedChanged
        );
      }
      value = ctrl.Selected;
    break;
    default:
      return false;
  }

  var group = this._Groups[id];
  var groups = this._ControlGroups[ctrl.ID];

  if(!Object.isObject(group)){
    group = {targets:[],on:null};
    this._Groups[id] = group;
  }

  if(!Object.isObject(groups)){
    groups = {};
    this._ControlGroups[ctrl.ID] = groups;
  }

  group.targets.push({
    ctrl: ctrl,
    state: state
  });

  groups[state] = group;

  if(value){
    bbbfly.PanelGroup.ApplyControlState(
      ctrl,state,value
    );
  }

  return true;
};

/** @ignore */
bbbfly.panelgroup._unregisterControl = function(ctrl){
  if(!Object.isObject(ctrl) || !String.isString(ctrl.ID)){return false;}

  var groups = this._ControlGroups[ctrl.ID];
  delete this._ControlGroups[ctrl.ID];

  for(var state in groups){
    var group = groups[state];

    for(var i in group.targets){
      if(group.targets[i].ctrl === ctrl){
        delete group.targets[i];
      }

      if(
        Object.isObject(group.on)
        && (group.on.ctrl === ctrl)
      ){
        group.on = null;
      }
    }
  }

  if(Function.isFunction(ctrl.RemoveEvent)){
    ctrl.RemoveEvent(
      'OnVisibleChanged',
      bbbfly.panelgroup._onControlVisibleChanged
    );
    ctrl.RemoveEvent(
      'OnSelectedChanged',
      bbbfly.panelgroup._onControlSelectedChanged
    );
  }
  return true;
};

/** @ignore */
bbbfly.panelgroup._applyControlState = function(ctrl,state,value){
  if(!Object.isObject(ctrl) || !String.isString(ctrl.ID)){return false;}

  var groups = this._ControlGroups[ctrl.ID];
  if(!Object.isObject(groups)){return false;}

  var group = groups[state];
  if(!Object.isObject(group)){return false;}

  if(value){
    for(var i in group.targets){
      var target = group.targets[i];
      if((target.ctrl === ctrl) && (target.state === state)){
        group.on = target;
      }
      else if(Object.isObject(target.ctrl)){
        switch(target.state){
          case bbbfly.PanelGroup.state.visible:
            if(Function.isFunction(target.ctrl.SetVisible)){
              target.ctrl.SetVisible(false);
            }
          break;
          case bbbfly.PanelGroup.state.selected:
            if(Function.isFunction(target.ctrl.SetSelected)){
              target.ctrl.SetSelected(false);
            }
          break;
        }
      }
    }
  }
  else if(
    Object.isObject(group.on)
    && (group.on.ctrl === ctrl)
    && (group.on.state === state)
  ){
    group.on = null;
  }
  return true;
};

/** @ignore */
bbbfly.panelgroup._onControlVisibleChanged = function(){
  bbbfly.PanelGroup.ApplyControlState(
    this,bbbfly.PanelGroup.state.visible,this.Visible
  );
};

/** @ignore */
bbbfly.panelgroup._onControlSelectedChanged = function(){
  bbbfly.PanelGroup.ApplyControlState(
    this,bbbfly.PanelGroup.state.selected,this.Selected
  );
};

/** @ignore */
bbbfly.panel._doCreate = function(){
  if(this.Group){
    bbbfly.PanelGroup.RegisterControl(
      this,this.Group
    );
  }
};

/** @ignore */
bbbfly.panel._doDispose = function(){
  return bbbfly.PanelGroup.UnregisterControl(this);
};

/** @ignore */
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateHtmlClass(node);
  this.DoUpdateHtmlState(node);
  this.DoUpdateHtmlOverflow(node);
  return true;
};

/** @ignore */
bbbfly.panel._doMouseEnter = function(event,options){
  return this.DoUpdateHtmlState(options.Element);
};

/** @ignore */
bbbfly.panel._doMouseLeave = function(event,options){
  return this.DoUpdateHtmlState(options.Element);
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

  var state = this.GetState();
  if(node){bbbfly.Renderer.UpdateHTMLState(node,state);}

  return state;
};

/** @ignore */
bbbfly.panel._doUpdateHtmlOverflow = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  if(node){
    bbbfly.Renderer.UpdateHTMLOverflow(
      node,this.OverflowX,this.OverflowY
    );
  }

  return {
    OverflowX: this.OverflowX,
    OverflowY: this.OverflowY
  };
};

/** @ignore */
bbbfly.panel._getState = function(){
  return {
    disabled: !this.Enabled,
    readonly: !!this.ReadOnly,
    invalid: !!this.Invalid,
    selected: !!this.Selected,

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
bbbfly.panel._doChangeOverflow = function(update){
  if(update){
    this.Update();
  }
  else{
    var node = this.Elm();
    this.DoUpdateHtmlOverflow(node);
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

  this.SetChildControlsEnabled(enabled,this);
  this.Enabled = enabled;

  if(!Boolean.isBoolean(update)){update = true;}
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

  this.Invalid = invalid;

  if(!Boolean.isBoolean(update)){update = true;}
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

  this.ReadOnly = readOnly;

  if(!Boolean.isBoolean(update)){update = true;}
  this.DoChangeState(update);

  if(Function.isFunction(this.OnReadOnlyChanged)){
    this.OnReadOnlyChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(selected === this.Selected){return true;}

  if(
    Function.isFunction(this.OnSetSelected)
    && !this.OnSetSelected(selected)
  ){return false;}

  this.Selected = selected;

  if(!Boolean.isBoolean(update)){update = true;}
  this.DoChangeState(update);

  if(Function.isFunction(this.OnSelectedChanged)){
    this.OnSelectedChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._setOverflow = function(overflowX,overflowY,update){
  var vals = bbbfly.Renderer.overflow;
  if(!Object.includes(vals,overflowX)){overflowX = vals.hidden;}
  if(!Object.includes(vals,overflowY)){overflowY = vals.hidden;}

  if((overflowX === this.OverflowX) && (overflowY === this.OverflowY)){
    return true;
  }

  if(
    Function.isFunction(this.OnSetOverflow)
    && !this.OnSetOverflow(overflowX,overflowY)
  ){return false;}

  this.OverflowX = overflowX;
  this.OverflowY = overflowY;

  if(!Boolean.isBoolean(update)){update = true;}
  this.DoChangeOverflow(update);

  if(Function.isFunction(this.OnOverflowChanged)){
    this.OnOverflowChanged();
  }
  return true;
};

/** @ignore */
bbbfly.panel._addChildControl = function(ctrl){
  this.AddChildControl.callParent(ctrl);

  if(Function.isFunction(this.OnChildControlAdded)){
    this.OnChildControlAdded(ctrl);
  }
};

/** @ignore */
bbbfly.panel._removeChildControl = function(ctrl){
  this.RemoveChildControl.callParent(ctrl);

  if(Function.isFunction(this.OnChildControlRemoved)){
    this.OnChildControlRemoved(ctrl);
  }
};

/** @ignore */
bbbfly.panel._createControl = function(def){
  if(!Object.isObject(def)){return null;}

  var cHolder = this.GetControlsHolder();
  var ctrl = ngCreateControl(def,undefined,cHolder.ID);
  if(!Object.isObject(ctrl)){return null;}

  def.parent = cHolder.ID;
  def.id = ctrl.ID;

  if(Function.isFunction(cHolder.AddChildControl)){
    cHolder.AddChildControl(ctrl);
  }

  ctrl.Create(def);
  return ctrl;
};

/** @ignore */
bbbfly.panel._disposeControls = function(){
  var cHolder = this.GetControlsHolder();

  for(var i in cHolder.ChildControls){
    var ctrl = cHolder.ChildControls[i];

    if(Function.isFunction(ctrl.Dispose)){
      ctrl.Dispose();
    }
  }
};

/** @ignore */
bbbfly.envelope._trackControl = function(ctrl,track){
  if(!Object.isObject(ctrl)){return;}
  if(!Boolean.isBoolean(track)){track = true;}

  if(!Array.isArray(ctrl._trackers)){
    ctrl._trackers = new Array();
  }

  if(track){
    ctrl._trackers.push({
      ctrl: this,
      options: {}
    });

    if(Function.isFunction(ctrl.AddEvent)){
      ctrl.AddEvent('OnVisibleChanged',
        bbbfly.envelope._onTrackedControlVisibleChanged,true
      );
      ctrl.AddEvent('OnUpdated',
        bbbfly.envelope._onTrackedControlUpdated,true
      );
    }
  }
  else{
    var idx = Array.indexOf(ctrl._trackers,this);
    if(idx >= 0){ctrl._trackers.splice(idx,1);}

    if(ctrl._trackers.length < 1){
      delete ctrl._trackers;

      if(Function.isFunction(ctrl.RemoveEvent)){
        ctrl.RemoveEvent('OnVisibleChanged',
          bbbfly.envelope._onTrackedControlVisibleChanged
        );
        ctrl.RemoveEvent('OnUpdated',
          bbbfly.envelope._onTrackedControlUpdated
        );
      }
    }
  }
};

/** @ignore */
bbbfly.envelope._trackChildControls = function(def,ref,node){
  var cHolder = this.GetControlsHolder();

  if(Function.isFunction(cHolder.AddEvent)){
    var envelope = this;

    cHolder.AddEvent('OnChildControlAdded',function(ctrl){
      envelope.TrackControl(ctrl,true);
    });
    cHolder.AddEvent('OnChildControlRemoved',function(ctrl){
      envelope.TrackControl(ctrl,false);
    });
  }

  if(Array.isArray(cHolder.ChildControls)){
    for(var i in cHolder.ChildControls){
      var ctrl = cHolder.ChildControls[i];
      this.TrackControl(ctrl,true);
    }
  }
};

/** @ignore */
bbbfly.envelope._isTrackedControlChanged = function(ctrl,options){
  var ctrlVisible = ctrl.Visible;
  var optsVisible = options.Visible;

  var ctrlBounds = ctrl.Bounds ? ctrl.Bounds : {};
  var optsBounds = options.Bounds ? options.Bounds : {};

  options.Visible = ctrlVisible;
  options.Bounds = ng_CopyVar(ctrlBounds);

  if(ctrlVisible !== optsVisible){return true;}
  if(ctrlBounds.L !== optsBounds.L){return true;}
  if(ctrlBounds.R !== optsBounds.R){return true;}
  if(ctrlBounds.T !== optsBounds.T){return true;}
  if(ctrlBounds.B !== optsBounds.B){return true;}

  return false;
};

/** @ignore */
bbbfly.envelope._onTrackedControlChanged = function(){
  this.Update(false);
};

/** @ignore */
bbbfly.envelope._onTrackedControlVisibleChanged = function(){
  if(!Array.isArray(this._trackers)){return;}
  if(this.Visible){return;}

  for(var i in this._trackers){
    bbbfly.envelope._onTrackedControlChange(
      this,this._trackers[i]
    );
  }
};

/** @ignore */
bbbfly.envelope._onTrackedControlUpdated = function(){
  if(!Array.isArray(this._trackers)){return;}

  for(var i in this._trackers){
    bbbfly.envelope._onTrackedControlChange(
      this,this._trackers[i]
    );
  }
};

/** @ignore */
bbbfly.envelope._onTrackedControlChange = function(ctrl,tracker){
  if(!tracker || !Object.isObject(tracker.ctrl)){return;}

  if(
    Function.isFunction(tracker.ctrl.IsTrackedControlChanged)
      && tracker.ctrl.IsTrackedControlChanged(ctrl,tracker.options)
  ){
    if(Function.isFunction(tracker.ctrl.OnTrackedControlChanged)){
      tracker.ctrl.OnTrackedControlChanged(ctrl);
    }
  }
};

/** @ignore */
bbbfly.frame._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
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
  var state = this.DoMouseEnter.callParent(event,options);
  var fPanel = this.GetFramePanel();

  if(fPanel){
    var proxy = fPanel._FrameProxy;

    if(Object.isObject(proxy)){
      bbbfly.Renderer.UpdateFrameHTML(proxy,state);
    }
  }
  return state;
};

/** @ignore */
bbbfly.frame._doMouseLeave = function(event,options){
  var state = this.DoMouseLeave.callParent(event,options);
  var fPanel = this.GetFramePanel();

  if(fPanel){
    var proxy = fPanel._FrameProxy;

    if(Object.isObject(proxy)){
      bbbfly.Renderer.UpdateFrameHTML(proxy,state);
    }
  }
  return state;
};

/** @ignore */
bbbfly.frame._doChangeState = function(update){
  this.DoChangeState.callParent(update);
  if(!update){this.DoUpdateImages();}
};

/** @ignore */
bbbfly.frame._doUpdateFrame = function(){
  var fPanel = this.GetFramePanel();
  if(!fPanel){return;}

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
bbbfly.frame._doUpdateControlsPanel = function(){
  var cPanel = this.GetControlsPanel();
  if(!cPanel){return;}

  var dims = this.GetFrameDims();
  cPanel.SetBounds({
    L: dims.L,
    T: dims.T,
    R: dims.R,
    B: dims.B,
    W: null,
    H: null
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

  if(Object.isObject(fPanel)){
    var fBounds = fPanel.Bounds;
    var fProxy = fPanel._FrameProxy;

    if(Object.isObject(fBounds)){
      if(Number.isInteger(fBounds.L)){dims.L += fBounds.L;}
      if(Number.isInteger(fBounds.T)){dims.T += fBounds.T;}
      if(Number.isInteger(fBounds.R)){dims.R += fBounds.R;}
      if(Number.isInteger(fBounds.B)){dims.B += fBounds.B;}
    }

    if(Object.isObject(fProxy)){
      if(Number.isInteger(fProxy.L.W)){dims.L += fProxy.L.W;}
      if(Number.isInteger(fProxy.T.H)){dims.T += fProxy.T.H;}
      if(Number.isInteger(fProxy.R.W)){dims.R += fProxy.R.W;}
      if(Number.isInteger(fProxy.B.H)){dims.B += fProxy.B.H;}
      if(Number.isInteger(fProxy.C.W)){dims.W = fProxy.C.W;}
      if(Number.isInteger(fProxy.C.H)){dims.H = fProxy.C.H;}
    }
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
 * @hideconstructor
 *
 * @description
 *   Handles {bbbfly.Panel} control state groups
 *
 * @inpackage panel
 */
bbbfly.PanelGroup = {
  /** @private */
  _Groups: {},
  /** @private */
  _ControlGroups: {},
  /** @private */
  _LastGroupId: 0,

  /**
   * @function
   * @name NewGroup
   * @memberof bbbfly.PanelGroup#
   *
   * @return {string} State group ID
   */
  NewGroupId: bbbfly.panelgroup._newGroupId,
  /**
   * @function
   * @name RegisterControl
   * @memberof bbbfly.PanelGroup#
   *
   * @param {bbbfly.Panel} ctrl - Control instance
   * @param {bbbfly.PanelGroup.def} def - State groups definition
   * @return {boolean} If control was registred
   */
  RegisterControl: bbbfly.panelgroup._registerControl,
  /**
   * @function
   * @name RegisterGroup
   * @memberof bbbfly.PanelGroup#
   *
   * @param {bbbfly.Panel} ctrl - Control instance
   * @param {bbbfly.PanelGroup.state} state - State to handle
   * @param {string} id - State group ID
   * @return {boolean} If control group was registred
   */
  RegisterGroup: bbbfly.panelgroup._registerGroup,
  /**
   * @function
   * @name UnregisterControl
   * @memberof bbbfly.PanelGroup#
   *
   * @param {bbbfly.Panel} ctrl - Control instance
   * @return {boolean} If control was unregistred
   */
  UnregisterControl: bbbfly.panelgroup._unregisterControl,

  /**
   * @function
   * @name ApplyControlState
   * @memberof bbbfly.PanelGroup#
   *
   * @param {bbbfly.Panel} ctrl - Control instance
   * @param {bbbfly.PanelGroup.state} state - State to Apply
   * @param {boolean} value - State value
   * @return {boolean} If unregistration was successful
   */
  ApplyControlState: bbbfly.panelgroup._applyControlState
};

/**
 * @enum {integer}
 */
bbbfly.PanelGroup.state = {
  visible: 1,
  selected: 2
};

/**
 * @typedef {object} def
 * @memberOf bbbfly.PanelGroup
 *
 * @property {string} [Visible] - Group ID
 * @property {string} [Selected] - Group ID
 */

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
 * @property {boolean} [Selected=false]
 *
 * @property {bbbfly.Renderer.overflow} [OverflowX=hidden]
 * @property {bbbfly.Renderer.overflow} [OverflowY=hidden]
 *
 * @property {bbbfly.PanelGroup.def} [Group=null]
 */
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Enabled: true,
      Invalid: false,
      ReadOnly: false,
      Selected: false,

      OverflowX: bbbfly.Renderer.overflow.hidden,
      OverflowY: bbbfly.Renderer.overflow.hidden,

      Group: null
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
      OnReadOnlyChanged: null,
      /**
       * @event
       * @name OnSetSelected
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} selected - Value to set
       * @return {boolean} Return false to deny value change
       *
       * @see {@link bbbfly.Panel#SetSelected|SetSelected()}
       * @see {@link bbbfly.Panel#event:OnSelectedChanged|OnSelectedChanged}
       */
      OnSetSelected: null,
      /**
       * @event
       * @name OnSelectedChanged
       * @memberof bbbfly.Panel#
       *
       * @see {@link bbbfly.Panel#SetSelected|SetSelected()}
       * @see {@link bbbfly.Panel#event:OnSetSelected|OnSetSelected}
       */
      OnSelectedChanged: null,

      /**
       * @event
       * @name OnSetOverflow
       * @memberof bbbfly.Panel#
       *
       * @param {bbbfly.Renderer.overflow} [overflowX] - Horizontal value to set
       * @param {bbbfly.Renderer.overflow} [overflowY] - Vertical value to set
       * @return {boolean} Return false to deny values change
       *
       * @see {@link bbbfly.Panel#SetOverflow|SetOverflow()}
       * @see {@link bbbfly.Panel#event:OnOverflowChanged|OnOverflowChanged}
       */
       OnSetOverflow: null,
       /**
        * @event
        * @name OnOverflowChanged
        * @memberof bbbfly.Panel#
        *
        * @see {@link bbbfly.Panel#SetOverflow|SetOverflow()}
        * @see {@link bbbfly.Panel#event:OnSetOverflow|OnSetOverflow}
        */
       OnOverflowChanged: null,

      /**
       * @event
       * @name OnChildControlAdded
       * @memberof bbbfly.Panel#
       *
       * @param {ngControl} [ctrl] - Child control reference
       *
       * @see {@link bbbfly.Panel#AddChildControl|AddChildControl()}
       * @see {@link bbbfly.Panel#RemoveChildControl|RemoveChildControl()}
       * @see {@link bbbfly.Panel#event:OnChildControlRemoved|OnChildControlRemoved}
       */
      OnChildControlAdded: null,
      /**
       * @event
       * @name OnChildControlRemoved
       * @memberof bbbfly.Panel#
       *
       * @param {ngControl} [ctrl] - Child control reference
       *
       * @see {@link bbbfly.Panel#AddChildControl|AddChildControl()}
       * @see {@link bbbfly.Panel#RemoveChildControl|RemoveChildControl()}
       * @see {@link bbbfly.Panel#event:OnChildControlAdded|OnChildControlAdded}
       */
      OnChildControlRemoved: null
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.panel._doCreate,
      /** @private */
      DoDispose: bbbfly.panel._doDispose,
      /** @private */
      DoUpdate: bbbfly.panel._doUpdate,
      /** @private */
      DoMouseEnter: bbbfly.panel._doMouseEnter,
      /** @private */
      DoMouseLeave: bbbfly.panel._doMouseLeave,
      /** @private */
      DoChangeState: bbbfly.panel._doChangeState,
      /** @private */
      DoChangeOverflow: bbbfly.panel._doChangeOverflow,
      /** @private */
      DoUpdateHtmlClass: bbbfly.panel._doUpdateHtmlClass,
      /** @private */
      DoUpdateHtmlState: bbbfly.panel._doUpdateHtmlState,
      /** @private */
      DoUpdateHtmlOverflow: bbbfly.panel._doUpdateHtmlOverflow,

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
      SetReadOnly: bbbfly.panel._setReadOnly,
      /**
       * @function
       * @name SetSelected
       * @memberof bbbfly.Panel#
       *
       * @param {boolean} [selected=true] - Value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.Panel#event:OnSetSelected|OnSetSelected}
       * @see {@link bbbfly.Panel#event:OnSelectedChanged|OnSelectedChanged}
       */
      SetSelected: bbbfly.panel._setSelected,

      /**
       * @function
       * @name SetOverflow
       * @memberof bbbfly.Panel#
       *
       * @param {bbbfly.Renderer.overflow} [overflowX=hidden] - Horizontal value to set
       * @param {bbbfly.Renderer.overflow} [overflowY=hidden] - Vertical value to set
       * @param {boolean} [update=true] - If update control
       * @return {boolean} False if change was denied
       *
       * @see {@link bbbfly.Panel#event:OnSetOverflow|OnSetOverflow}
       * @see {@link bbbfly.Panel#event:OnOverflowChanged|OnOverflowChanged}
       */
      SetOverflow: bbbfly.panel._setOverflow,

      /**
       * @function
       * @name AddChildControl
       * @memberof bbbfly.Panel#
       *
       * @param {ngControl} [ctrl] - Child control reference
       *
       * @see {@link bbbfly.Panel#RemoveChildControl|RemoveChildControl()}
       * @see {@link bbbfly.Panel#event:OnChildControlAdded|OnChildControlAdded}
       * @see {@link bbbfly.Panel#event:OnChildControlRemoved|OnChildControlRemoved}
       */
      AddChildControl: bbbfly.panel._addChildControl,
      /**
       * @function
       * @name RemoveChildControl
       * @memberof bbbfly.Panel#
       *
       * @param {ngControl} [ctrl] - Child control reference
       *
       * @see {@link bbbfly.Panel#AddChildControl|AddChildControl()}
       * @see {@link bbbfly.Panel#event:OnChildControlAdded|OnChildControlAdded}
       * @see {@link bbbfly.Panel#event:OnChildControlRemoved|OnChildControlRemoved}
       */
      RemoveChildControl: bbbfly.panel._removeChildControl,

      /**
       * @function
       * @name CreateControl
       * @memberof bbbfly.Panel#
       *
       * @param {ngControl.Definition} [def] - Child control definition
       *
       * @see {@link bbbfly.Panel#AddChildControl|AddChildControl()}
       * @see {@link bbbfly.Panel#RemoveChildControl|RemoveChildControl()}
       * @see {@link bbbfly.Panel#DisposeControls|DisposeControls()}
       */
      CreateControl: bbbfly.panel._createControl,
      /**
       * @function
       * @name DisposeControls
       * @memberof bbbfly.Panel#
       *
       * @see {@link bbbfly.Panel#AddChildControl|AddChildControl()}
       * @see {@link bbbfly.Panel#RemoveChildControl|RemoveChildControl()}
       * @see {@link bbbfly.Panel#CreateControl|CreateControl()}
       */
      DisposeControls: bbbfly.panel._disposeControls
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
 *   Panel with controls tracking support.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Panel.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.Envelope = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Events: {
      /**
       * @event
       * @name OnTrackedControlChanged
       * @memberof bbbfly.Envelope#
       *
       * @param {ngControl} [ctrl] - Tracked control reference
       */
      OnTrackedControlChanged: bbbfly.envelope._onTrackedControlChanged
    },
    Methods: {
      /**
       * @function
       * @name TrackControl
       * @memberof bbbfly.Envelope#
       *
       * @param {ngControl} [ctrl] - Tracked control reference
       * @param {boolean} [track=true] - Pass false to cancel tracking
       */
      TrackControl: bbbfly.envelope._trackControl,
      /**
       * @function
       * @name TrackChildControls
       * @memberof bbbfly.Envelope#
       */
      TrackChildControls: bbbfly.envelope._trackChildControls,
      /**
       * @event
       * @name IsTrackedControlChanged
       * @memberof bbbfly.Envelope#
       *
       * @param {ngControl} [ctrl] - Tracked control reference
       * @param {object} [options] - Per tracker options
       */
      IsTrackedControlChanged: bbbfly.envelope._isTrackedControlChanged
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Envelope
 *
 * @description
 *   Envelope with conditioned frame support.
 *
 * @inpackage panel
 *
 * @param {bbbfly.Frame.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {boolean|bbbfly.Renderer.frame} [Frame=false] - Frame definition
 *   Define frame or set it to true before panel creation to support frame
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
       * @return {bbbfly.Renderer.frame} Frame definition
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

  return ngCreateControlAsType(def,'bbbfly.Envelope',ref,parent);
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
 *   Possible values for {@link bbbfly.Line|bbbfly.Line.Orientation}
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
    ngRegisterControlType('bbbfly.Envelope',bbbfly.Envelope);
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
