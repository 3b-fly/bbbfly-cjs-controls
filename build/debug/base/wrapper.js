/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.wrapper = {};
bbbfly.wrapper._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);

  var cHolder = this.GetControlsHolder();

  if(Function.isFunction(cHolder.AddEvent)){
    var wrapper = this;

    cHolder.AddEvent('OnChildControlAdded',function(ctrl){
      wrapper.TrackControl(ctrl,true);
    });
    cHolder.AddEvent('OnChildControlRemoved',function(ctrl){
      wrapper.TrackControl(ctrl,false);
    });
  }

  for(var i in cHolder.ChildControls){
    var ctrl = cHolder.ChildControls[i];
    this.TrackControl(ctrl,true);
  }

  if(!this._Stretcher){
    this._Stretcher = this.CreateChildControl({
      Type:'bbbfly.Panel'
    });
  }
};
bbbfly.wrapper._onUpdate = function(){
  var cHolder = this.GetControlsHolder();
  var opts = bbbfly.wrapper._getWrapperOptions(this);

  cHolder.SetScrollBars(opts.AutoSize ? ssNone : ssAuto);
  return true;
};
bbbfly.wrapper._onUpdated = function(){
  var cHolder = this.GetControlsHolder();
  var cHolderNode = cHolder.Elm();

  var childControls = cHolder.ChildControls;
  if(!childControls){return;}

  var opts = bbbfly.wrapper._getWrapperOptions(this);
  var size = null;

  var vars = {
    value: {
      position: {start:0,end:0},
      margin: {start:null,end:null}
    }
  };

  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      vars.float = {start:'top',end:'bottom',stretch:'stretch'};
      vars.direction = {start:'top',end:'bottom'};
      vars.padding = {start:'PaddingBottom',end:'PaddingTop'};
      vars.margin = {start:'MarginTop',end:'MarginBottom'};

      if(!this._handlingSizeChange && cHolderNode){
        size = ng_ClientWidth(cHolderNode);
      }
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      vars.float = {start:'left',end:'right',stretch:'stretch'};
      vars.direction = {start:'left',end:'right'};
      vars.padding = {start:'PaddingRight',end:'PaddingLeft'};
      vars.margin = {start:'MarginLeft',end:'MarginRight'};

      if(!this._handlingSizeChange && cHolderNode){
        size = ng_ClientHeight(cHolderNode);
      }
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

    if(!childCtrl.Visible){continue;}
    if(this._Stretcher && (childCtrl === this._Stretcher)){continue;}

    childOpts = bbbfly.wrapper._getWrapOptions(childCtrl,opts);

    switch(childOpts.Float){
      case bbbfly.Wrapper.float[vars.float.start]:
        bbbfly.wrapper._setMargin(vars,'end',childOpts,'margin');
        bbbfly.wrapper._positionCtrl(childCtrl,vars,'start',opts);
        bbbfly.wrapper._overwriteMargin(vars,'end',childOpts,'margin');
        startCtrlsCnt++;
      break;
      case bbbfly.Wrapper.float[vars.float.end]:
        bbbfly.wrapper._setMargin(vars,'start',childOpts,'margin');
        bbbfly.wrapper._positionCtrl(childCtrl,vars,'end',opts);
        bbbfly.wrapper._overwriteMargin(vars,'start',childOpts,'margin');
        endCtrlsCnt++;
      break;
      case bbbfly.Wrapper.float[vars.float.stretch]:
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

  if(cHolderNode && !this._handlingSizeChange){
    var finalSize = null;

    switch(opts.Orientation){
      case bbbfly.Wrapper.orientation.vertical:
        finalSize = ng_ClientWidth(cHolderNode);
      break;
      case bbbfly.Wrapper.orientation.horizontal:
        finalSize = ng_ClientHeight(cHolderNode);
      break;
    }

    if(finalSize !== size){
      this._handlingSizeChange = true;
      this.Update();
      this._handlingSizeChange = false;
    }
  }
};
bbbfly.wrapper._isTrackedControlChanged = function(ctrl,options){
  var opts = bbbfly.wrapper._getWrapperOptions(this);
  var childOpts = bbbfly.wrapper._getWrapOptions(ctrl,opts);
  if(!childOpts.TrackChanges){return false;}

  var ctrlFloat = childOpts.Float;
  var optsFloat = options.Float;

  var ctrlVisible = ctrl.Visible;
  var optsVisible = options.Visible;

  var ctrlBounds = ctrl.Bounds ? ctrl.Bounds : {};
  var optsBounds = options.Bounds ? options.Bounds : {};

  options.Float = ctrlFloat;
  options.Visible = ctrlVisible;
  options.Bounds = ng_CopyVar(ctrlBounds);

  if(ctrlFloat !== optsFloat){return true;}
  if(ctrlVisible !== optsVisible){return true;}

  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      if(ctrlBounds.H !== optsBounds.H){
        switch(childOpts.Float){
          case bbbfly.Wrapper.float.top:
          case bbbfly.Wrapper.float.bottom:
          case bbbfly.Wrapper.float.stretch:
            return true;
        }
      }
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      if(ctrlBounds.W !== optsBounds.W){
        switch(childOpts.Float){
          case bbbfly.Wrapper.float.left:
          case bbbfly.Wrapper.float.right:
          case bbbfly.Wrapper.float.stretch:
            return true;
        }
      }
    break;
  }

  return false;
};
bbbfly.wrapper._getWrapperOptions = function(ctrl){
  var opts = ng_CopyVar(ctrl.WrapperOptions);
  if((typeof opts !== 'object') || (opts === null)){opts = {};}
  ng_MergeDef(opts,{
    Orientation: bbbfly.Wrapper.orientation.vertical,
    AutoSize: false,
    PaddingTop: null,
    PaddingBottom: null,
    PaddingLeft: null,
    PaddingRight: null,
    TrackChanges: false
  });
  return opts;
};
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
    case bbbfly.Wrapper.orientation.vertical:
      defOpts.Float = bbbfly.Wrapper.float.top;
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      defOpts.Float = bbbfly.Wrapper.float.left;
    break;
  }

  ng_MergeDef(childOpts,defOpts);
  return childOpts;
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

  if(Number.isNumber(newVal)){
    var oldVal = vars.value.margin[direction];
    if(!Number.isNumber(oldVal) || (newVal > oldVal)){
      vars.value.margin[direction] = newVal;
    }
  }

  bbbfly.wrapper._addMargin(vars,direction);
};
bbbfly.wrapper._addMargin = function(vars,direction){
  var addVal = vars.value.margin[direction];
  if(Number.isNumber(addVal)){
    switch(direction){
      case 'start': vars.value.position.end += addVal; break;
      case 'end': vars.value.position.start += addVal; break;
    }
  }
};
bbbfly.wrapper._overwriteMargin = function(vars,direction,opts,type){
  var newVal = opts[vars[type][direction]];
  vars.value.margin[direction] = Number.isNumber(newVal) ? newVal : null;
};
bbbfly.wrapper._positionCtrl = function(ctrl,vars,direction,opts){
  var boundNames = null;
  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      boundNames = {start:'T',end:'B',dim:'H'};
    break;
    case bbbfly.Wrapper.orientation.horizontal:
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
      if(Number.isNumber(dimBound)){position[direction] += dimBound;}
    break;
  }
};
bbbfly.wrapper._positionStretcher = function(ctrl,vars,direction,opts){
  var margin = vars.value.margin[direction];
  var dim = (Number.isNumber(margin) && (margin > 0)) ? 1 : 0;

  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      var bounds = {T:undefined,B:undefined,H:dim,L:0,R:0,W:undefined};
      switch(direction){
        case 'start': bounds.T = (vars.value.position.start - dim); break;
        case 'end': bounds.B = (vars.value.position.end - dim); break;
      }
      ctrl.SetBounds(bounds);
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      var bounds = {L:undefined,R:undefined,W:dim,T:0,B:0,H:undefined};
      switch(direction){
        case 'start': bounds.L = (vars.value.position.start - dim); break;
        case 'end': bounds.R = (vars.value.position.end - dim); break;
      }
      ctrl.SetBounds(bounds);
    break;
  }
};
bbbfly.wrapper._canPlaceStretchCtrls = function(wrapper,ctrls,vars,opts){
  if(!opts.AutoSize && (ctrls.length > 0)){
    var cHolder = wrapper.GetControlsHolder();
    var cHolderNode = cHolder.Elm();
    var maxPos = Infinity;

    if(cHolderNode){
      ng_BeginMeasureElement(cHolderNode);
      switch(opts.Orientation){
        case bbbfly.Wrapper.orientation.vertical:
          maxPos = ng_ClientHeight(cHolderNode);
        break;
        case bbbfly.Wrapper.orientation.horizontal:
          maxPos = ng_ClientWidth(cHolderNode);
        break;
      }
      ng_EndMeasureElement(cHolderNode);
    }
    var position = vars.value.position;
    return ((position.start < maxPos) && (position.end < maxPos));
  }
  return false;
};
bbbfly.wrapper._autoSize = function(wrapper,vars,opts){
  var dimension = (vars.value.position.start + vars.value.position.end);

  var cPanel = wrapper.GetControlsPanel();
  if(cPanel && cPanel.Bounds){

    switch(opts.Orientation){
      case bbbfly.Wrapper.orientation.vertical:
        if(Number.isNumber(cPanel.Bounds.T)){dimension += cPanel.Bounds.T;}
        if(Number.isNumber(cPanel.Bounds.B)){dimension += cPanel.Bounds.B;}
      break;
      case bbbfly.Wrapper.orientation.horizontal:
        if(Number.isNumber(cPanel.Bounds.L)){dimension += cPanel.Bounds.L;}
        if(Number.isNumber(cPanel.Bounds.R)){dimension += cPanel.Bounds.R;}
      break;
      default: return;
    }
  }

  var autoSized = false;
  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      if(wrapper.SetBounds({ H:dimension })){
        autoSized = true;
        wrapper.Update();
      }
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      if(wrapper.SetBounds({ W:dimension })){
        autoSized = true;
        wrapper.Update();
      }
    break;
  }

  if(autoSized && Function.isFunction(wrapper.OnAutoSized)){
    wrapper.OnAutoSized();
  }
};
bbbfly.Wrapper = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    ScrollBars: ssNone,
    Data: {
      WrapperOptions: undefined,
      _Stretcher: null
    },
    Events: {
      OnUpdate: bbbfly.wrapper._onUpdate,
      OnUpdated: bbbfly.wrapper._onUpdated,
      OnAutoSized: null
    },
    Methods: {
      DoCreate: bbbfly.wrapper._doCreate,
      IsTrackedControlChanged: bbbfly.wrapper._isTrackedControlChanged
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
bbbfly.Wrapper.orientation = {
  vertical: 1,
  horizontal: 2
};
bbbfly.Wrapper.float = {
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
    ngRegisterControlType('bbbfly.Wrapper',bbbfly.Wrapper);
  }
};

/**
 * @interface ChildControl
 * @memberOf bbbfly.Wrapper
 *
 * @description
 *   {@link bbbfly.Wrapper|Wrapper} child controls can implement
 *   this to define their minimal distance from other child controls
 *   and their float direction.
 *
 * @property {bbbfly.Wrapper.wrapOptions} [WrapOptions=undefined]
 */