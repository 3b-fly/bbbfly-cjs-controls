/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.panelgroup = {};
bbbfly.panel = {};
bbbfly.envelope = {};
bbbfly.frame = {};
bbbfly.line = {};
bbbfly.panelgroup._newGroupId = function(){
  var id = this._LastGroupId++;
  return 'bbbfly.PanelGroup_'+id;
};
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
bbbfly.panelgroup._onControlVisibleChanged = function(){
  bbbfly.PanelGroup.ApplyControlState(
    this,bbbfly.PanelGroup.state.visible,this.Visible
  );
};
bbbfly.panelgroup._onControlSelectedChanged = function(){
  bbbfly.PanelGroup.ApplyControlState(
    this,bbbfly.PanelGroup.state.selected,this.Selected
  );
};
bbbfly.panel._doCreate = function(){
  if(this.Group){
    bbbfly.PanelGroup.RegisterControl(
      this,this.Group
    );
  }
};
bbbfly.panel._doDispose = function(){
  return bbbfly.PanelGroup.UnregisterControl(this);
};
bbbfly.panel._doUpdate = function(node){
  this.DoUpdateHtmlClass(node);
  this.DoUpdateHtmlState(node);
  this.DoUpdateHtmlOverflow(node);
  return true;
};
bbbfly.panel._doMouseEnter = function(event,options){
  return this.DoUpdateHtmlState(options.Element);
};
bbbfly.panel._doMouseLeave = function(event,options){
  return this.DoUpdateHtmlState(options.Element);
};
bbbfly.panel._doUpdateHtmlClass = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}
  if(!node){return;}

  node.className = this.GetClassName();
};
bbbfly.panel._doUpdateHtmlState = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  var state = this.GetState();
  if(node){bbbfly.Renderer.UpdateHTMLState(node,state);}

  return state;
};
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
bbbfly.panel._getClassName = function(suffix){
  return String.isString(suffix)
    ? this.BaseClassName+suffix
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
bbbfly.panel._doChangeOverflow = function(update){
  if(update){
    this.Update();
  }
  else{
    var node = this.Elm();
    this.DoUpdateHtmlOverflow(node);
  }
};
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
bbbfly.panel._addChildControl = function(ctrl){
  this.AddChildControl.callParent(ctrl);

  if(Function.isFunction(this.OnChildControlAdded)){
    this.OnChildControlAdded(ctrl);
  }
};
bbbfly.panel._removeChildControl = function(ctrl){
  this.RemoveChildControl.callParent(ctrl);

  if(Function.isFunction(this.OnChildControlRemoved)){
    this.OnChildControlRemoved(ctrl);
  }
};
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
bbbfly.panel._disposeControls = function(){
  var cHolder = this.GetControlsHolder();

  for(var i in cHolder.ChildControls){
    var ctrl = cHolder.ChildControls[i];

    if(Function.isFunction(ctrl.Dispose)){
      ctrl.Dispose();
    }
  }
};
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
bbbfly.envelope._onTrackedControlChanged = function(){
  this.Update(false);
};
bbbfly.envelope._onTrackedControlVisibleChanged = function(){
  if(!Array.isArray(this._trackers)){return;}
  if(this.Visible){return;}

  for(var i in this._trackers){
    bbbfly.envelope._onTrackedControlChange(
      this,this._trackers[i]
    );
  }
};
bbbfly.envelope._onTrackedControlUpdated = function(){
  if(!Array.isArray(this._trackers)){return;}

  for(var i in this._trackers){
    bbbfly.envelope._onTrackedControlChange(
      this,this._trackers[i]
    );
  }
};
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
bbbfly.frame._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.CreateControls(def,ref,node);
};
bbbfly.frame._createControls = function(def,ref,node){
  var refDef = {};

  if(!this.CreateControlsDef(def,refDef)){return;}
  var refs = ngCreateControls(refDef,undefined,node);
  if(!this.SetControlsRef(def,refs)){return;}

  if(!def.ParentReferences){
    this.Controls = {};
    this.Controls.Owner = this;
    ref = this.Controls;
  }
  ngCloneRefs(ref,refs);
};
bbbfly.frame._createControlsDef = function(def,refDef){
  var changed = false;

  if(this.NeedsFramePanel() && (def.FramePanel !== null)){
    if(Object.isObject(def.FramePanel)){
      refDef.FramePanel = ng_CopyVar(def.FramePanel);
    }

    ng_MergeDef(refDef,{
      FramePanel: {
        L:0,T:0,R:0,B:0,
        Type: 'bbbfly.Panel',
        id: this.ID + '_F',
        style: { zIndex: 100 },
        className: 'FramePanel',
        Data: {
          _FrameProxy: null,
          _FrameHtml: ''
        }
      }
    });

    changed = true;
  }

  if(this.NeedsControlsPanel() && (def.ControlsPanel !== null)){
    if(Object.isObject(def.ControlsPanel)){
      refDef.ControlsPanel = ng_CopyVar(def.ControlsPanel);
    }

    var overflowX = bbbfly.Renderer.overflow.hidden;
    var overflowY = bbbfly.Renderer.overflow.hidden;

    if(Object.isObject(def.Data)){
      if(def.Data.hasOwnProperty('OverflowX')){
        overflowX = def.Data.OverflowX;
        delete def.Data.OverflowX;
      }
      if(def.Data.hasOwnProperty('OverflowY')){
        overflowY = def.Data.OverflowY;
        delete def.Data.OverflowY;
      }
    }

    ng_MergeDef(refDef,{
      ControlsPanel: {
        L:0,T:0,R:0,B:0,
        Type: 'bbbfly.Panel',
        id: this.ID + '_P',
        style: { zIndex: 200 },
        Data: {
          OverflowX: overflowX,
          OverflowY: overflowY
        },
        Controls: def.Controls,
        ModifyControls: def.ModifyControls,
        className: 'ControlsPanel'
      }
    });

    delete def.Controls;
    delete def.ModifyControls;

    changed = true;
  }
  return changed;
};
bbbfly.frame._setControlsRef = function(def,refs){
  var changed = false;

  if(refs.FramePanel){
    this.FramePanel = refs.FramePanel;
    this.FramePanel.Owner = this;

    delete refs.FramePanel;
    changed = true;
  }

  if(refs.ControlsPanel){
    this.ControlsPanel = refs.ControlsPanel;
    this.ControlsPanel.Owner = this;

    delete refs.ControlsPanel;
    changed = true;
  }

  return changed;
};
bbbfly.frame._doUpdate = function(node){
  this.DoUpdateControls(node);
  return this.DoUpdate.callParent(node);
};
bbbfly.frame._doUpdateControls = function(node){
  this.DoUpdateFramePanel(node);
  this.DoUpdateControlsPanel(node);
};
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
bbbfly.frame._doChangeState = function(update){
  this.DoChangeState.callParent(update);
  if(!update){this.DoUpdateImages();}
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
bbbfly.frame._doUpdateFrame = function(panel,frame){
  if(!panel){return;}

  var node = panel.Elm();
  if(!node){return;}

  var state = this.GetState();
  var over = state.mouseover;

  state.mouseover = false;
  var proxy = bbbfly.Renderer.FrameProxy(frame,state,this.ID);
  var html = bbbfly.Renderer.FrameHTML(proxy,state);
  state.mouseover = over;

  panel._FrameProxy = proxy;
  if(html === panel._FrameHtml){return;}

  panel._FrameHtml = html;
  node.innerHTML = html;

  if(over){
    bbbfly.Renderer.UpdateFrameHTML(proxy,state);
  }
};
bbbfly.frame._doUpdatePanel = function(panel,dims){
  if(!Object.isObject(panel) || !Function.isFunction(panel.SetBounds)){return;}
  if(!Object.isObject(dims)){return;}

  panel.SetBounds({
    L: dims.L,
    T: dims.T,
    R: dims.R,
    B: dims.B,
    W: null,
    H: null
  });
};
bbbfly.frame._doUpdateFramePanel = function(){
  var fPanel = this.GetFramePanel();
  var fFrame = this.GetFrame();

  this.DoUpdateFrame(fPanel,fFrame);
};
bbbfly.frame._doUpdateControlsPanel = function(){
  var cPanel = this.GetControlsPanel();
  var dims = this.GetFrameDims();

  this.DoUpdatePanel(cPanel,dims);
};
bbbfly.frame._needsFramePanel = function(){
  return !!this.Frame;
}
bbbfly.frame._needsControlsPanel = function(){
  return this.NeedsFramePanel();
}
bbbfly.frame._getFrame = function(){
  return (Object.isObject(this.Frame) ? this.Frame : {});
};
bbbfly.frame._getFrameDims = function(){
  var fPanel = this.GetFramePanel();

  var dims = { L:0, T:0, R:0, B:0, W:undefined, H:undefined };
  if(!Object.isObject(fPanel)){return dims;}

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
bbbfly.PanelGroup = {
  _Groups: {},
  _ControlGroups: {},
  _LastGroupId: 0,
  NewGroupId: bbbfly.panelgroup._newGroupId,
  RegisterControl: bbbfly.panelgroup._registerControl,
  RegisterGroup: bbbfly.panelgroup._registerGroup,
  UnregisterControl: bbbfly.panelgroup._unregisterControl,
  ApplyControlState: bbbfly.panelgroup._applyControlState
};
bbbfly.PanelGroup.state = {
  visible: 1,
  selected: 2
};
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
      OnSetEnabled: null,
      OnEnabledChanged: null,
      OnSetInvalid: null,
      OnInvalidChanged: null,
      OnSetReadOnly: null,
      OnReadOnlyChanged: null,
      OnSetSelected: null,
      OnSelectedChanged: null,
       OnSetOverflow: null,
       OnOverflowChanged: null,
      OnChildControlAdded: null,
      OnChildControlRemoved: null
    },
    Methods: {
      DoCreate: bbbfly.panel._doCreate,
      DoDispose: bbbfly.panel._doDispose,
      DoUpdate: bbbfly.panel._doUpdate,
      DoMouseEnter: bbbfly.panel._doMouseEnter,
      DoMouseLeave: bbbfly.panel._doMouseLeave,
      DoChangeState: bbbfly.panel._doChangeState,
      DoChangeOverflow: bbbfly.panel._doChangeOverflow,
      DoUpdateHtmlClass: bbbfly.panel._doUpdateHtmlClass,
      DoUpdateHtmlState: bbbfly.panel._doUpdateHtmlState,
      DoUpdateHtmlOverflow: bbbfly.panel._doUpdateHtmlOverflow,
      GetState: bbbfly.panel._getState,
      GetClassName: bbbfly.panel._getClassName,
      GetControlsHolder: bbbfly.panel._getControlsHolder,
      SetEnabled: bbbfly.panel._setEnabled,
      SetInvalid: bbbfly.panel._setInvalid,
      SetReadOnly: bbbfly.panel._setReadOnly,
      SetSelected: bbbfly.panel._setSelected,
      SetOverflow: bbbfly.panel._setOverflow,
      AddChildControl: bbbfly.panel._addChildControl,
      RemoveChildControl: bbbfly.panel._removeChildControl,
      CreateControl: bbbfly.panel._createControl,
      DisposeControls: bbbfly.panel._disposeControls
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};
bbbfly.Envelope = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Events: {
      OnTrackedControlChanged: bbbfly.envelope._onTrackedControlChanged
    },
    Methods: {
      TrackControl: bbbfly.envelope._trackControl,
      TrackChildControls: bbbfly.envelope._trackChildControls,
      IsTrackedControlChanged: bbbfly.envelope._isTrackedControlChanged
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
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
      CreateControls: bbbfly.frame._createControls,
      CreateControlsDef: bbbfly.frame._createControlsDef,
      SetControlsRef: bbbfly.frame._setControlsRef,
      DoUpdate: bbbfly.frame._doUpdate,
      DoUpdateControls: bbbfly.frame._doUpdateControls,
      DoMouseEnter: bbbfly.frame._doMouseEnter,
      DoMouseLeave: bbbfly.frame._doMouseLeave,
      DoChangeState: bbbfly.frame._doChangeState,
      DoUpdateImages: bbbfly.frame._doUpdateImages,
      DoUpdateFrame: bbbfly.frame._doUpdateFrame,
      DoUpdatePanel: bbbfly.frame._doUpdatePanel,
      DoUpdateFramePanel: bbbfly.frame._doUpdateFramePanel,
      DoUpdateControlsPanel: bbbfly.frame._doUpdateControlsPanel,
      NeedsFramePanel: bbbfly.frame._needsFramePanel,
      NeedsControlsPanel: bbbfly.frame._needsControlsPanel,
      GetFrame: bbbfly.frame._getFrame,
      GetFrameDims: bbbfly.frame._getFrameDims,
      GetFramePanel: bbbfly.frame._getFramePanel,
      GetControlsPanel: bbbfly.frame._getControlsPanel,
      GetControlsHolder: bbbfly.frame._getControlsHolder
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Envelope',ref,parent);
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
    ngRegisterControlType('bbbfly.Envelope',bbbfly.Envelope);
    ngRegisterControlType('bbbfly.Frame',bbbfly.Frame);
    ngRegisterControlType('bbbfly.Line',bbbfly.Line);
  }
};
