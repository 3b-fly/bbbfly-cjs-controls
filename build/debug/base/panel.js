/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.panelgroup = {};
bbbfly.panel = {};
bbbfly.frame = {};
bbbfly.line = {};
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
bbbfly.panel._setSelected = function(selected,update){
  if(!Boolean.isBoolean(selected)){selected = true;}
  if(selected === this.Selected){return true;}

  if(
    Function.isFunction(this.OnSetSelected)
    && !this.OnSetSelected(selected)
  ){return false;}

  if(!Boolean.isBoolean(update)){update = true;}

  this.Selected = selected;
  this.DoChangeState(update);

  if(Function.isFunction(this.OnSelectedChanged)){
    this.OnSelectedChanged();
  }
  return true;
};
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
bbbfly.frame._doUpdate = function(node){
  this.DoUpdateFrame(node);
  this.DoUpdateControlsPanel(node);
  return this.DoUpdate.callParent(node);
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
bbbfly.frame._doUpdateFrame = function(node){
  if(typeof node === 'undefined'){node = this.Elm();}

  var fPanel = this.GetFramePanel();
  if(!node || !fPanel){return;}

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
      OnSelectedChanged: null
    },
    Methods: {
      DoCreate: bbbfly.panel._doCreate,
      DoDispose: bbbfly.panel._doDispose,
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
      SetReadOnly: bbbfly.panel._setReadOnly,
      SetSelected: bbbfly.panel._setSelected
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
