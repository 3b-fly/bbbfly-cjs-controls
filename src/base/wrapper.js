/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage wrapper
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.wrapper = {};

/** @ignore */
bbbfly.wrapper._onCreated = function(wrapper){
  var cPanel = wrapper.GetControlsPanel();
  wrapper.SetScrollBars(cPanel ? ssNone : ssAuto);

  if(!wrapper._Stretcher){
    var def = {Type:'bbbfly.Panel'};
    var cHolder = wrapper.GetControlsHolder();
    wrapper._Stretcher = ngCreateControl(def,undefined,cHolder.ID);

    if(wrapper._Stretcher){
      def.parent = cHolder.ID;
      def.id = wrapper._Stretcher.ID;

      ngAddChildControl(cHolder,wrapper._Stretcher);
      wrapper._Stretcher.Create(def);
    }
  }
};

/** @ignore */
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
    if(this._Stretcher && (childCtrl === this._Stretcher)){continue;}

    bbbfly.wrapper._trackChildControl(this,childCtrl);
    if(!childCtrl.Visible){continue;}

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

/** @ignore */
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
},

/** @ignore */
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
},

/** @ignore */
bbbfly.wrapper._trackChildControl = function(wrapper,ctrl){
  if(
    !ctrl
    || (typeof ctrl._trackedBounds !== 'undefined')
    || (typeof ctrl._trackedFloat !== 'undefined')
    || !Function.isFunction(ctrl.AddEvent)
  ){return;}

  ctrl.AddEvent('OnVisibleChanged',
    bbbfly.wrapper._onChildControlVisibleChanged,true
  );
  ctrl.AddEvent('OnUpdated',
    bbbfly.wrapper._onChildControlUpdated,true
  );
  ctrl._parentWrapper = wrapper;
  ctrl._trackedBounds = null;
  ctrl._trackedFloat = null;
};

/** @ignore */
bbbfly.wrapper._onChildControlVisibleChanged = function(){
  var opts = bbbfly.wrapper._getWrapperOptions(this._parentWrapper);
  var childOpts = bbbfly.wrapper._getWrapOptions(this,opts);
  if(!childOpts.TrackChanges){return;}

  if(childOpts.Float){this._parentWrapper.Update(false);}
};

/** @ignore */
bbbfly.wrapper._onChildControlUpdated = function(){
  var opts = bbbfly.wrapper._getWrapperOptions(this._parentWrapper);
  var childOpts = bbbfly.wrapper._getWrapOptions(this,opts);
  if(!childOpts.TrackChanges){return;}

  var ctrlBounds = this.Bounds ? ng_CopyVar(this.Bounds) : {};
  var lastBounds = this._trackedBounds ? this._trackedBounds : {};
  this._trackedBounds = ctrlBounds;

  var ctrlFloat = childOpts.Float;
  var lastFloat = this._trackedFloat;
  this._trackedFloat = ctrlFloat;

  if(ctrlFloat !== lastFloat){
    this._parentWrapper.Update(false);
    return;
  }

  switch(opts.Orientation){
    case bbbfly.Wrapper.orientation.vertical:
      if(ctrlBounds.H === lastBounds.H){return;}

      if(
        (childOpts.Float === bbbfly.Wrapper.float.top)
        || (childOpts.Float === bbbfly.Wrapper.float.bottom)
        || (childOpts.Float === bbbfly.Wrapper.float.stretch)
      ){
        this._parentWrapper.Update(false);
      }
    break;
    case bbbfly.Wrapper.orientation.horizontal:
      if(ctrlBounds.W === lastBounds.W){return;}

      if(
        (childOpts.Float === bbbfly.Wrapper.float.left)
        || (childOpts.Float === bbbfly.Wrapper.float.right)
        || (childOpts.Float === bbbfly.Wrapper.float.stretch)
      ){
        this._parentWrapper.Update(false);
      }
    break;
  }
};

/** @ignore */
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
},

/** @ignore */
bbbfly.wrapper._addMargin = function(vars,direction){
  var addVal = vars.value.margin[direction];
  if(Number.isNumber(addVal)){
    switch(direction){
      case 'start': vars.value.position.end += addVal; break;
      case 'end': vars.value.position.start += addVal; break;
    }
  }
},

/** @ignore */
bbbfly.wrapper._overwriteMargin = function(vars,direction,opts,type){
  var newVal = opts[vars[type][direction]];
  vars.value.margin[direction] = Number.isNumber(newVal) ? newVal : null;
},

/** @ignore */
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
},

/** @ignore */
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
},

/** @ignore */
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
},

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends bbbfly.Panel
 *
 * @description
 *   Panel which handles its child controls position.
 *   Child controls can implement
 *   {@link bbbfly.Wrapper.ChildControl|ChildControl} interface.
 *
 * @inpackage wrapper
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.Wrapper.wrapperOptions} [WrapperOptions=undefined]
 */
bbbfly.Wrapper = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      WrapperOptions: undefined,

      /** @private */
      _Stretcher: null
    },
    /** @private */
    OnCreated: bbbfly.wrapper._onCreated,
    Events: {
      /** @private */
      OnUpdated: bbbfly.wrapper._onUpdated,
      /**
       * @event
       * @name OnAutoSized
       * @memberof bbbfly.Wrapper#
       */
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for
 *   {@link bbbfly.Wrapper.wrapperOptions|bbbfly.Wrapper.wrapperOptions.Orientation}
 */
bbbfly.Wrapper.orientation = {
  vertical: 1,
  horizontal: 2
};

/**
 * @enum {integer}
 * @description
 *   Possible values for
 *   {@link bbbfly.Wrapper.wrapOptions|bbbfly.Wrapper.wrapOptions.Float}
 */
bbbfly.Wrapper.float = {
  none: 0,
  top: 1,
  bottom: 2,
  left: 3,
  right: 4,
  stretch: 5
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_wrapper'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Wrapper',bbbfly.Wrapper);
  }
};

/**
 * @typedef {object} wrapperOptions
 * @memberOf bbbfly.Wrapper
 *
 * @property {bbbfly.Wrapper.orientation} [Orientation=vertical]
 * @property {boolean} [AutoSize=false] - If resize to wrap all child controls
 * @property {px} [PaddingTop=null] - used with vertical orientation
 * @property {px} [PaddingBottom=null] - used with vertical orientation
 * @property {px} [PaddingLeft=null] - used with horizontal orientation
 * @property {px} [PaddingRight=null] - used with horizontal orientation
 * @property {boolean} [TrackChanges=false] - If track child control changes
 */

/**
 * @typedef {object} wrapOptions
 * @memberOf bbbfly.Wrapper
 *
 * @property {bbbfly.Wrapper.float} [Float=top|left] - default by orientation
 * @property {px} [MarginTop=undefined] - used with vertical orientation
 * @property {px} [MarginBottom=undefined] - used with vertical orientation
 * @property {px} [MarginLeft=undefined] - used with horizontal orientation
 * @property {px} [MarginRight=undefined] - used with horizontal orientation
 * @property {boolean} [TrackChanges=false] - Overrides wrapper option
 */

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