/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */

var bbbfly = bbbfly || {};
bbbfly.wrapper = {};
bbbfly.wrapper._onCreated = function(wrapper){
  if(wrapper._Stretcher){return;}

  var childParent = wrapper.ControlsPanel ? wrapper.ControlsPanel : wrapper;

  var def = {Type:'ngPanel'};
  wrapper._Stretcher = ngCreateControl(def,undefined,childParent.ID);

  if(wrapper._Stretcher){
    def.parent = childParent.ID;
    def.id = wrapper._Stretcher.ID;

    ngAddChildControl(childParent,wrapper._Stretcher);
    wrapper._Stretcher.Create(def);
  }
};
bbbfly.wrapper._onUpdated = function(){
  var childControls = this.ControlsPanel
    ? this.ControlsPanel.ChildControls : this.ChildControls;
  if(!childControls){return;}

  var opts = bbbfly.wrapper._getWrapperOptions(this);

  var vars = {
    value: {
      position: {start:0,end:0},
      margin: {start:null,end:null}
    }
  };

  switch(opts.Orientation){
    case bbbfly.wrapper.orientation.vertical:
      vars.float = {start:'top',end:'bottom',stretch:'stretch'};
      vars.direction = {start:'top',end:'bottom'};
      vars.padding = {start:'PaddingBottom',end:'PaddingTop'};
      vars.margin = {start:'MarginTop',end:'MarginBottom'};
    break;
    case bbbfly.wrapper.orientation.horizontal:
      vars.float = {start:'left',end:'right',stretch:'stretch'};
      vars.direction = {start:'left',end:'right'};
      vars.padding = {start:'PaddingRight',end:'PaddingLeft'};
      vars.margin = {start:'MarginLeft',end:'MarginRight'};
    break;
    default: return;
  }

  bbbfly.wrapper._overwriteMargin(vars,'start',opts,'padding');
  bbbfly.wrapper._overwriteMargin(vars,'end',opts,'padding');

  var startCtrlsCnt = 0;
  var endCtrlsCnt = 0;
  var stretchCtrls = new Array();
  var childCtrl;
  var childOpts;

  for(var i in childControls){
    childCtrl = childControls[i];
    if(this._Stretcher && (childCtrl === this._Stretcher)){continue;}

    bbbfly.wrapper._trackChildControl(this,childCtrl);
    if(!childCtrl.Visible){continue;}

    childOpts = bbbfly.wrapper._getWrapOptions(childCtrl,opts);

    switch(childOpts.Float){
      case bbbfly.wrapper.float[vars.float.start]:
        bbbfly.wrapper._setMargin(vars,'end',childOpts,'margin');
        bbbfly.wrapper._positionCtrl(childCtrl,vars,'start',opts);
        bbbfly.wrapper._overwriteMargin(vars,'end',childOpts,'margin');
        startCtrlsCnt++;
      break;
      case bbbfly.wrapper.float[vars.float.end]:
        bbbfly.wrapper._setMargin(vars,'start',childOpts,'margin');
        bbbfly.wrapper._positionCtrl(childCtrl,vars,'end',opts);
        bbbfly.wrapper._overwriteMargin(vars,'start',childOpts,'margin');
        endCtrlsCnt++;
      break;
      case bbbfly.wrapper.float[vars.float.stretch]:
        stretchCtrls.push(childCtrl);
      break;
    }
  }

  var placeStretchCtrls = bbbfly.wrapper._canPlaceStretchCtrls(
    this,stretchCtrls,vars,opts
  );

  if(stretchCtrls.length > 0){
    for(var j in stretchCtrls){
      childCtrl = stretchCtrls[j];
      childOpts = bbbfly.wrapper._getWrapOptions(childCtrl,opts);

      if(placeStretchCtrls){
        var ctrlVars = ng_CopyVar(vars);
        bbbfly.wrapper._setMargin(ctrlVars,'start',childOpts,'margin');
        bbbfly.wrapper._setMargin(ctrlVars,'end',childOpts,'margin');
        bbbfly.wrapper._positionCtrl(childCtrl,ctrlVars,'stretch',opts);
      }
      else{
        bbbfly.wrapper._positionCtrl(childCtrl,vars,'hide',opts);
      }
    }
  }

  if(this._Stretcher){this._Stretcher.SetVisible(false);}

  if(opts.AutoSize){
    bbbfly.wrapper._setMargin(vars,'end',opts,'value');
    bbbfly.wrapper._autoSize(this,vars,opts);
  }
  else{
    if(!placeStretchCtrls && this._Stretcher){
      if(endCtrlsCnt < 1){
        bbbfly.wrapper._setMargin(vars,'end',opts,'value');
        bbbfly.wrapper._positionStretcher(this._Stretcher,vars,'start',opts);
        this._Stretcher.SetVisible(true);
      }
      else if(startCtrlsCnt < 1){
        bbbfly.wrapper._setMargin(vars,'start',opts,'value');
        bbbfly.wrapper._positionStretcher(this._Stretcher,vars,'end',opts);
        this._Stretcher.SetVisible(true);
      }
    }
  }
};
bbbfly.wrapper._getWrapperOptions = function(ctrl){
  var opts = ng_CopyVar(ctrl.WrapperOptions);
  if((typeof opts !== 'object') || (opts === null)){opts = {};}
  ng_MergeDef(opts,{
    Orientation: bbbfly.wrapper.orientation.vertical,
    AutoSize: false,
    PaddingTop: null,
    PaddingBottom: null,
    PaddingLeft: null,
    PaddingRight: null,
    TrackChanges: false
  });
  return opts;
},
bbbfly.wrapper._getWrapOptions = function(ctrl,opts){
  var childOpts = ng_CopyVar(ctrl.WrapOptions);
  if((typeof childOpts !== 'object') || (childOpts === null)){childOpts = {};}

  var defOpts = {
    Float: undefined,
    MarginTop: undefined,
    MarginBottom: undefined,
    MarginLeft: undefined,
    MarginRight: undefined,
    TrackChanges: opts.TrackChanges
  };
  switch(opts.Orientation){
    case bbbfly.wrapper.orientation.vertical:
      defOpts.Float = bbbfly.wrapper.float.top;
    break;
    case bbbfly.wrapper.orientation.horizontal:
      defOpts.Float = bbbfly.wrapper.float.left;
    break;
  }

  ng_MergeDef(childOpts,defOpts);
  return childOpts;
},
bbbfly.wrapper._trackChildControl = function(wrapper,ctrl){
  if(
    !ctrl
    || (typeof ctrl.AddEvent !== 'function')
    || (typeof ctrl._trackedBounds !== 'undefined')
  ){return;}

  ctrl.AddEvent('OnVisibleChanged',
    bbbfly.wrapper._onChildControlVisibleChanged,true
  );
  ctrl.AddEvent('OnUpdated',
    bbbfly.wrapper._onChildControlUpdated,true
  );
  ctrl._parentWrapper = wrapper;
  ctrl._trackedBounds = null;
};
bbbfly.wrapper._onChildControlVisibleChanged = function(){
  var opts = bbbfly.wrapper._getWrapperOptions(this._parentWrapper);
  var childOpts = bbbfly.wrapper._getWrapOptions(this,opts);
  if(!childOpts.TrackChanges){return;}

  if(childOpts.Float){this._parentWrapper.Update(false);}
};
bbbfly.wrapper._onChildControlUpdated = function(){
  var opts = bbbfly.wrapper._getWrapperOptions(this._parentWrapper);
  var childOpts = bbbfly.wrapper._getWrapOptions(this,opts);
  if(!childOpts.TrackChanges){return;}

  var ctrlBounds = this.Bounds ? ng_CopyVar(this.Bounds) : {};
  var lastBounds = this._trackedBounds ? this._trackedBounds : {};
  this._trackedBounds = ctrlBounds;

  switch(childOpts.Float){
    case bbbfly.wrapper.float.top:
    case bbbfly.wrapper.float.bottom:
      if(
        (opts.Orientation === bbbfly.wrapper.orientation.vertical)
        && (ctrlBounds.H !== lastBounds.H)
      ){
        this._parentWrapper.Update(false);
      }
    break;
    case bbbfly.wrapper.float.left:
    case bbbfly.wrapper.float.right:
      if(
        (opts.Orientation === bbbfly.wrapper.orientation.horizontal)
        && (ctrlBounds.W !== lastBounds.W)
      ){
        this._parentWrapper.Update(false);
      }
    break;
  }
};
bbbfly.wrapper._setMargin = function(vars,direction,opts,type){
  var newVal = null;
  var revDir = direction;
  switch(direction){
    case 'start': revDir = 'end'; break;
    case 'end': revDir = 'start'; break;
  }
  switch(type){
    case 'margin': newVal = opts[vars.margin[revDir]]; break;
    case 'value': newVal = vars.value.margin[revDir]; break;
  }

  if(typeof newVal === 'number'){
    var oldVal = vars.value.margin[direction];
    if((typeof oldVal !== 'number') || (newVal > oldVal)){
      vars.value.margin[direction] = newVal;
    }
  }

  bbbfly.wrapper._addMargin(vars,direction);
},
bbbfly.wrapper._addMargin = function(vars,direction){
  var addVal = vars.value.margin[direction];
  if(typeof addVal === 'number'){
    switch(direction){
      case 'start': vars.value.position.end += addVal; break;
      case 'end': vars.value.position.start += addVal; break;
    }
  }
},
bbbfly.wrapper._overwriteMargin = function(vars,direction,opts,type){
  var newVal = opts[vars[type][direction]];
  vars.value.margin[direction] = (typeof newVal === 'number') ? newVal : null;
},
bbbfly.wrapper._positionCtrl = function(ctrl,vars,direction,opts){
  var boundNames = null;
  switch(opts.Orientation){
    case bbbfly.wrapper.orientation.vertical:
      boundNames = {start:'T',end:'B',dim:'H'};
    break;
    case bbbfly.wrapper.orientation.horizontal:
      boundNames = {start:'L',end:'R',dim:'W'};
    break;
  default: return;
  }

  var position = vars.value.position;
  var bounds = {};
  switch(direction){
    case 'start':
      bounds[boundNames.start] = position.start;
      bounds[boundNames.end] = undefined;
    break;
    case 'end':
      bounds[boundNames.end] = position.end;
      bounds[boundNames.start] = undefined;
    break;
    case 'hide':
      bounds[boundNames.start] = position.start;
      bounds[boundNames.end] = undefined;
      bounds[boundNames.dim] = 0;
    break;
    case 'stretch':
      bounds[boundNames.start] = position.start;
      bounds[boundNames.end] = position.end;
      bounds[boundNames.dim] = undefined;
    break;
  }
  if(ctrl.SetBounds(bounds)){ctrl.Update();}

  switch(direction){
    case 'start':
    case 'end':
      var dimBound = ctrl.Bounds[boundNames.dim];
      if(typeof dimBound === 'number'){position[direction] += dimBound;}
    break;
  }
},
bbbfly.wrapper._positionStretcher = function(ctrl,vars,direction,opts){
  switch(opts.Orientation){
    case bbbfly.wrapper.orientation.vertical:
      var bounds = {T:undefined,B:undefined,H:0,L:0,R:0,W:undefined};
      switch(direction){
        case 'start': bounds.T = vars.value.position.start; break;
        case 'end': bounds.B = vars.value.position.end; break;
      }
      ctrl.SetBounds(bounds);
    break;
    case bbbfly.wrapper.orientation.horizontal:
      var bounds = {L:undefined,R:undefined,W:0,T:0,B:0,H:undefined};
      switch(direction){
        case 'start': bounds.L = vars.value.position.start; break;
        case 'end': bounds.R = vars.value.position.end; break;
      }
      ctrl.SetBounds(bounds);
    break;
  }
},
bbbfly.wrapper._canPlaceStretchCtrls = function(wrapper,ctrls,vars,opts){
  if(!opts.AutoSize && (ctrls.length > 0)){
    var maxPos = Infinity;
    var root = wrapper.ControlsPanel ? wrapper.ControlsPanel : wrapper;
    var node = root.Elm();
    if(node){
      ng_BeginMeasureElement(node);
      switch(opts.Orientation){
        case bbbfly.wrapper.orientation.vertical:
          maxPos = ng_ClientHeight(node);
        break;
        case bbbfly.wrapper.orientation.horizontal:
          maxPos = ng_ClientWidth(node);
        break;
      }
      ng_EndMeasureElement(node);
    }
    var position = vars.value.position;
    return ((position.start < maxPos) && (position.end < maxPos));
  }
  return false;
},
bbbfly.wrapper._autoSize = function(wrapper,vars,opts){
  var dimension = (vars.value.position.start + vars.value.position.end);

  var cPanel = wrapper.ControlsPanel;
  if(cPanel && cPanel.Bounds){

    switch(opts.Orientation){
      case bbbfly.wrapper.orientation.vertical:
        if(typeof cPanel.Bounds.T === 'number'){dimension += cPanel.Bounds.T;}
        if(typeof cPanel.Bounds.B === 'number'){dimension += cPanel.Bounds.B;}
      break;
      case bbbfly.wrapper.orientation.horizontal:
        if(typeof cPanel.Bounds.L === 'number'){dimension += cPanel.Bounds.L;}
        if(typeof cPanel.Bounds.R === 'number'){dimension += cPanel.Bounds.R;}
      break;
      default: return;
    }
  }

  var autoSized = false;
  switch(opts.Orientation){
    case bbbfly.wrapper.orientation.vertical:
      if(wrapper.SetBounds({ H:dimension })){
        autoSized = true;
        wrapper.Update();
      }
    break;
    case bbbfly.wrapper.orientation.horizontal:
      if(wrapper.SetBounds({ W:dimension })){
        autoSized = true;
        wrapper.Update();
      }
    break;
  }

  if(autoSized && (typeof wrapper.OnAutoSized === 'function')){
    wrapper.OnAutoSized();
  }
};
bbbfly.WrapperPanel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    ScrollBars: ssAuto,
    Data: {
      WrapperOptions: undefined,
      _Stretcher: null
    },
    OnCreated: bbbfly.wrapper._onCreated,
    Events: {
      OnUpdated: bbbfly.wrapper._onUpdated,
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};
bbbfly.WrapperGroup = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    ScrollBars: ssNone,
    Data: {
      WrapperOptions: undefined,
      _Stretcher: null
    },
    OnCreated: bbbfly.wrapper._onCreated,
    Events: {
      OnUpdated: bbbfly.wrapper._onUpdated,
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};
bbbfly.wrapper.orientation = {
  vertical: 1,
  horizontal: 2
};
bbbfly.wrapper.float = {
  none: 0,
  top: 1,
  bottom: 2,
  left: 3,
  right: 4,
  stretch: 5
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_wrapper'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.WrapperPanel',bbbfly.WrapperPanel);
    ngRegisterControlType('bbbfly.WrapperGroup',bbbfly.WrapperGroup);
  }
};

/**
 * @interface ChildControl
 * @memberOf bbbfly.WrapperGroup
 * @description
 *   {@link bbbfly.WrapperGroup|WrapperGroup} child controls can implement
 *   this to define their minimal distance from other child controls
 *   and their float direction.
 *
 * @property {bbbfly.wrapper.wrapOptions} [WrapOptions=undefined]
 */