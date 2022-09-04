/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.bar = {};
bbbfly.bar._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.TrackChildControls();

  if(!this._Stretcher){
    this._Stretcher = this.CreateControl({
      Type:'bbbfly.Panel',
      W:1,H:1,Data: {Visible: false}
    });
  }
};
bbbfly.bar._createControlsDef = function(def,refDef){
  var changed = this.CreateControlsDef.callParent(def,refDef);

  if(this.NeedsSlidePanel() && (def.SlidePanel !== null)){
    if(Object.isObject(def.SlidePanel)){
      refDef.SlidePanel = ng_CopyVar(def.SlidePanel);
    }

    ng_MergeDef(refDef,{
      SlidePanel: {
        L:0,T:0,R:0,B:0,
        Type: 'bbbfly.Panel',
        id: this.ID + '_S',
        style: { zIndex: 150 },
        className: 'SlidePanel',
        Data: {
          _FrameProxy: null,
          _FrameHtml: ''
        }
      }
    });

    changed = true;
  }
  return changed;
};
bbbfly.bar._setControlsRef = function(def,refs){
  var changed = this.SetControlsRef.callParent(def,refs);

  if(refs.SlidePanel){
    this.SlidePanel = refs.SlidePanel;
    this.SlidePanel.Owner = this;

    delete refs.SlidePanel;
    changed = true;
  }
  return changed;
};
bbbfly.bar._onUpdate = function(){
  var cHolder = this.GetControlsHolder();

  if(cHolder && Function.isFunction(cHolder.SetOverflow)){
    var opts = bbbfly.bar._getBarOptions(this);
    var autosize = bbbfly.bar._getAutoSize(opts);

    var overflowMajor = (autosize.major === bbbfly.Bar.autosize.none)
      ? bbbfly.Renderer.overflow.auto
      : bbbfly.Renderer.overflow.hidden;

    var overflowMinor = (autosize.minor === bbbfly.Bar.autosize.none)
      ? bbbfly.Renderer.overflow.auto
      : bbbfly.Renderer.overflow.hidden;

    switch(opts.Orientation){
      case bbbfly.Bar.orientation.vertical:
        cHolder.SetOverflow(overflowMinor,overflowMajor,false);
      break;
      case bbbfly.Bar.orientation.horizontal:
        cHolder.SetOverflow(overflowMajor,overflowMinor,false);
      break;
    }
  }
  return true;
};
bbbfly.bar._onUpdated = function(){
  var cHolder = this.GetControlsHolder();
  var cHolderNode = cHolder.Elm();

  var childControls = cHolder.ChildControls;
  if(!childControls){return;}

  var opts = bbbfly.bar._getBarOptions(this);

  var vars = {
    value: {
      size: {major:0,minor:0},
      position: {major:0,minor:0},
      margin: {major:0,minor:0},

      idx: {major:0,minor:0},
      max: {
        pos: {major:0,minor:0},
        mpos: {major:0,minor:0}
      }
    }
  };

  switch(opts.Orientation){
    case bbbfly.Bar.orientation.vertical:
      switch(opts.Float){
        case bbbfly.Bar.float.left_top:
          vars.direction = {
            major: {start:'top',end:'bottom'},
            minor: {start:'left',end:'right'}
          };
        break;
        case bbbfly.Bar.float.right_top:
          vars.direction = {
            major: {start:'top',end:'bottom'},
            minor: {start:'right',end:'left'}
          };
        break;
        case bbbfly.Bar.float.left_bottom:
          vars.direction = {
            major: {start:'bottom',end:'top'},
            minor: {start:'left',end:'right'}
          };
        break;
        case bbbfly.Bar.float.right_bottom:
          vars.direction = {
            major: {start:'bottom',end:'top'},
            minor: {start:'right',end:'left'}
          };
        break;
      }

      if(cHolderNode){
        ng_BeginMeasureElement(cHolderNode);

        vars.value.size = {
          major: ng_ClientHeight(cHolderNode),
          minor: ng_ClientWidth(cHolderNode)
        };

        ng_EndMeasureElement(cHolderNode);
      }
    break;
    case bbbfly.Bar.orientation.horizontal:
      switch(opts.Float){
        case bbbfly.Bar.float.left_top:
          vars.direction = {
            major: {start:'left',end:'right'},
            minor: {start:'top',end:'bottom'}
          };
        break;
        case bbbfly.Bar.float.right_top:
          vars.direction = {
            major: {start:'right',end:'left'},
            minor: {start:'top',end:'bottom'}
          };
        break;
        case bbbfly.Bar.float.left_bottom:
          vars.direction = {
            major: {start:'left',end:'right'},
            minor: {start:'bottom',end:'top'}
          };
        break;
        case bbbfly.Bar.float.right_bottom:
          vars.direction = {
            major: {start:'right',end:'left'},
            minor: {start:'bottom',end:'top'}
          };
        break;
      }

      if(cHolderNode){
        ng_BeginMeasureElement(cHolderNode);

        vars.value.size = {
          major: ng_ClientWidth(cHolderNode),
          minor: ng_ClientHeight(cHolderNode)
        };

        ng_EndMeasureElement(cHolderNode);
      }
    break;
    default: return;
  }

  vars.value.autosize = bbbfly.bar._getAutoSize(opts);
  vars.value.padding = bbbfly.bar._getPaddings(vars,opts);

  vars.value.margin.major = vars.value.padding.major.start;
  vars.value.margin.minor = vars.value.padding.minor.start;

  for(var i in childControls){
    var childCtrl = childControls[i];

    if(!childCtrl.Visible){continue;}
    if(this._Stretcher && (childCtrl === this._Stretcher)){continue;}

    var childOpts = bbbfly.bar._getItemOptions(childCtrl,opts);
    var majorLimit = null;

    if((vars.value.autosize.major === bbbfly.Bar.autosize.none)&& (vars.value.idx.major > 0)){
      majorLimit = vars.value.size.major;
    }

    if(!bbbfly.bar._positionCtrl(childCtrl,vars,childOpts,majorLimit)){
      bbbfly.bar._newLine(vars);
      bbbfly.bar._positionCtrl(childCtrl,vars,childOpts);
    }

    vars.value.idx.major += 1;
  }

  bbbfly.bar._closeLines(vars);
  bbbfly.bar._autoSize(this,vars);

  if(this._Stretcher){
    bbbfly.bar._positionStretcher(this._Stretcher,vars);
  }
};
bbbfly.bar._doUpdateControls = function(node){
  this.DoUpdateFramePanel(node);
  this.DoUpdateSlidePanel(node);
  this.DoUpdateControlsPanel(node);
};
bbbfly.bar._doUpdateSlidePanel = function(){
  var sPanel = this.GetSlidePanel();
  var dims = this.GetFrameDims();

  this.DoUpdatePanel(sPanel,dims);
};
bbbfly.bar._needsSlidePanel = function(){
  return !!this.SlideFrame;
}
bbbfly.bar._needsControlsPanel = function(){
  return this.NeedsSlidePanel() || this.NeedsFramePanel();
}
bbbfly.bar._isTrackedControlChanged = function(ctrl,options){
  var opts = bbbfly.bar._getBarOptions(this);
  var childOpts = bbbfly.bar._getItemOptions(ctrl,opts);
  if(!childOpts.TrackChanges){return false;}

  var ctrlVisible = ctrl.Visible;
  var optsVisible = options.Visible;

  var ctrlBounds = ctrl.Bounds ? ctrl.Bounds : {};
  var optsBounds = options.Bounds ? options.Bounds : {};

  options.Visible = ctrlVisible;
  options.Bounds = ng_CopyVar(ctrlBounds);

  if(ctrlVisible !== optsVisible){return true;}

  if(
    (ctrlBounds.H !== optsBounds.H)
    ||(ctrlBounds.W !== optsBounds.W)
   ){
    return true;
  }

  return false;
};
bbbfly.bar._getSlideFrame = function(){
  return (Object.isObject(this.SlideFrame) ? this.SlideFrame : {});
};
bbbfly.bar._getSlidePanel = function(){
  return this.SlidePanel ? this.SlidePanel : null;
};
bbbfly.bar._getSlideDims = function(){
  var sPanel = this.GetSlidePanel();

  var fDims = this.GetFrameDims();
  if(!Object.isObject(sPanel)){return fDims;}

  var sDims = { L:0, T:0, R:0, B:0, W:undefined, H:undefined };

  var sBounds = sPanel.Bounds;
  var sProxy = sPanel._FrameProxy;

  if(Object.isObject(sBounds)){
    if(Number.isInteger(sBounds.L)){sDims.L += sBounds.L;}
    if(Number.isInteger(sBounds.T)){sDims.T += sBounds.T;}
    if(Number.isInteger(sBounds.R)){sDims.R += sBounds.R;}
    if(Number.isInteger(sBounds.B)){sDims.B += sBounds.B;}
  }

  if(Object.isObject(sProxy)){
    if(Number.isInteger(sProxy.L.W)){sDims.L += sProxy.L.W;}
    if(Number.isInteger(sProxy.T.H)){sDims.T += sProxy.T.H;}
    if(Number.isInteger(sProxy.R.W)){sDims.R += sProxy.R.W;}
    if(Number.isInteger(sProxy.B.H)){sDims.B += sProxy.B.H;}
    if(Number.isInteger(sProxy.C.W)){sDims.W = sProxy.C.W;}
    if(Number.isInteger(sProxy.C.H)){sDims.H = sProxy.C.H;}
  }

  return {
    L: (sDims.L > fDims.L) ? sDims.L : fDims.L,
    T: (sDims.T > fDims.T) ? sDims.T : fDims.T,
    R: (sDims.R > fDims.R) ? sDims.R : fDims.R,
    B: (sDims.B > fDims.B) ? sDims.B : fDims.B,
    W: (sDims.W > fDims.W) ? sDims.W : fDims.W,
    H: (sDims.H > fDims.H) ? sDims.H : fDims.H
  };
};
bbbfly.bar._getBarOptions = function(ctrl){
  var opts = ng_CopyVar(ctrl.BarOptions);
  if((typeof opts !== 'object') || (opts === null)){opts = {};}

  ng_MergeDef(opts,{
    Orientation: bbbfly.Bar.orientation.horizontal,
    Float: bbbfly.Bar.float.left_top,
    HAutoSize: bbbfly.Bar.autosize.none,
    VAutoSize: bbbfly.Bar.autosize.none,
    PaddingTop: null,
    PaddingBottom: null,
    PaddingLeft: null,
    PaddingRight: null,
    TrackChanges: false
  });
  return opts;
};
bbbfly.bar._getItemOptions = function(ctrl,opts){
  var childOpts = ng_CopyVar(ctrl.BarItemOptions);
  if((typeof childOpts !== 'object') || (childOpts === null)){childOpts = {};}

  var defOpts = {
    MarginTop: undefined,
    MarginBottom: undefined,
    MarginLeft: undefined,
    MarginRight: undefined,
    TrackChanges: opts.TrackChanges
  };

  ng_MergeDef(childOpts,defOpts);
  return childOpts;
};
bbbfly.bar._getAutoSize = function(opts){
  var autosize = {
    major: bbbfly.Bar.autosize.none,
    minor: bbbfly.Bar.autosize.none
  };

  switch(opts.Orientation){
    case bbbfly.Bar.orientation.vertical:
      if(Number.isInteger(opts.VAutoSize)){autosize.major = opts.VAutoSize;}
      if(Number.isInteger(opts.HAutoSize)){autosize.minor = opts.HAutoSize;}
    break;
    case bbbfly.Bar.orientation.horizontal:
      if(Number.isInteger(opts.HAutoSize)){autosize.major = opts.HAutoSize;}
      if(Number.isInteger(opts.VAutoSize)){autosize.minor = opts.VAutoSize;}
    break;
  }

  return autosize;
};
bbbfly.bar._getMargins = function(vars,opts){
  return {
    major: {
      start: bbbfly.bar._getMargin(vars.direction.major.start,opts),
      end: bbbfly.bar._getMargin(vars.direction.major.end,opts)
    },
    minor: {
      start: bbbfly.bar._getMargin(vars.direction.minor.start,opts),
      end: bbbfly.bar._getMargin(vars.direction.minor.end,opts)
    }
  };
};
bbbfly.bar._getMargin = function(dir,opts){
  var val = null;
  if(opts){
    switch(dir){
      case 'left': val = opts.MarginLeft; break;
      case 'right': val = opts.MarginRight; break;
      case 'top': val = opts.MarginTop; break;
      case 'bottom': val = opts.MarginBottom; break;
    }
  }
  return Number.isInteger(val) ? val : 0;
};
bbbfly.bar._getPaddings = function(vars,opts){
  var dirs = vars.direction;

  return {
    major: {
      start: bbbfly.bar._getPadding(dirs.major.start,opts),
      end: bbbfly.bar._getPadding(dirs.major.end,opts)
    },
    minor: {
      start: bbbfly.bar._getPadding(dirs.minor.start,opts),
      end: bbbfly.bar._getPadding(dirs.minor.end,opts)
    }
  };
};
bbbfly.bar._getPadding = function(dir,opts){
  var val = null;
  switch(dir){
    case 'left': val = opts.PaddingLeft; break;
    case 'right': val = opts.PaddingRight; break;
    case 'top': val = opts.PaddingTop; break;
    case 'bottom': val = opts.PaddingBottom; break;
  }
  return Number.isInteger(val) ? val : 0;
};
bbbfly.bar._getBoundNames = function(vars){
  var boundNames = {};
  switch(vars.direction.major.start){
    case 'left': boundNames.major = {start:'L',end:'R',dim:'W'}; break;
    case 'right': boundNames.major = {start:'R',end:'L',dim:'W'}; break;
    case 'top': boundNames.major = {start:'T',end:'B',dim:'H'}; break;
    case 'bottom': boundNames.major = {start:'B',end:'T',dim:'H'}; break;
    default: return null;
  }

  switch(vars.direction.minor.start){
    case 'left': boundNames.minor = {start:'L',end:'R',dim:'W'}; break;
    case 'right': boundNames.minor = {start:'R',end:'L',dim:'W'}; break;
    case 'top': boundNames.minor = {start:'T',end:'B',dim:'H'}; break;
    case 'bottom': boundNames.minor = {start:'B',end:'T',dim:'H'}; break;
    default: return null;
  }
  return boundNames;
};
bbbfly.bar._getFrameNames = function(vars){
  return {
    major: {
      start: String.capitalize(vars.direction.major.start),
      end: String.capitalize(vars.direction.major.end)
    },
    minor: {
      start: String.capitalize(vars.direction.minor.start),
      end: String.capitalize(vars.direction.minor.end)
    }
  };
};
bbbfly.bar._positionCtrl = function(ctrl,vars,childOpts,majorLimit){
  var boundNames = bbbfly.bar._getBoundNames(vars);
  if(!Object.isObject(boundNames)){return false;}

  var ctrlMargins = bbbfly.bar._getMargins(vars,childOpts);

  var majorMargin = vars.value.margin.major;
  var minorMargin = vars.value.margin.minor;

  if(ctrlMargins.major.start > majorMargin){
    majorMargin = ctrlMargins.major.start;
  }
  if(ctrlMargins.minor.start > minorMargin){
    minorMargin = ctrlMargins.minor.start;
  }

  var majorPos = (vars.value.position.major + majorMargin);
  var minorPos = (vars.value.position.minor + minorMargin);

  var bounds = {};
  bounds[boundNames.major.start] = majorPos;
  bounds[boundNames.minor.start] = minorPos;
  bounds[boundNames.major.end] = undefined;
  bounds[boundNames.minor.end] = undefined;

  if(ctrl.SetBounds(bounds)){ctrl.Update();}
  var ctrlNode = ctrl.Elm();

  if(ctrlNode){
    ng_BeginMeasureElement(ctrlNode);

    switch(boundNames.major.dim){
      case 'W':
        majorPos += ng_ClientWidth(ctrlNode);
        minorPos += ng_ClientHeight(ctrlNode);
      break;
      case 'H':
        majorPos += ng_ClientHeight(ctrlNode);
        minorPos += ng_ClientWidth(ctrlNode);
      break;
    }

    ng_EndMeasureElement(ctrlNode);
  }

  if(Number.isInteger(majorLimit)){
    var endMargin = ctrlMargins.major.end;

    if(vars.value.padding.major.end > endMargin){
      endMargin = vars.value.padding.major.end;
    }

    if((majorPos+endMargin) > majorLimit){
      return false;
    }
  }

  if(majorPos > vars.value.max.pos.major){
    vars.value.max.pos.major = majorPos;
  }

  if(minorPos > vars.value.max.pos.minor){
    vars.value.max.pos.minor = minorPos;
  }

  vars.value.position.major = majorPos;
  vars.value.margin.major = ctrlMargins.major.end;

  majorPos += ctrlMargins.major.end;
  minorPos += ctrlMargins.minor.end;

  if(majorPos > vars.value.max.mpos.major){
    vars.value.max.mpos.major = majorPos;
  }

  if(minorPos > vars.value.max.mpos.minor){
    vars.value.max.mpos.minor = minorPos;
  }

  return true;
};
bbbfly.bar._newLine = function(vars){
  var vals = vars.value;

  vals.position.major = 0;
  vals.position.minor = vals.max.pos.minor;

  vals.margin.major = vars.value.padding.major.start;
  vals.margin.minor = (vals.max.mpos.minor - vals.max.pos.minor);

  vals.idx.major = 0;
  vals.idx.minor += 1;
};
bbbfly.bar._closeLines = function(vars){
  var vals = vars.value;

  vals.position.major = vals.max.pos.major;
  vals.position.minor = vals.max.pos.minor;

  vals.margin.major = (vals.max.mpos.major - vals.max.pos.major);
  vals.margin.minor = (vals.max.mpos.minor - vals.max.pos.minor);

  if(vars.value.padding.major.end > vals.margin.major){
    vals.margin.major = vars.value.padding.major.end;
  }
  if(vars.value.padding.minor.end > vals.margin.minor){
    vals.margin.minor = vars.value.padding.minor.end;
  }
};
bbbfly.bar._positionStretcher = function(ctrl,vars){
  var vals = vars.value;

  if(
    ((vals.autosize.major === bbbfly.Bar.autosize.none) && (vals.margin.major > 0))
    || ((vals.autosize.minor === bbbfly.Bar.autosize.none) && (vals.margin.minor > 0))
  ){
    vals.margin.major -= 1;
    vals.margin.minor -= 1;

    bbbfly.bar._positionCtrl(ctrl,vars);
    ctrl.SetVisible(true);
    return;
  }
  ctrl.SetVisible(false);
};
bbbfly.bar._autoSize = function(bar,vars){
  if(bbbfly.bar._stretch(bar,vars) || bbbfly.bar._slide(bar,vars)){
    if(Function.isFunction(bar.OnAutoSized)){bar.OnAutoSized();}
  }
};
bbbfly.bar._stretch = function(bar,vars){
  var vals = vars.value;

  var stretchMajor = (vals.autosize.major === bbbfly.Bar.autosize.stretch);
  var stretchMinor = (vals.autosize.minor === bbbfly.Bar.autosize.stretch);
  if(!stretchMajor && !stretchMinor){return false;}

  var boundNames = bbbfly.bar._getBoundNames(vars);
  if(!Object.isObject(boundNames)){return true;}

  var dims = {
    major: (vals.position.major + vals.margin.major),
    minor: (vals.position.minor + vals.margin.minor)
  };

  var cPanel = bar.GetControlsPanel();

  if(cPanel && cPanel.Bounds){
    var majorStart = cPanel.Bounds[boundNames.major.start];
    var majorEnd = cPanel.Bounds[boundNames.major.end];
    var minorStart = cPanel.Bounds[boundNames.minor.start];
    var minorEnd = cPanel.Bounds[boundNames.minor.end];

    if(Number.isInteger(majorStart)){dims.major += majorStart;}
    if(Number.isInteger(majorEnd)){dims.major += majorEnd;}
    if(Number.isInteger(minorStart)){dims.minor += minorStart;}
    if(Number.isInteger(minorEnd)){dims.minor += minorEnd;}
  }

  var bounds = {};
  if(stretchMajor){bounds[boundNames.major.dim] = dims.major;}
  if(stretchMinor){bounds[boundNames.minor.dim] = dims.minor;}

  if(bar.SetBounds(bounds)){bar.Update(false);}
  return true;
};
bbbfly.bar._slide = function(bar,vars){
  var vals = vars.value;

  var slideMajor = (vals.autosize.major === bbbfly.Bar.autosize.slide);
  var slideMinor = (vals.autosize.minor === bbbfly.Bar.autosize.slide);
  if(!slideMajor && !slideMinor){return false;}

  var frameNames = bbbfly.bar._getFrameNames(vars);
  if(!Object.isObject(frameNames)){return true;}

  var sPanel = bar.GetSlidePanel();
  if(!sPanel){return true;}

  var size = vals.size;
  var pos = vals.max.pos;

  if(slideMajor){slideMajor = (size.major < pos.major);}
  if(slideMinor){slideMinor = (size.minor < pos.minor);}

  var sFrame = (slideMajor || slideMinor) ? bar.GetSlideFrame() : null;

  if(Object.isObject(sFrame)){
    sFrame = ng_CopyVar(sFrame);

    if(!slideMajor){
      delete sFrame[frameNames.major.start];
      delete sFrame[frameNames.major.end];
    }

    if(!slideMinor){
      delete sFrame[frameNames.minor.start];
      delete sFrame[frameNames.minor.end];
    }
  }

  bar.DoUpdateFrame(sPanel,sFrame);

  var cPanel = bar.GetControlsPanel();
  if(!cPanel){return true;}

  var dims = bar.GetSlideDims();
  bar.DoUpdatePanel(cPanel,dims);

  return true;
};
bbbfly.Bar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      BarOptions: undefined,
      SlideFrame: undefined,
      _Stretcher: null
    },
    SlidePanel: undefined,
    Events: {
      OnUpdate: bbbfly.bar._onUpdate,
      OnUpdated: bbbfly.bar._onUpdated,
      OnAutoSized: null
    },
    Methods: {
      DoCreate: bbbfly.bar._doCreate,
      CreateControlsDef: bbbfly.bar._createControlsDef,
      SetControlsRef: bbbfly.bar._setControlsRef,
      DoUpdateControls: bbbfly.bar._doUpdateControls,
      DoUpdateSlidePanel: bbbfly.bar._doUpdateSlidePanel,
      NeedsSlidePanel: bbbfly.bar._needsSlidePanel,
      NeedsControlsPanel: bbbfly.bar._needsControlsPanel,
      IsTrackedControlChanged: bbbfly.bar._isTrackedControlChanged,
      GetSlideFrame: bbbfly.bar._getSlideFrame,
      GetSlidePanel: bbbfly.bar._getSlidePanel,
      GetSlideDims: bbbfly.bar._getSlideDims
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
bbbfly.Bar.orientation = {
  vertical: 1,
  horizontal: 2
};
bbbfly.Bar.float = {
  left_top: 1,
  right_top: 2,
  left_bottom: 3,
  right_bottom: 4
};
bbbfly.Bar.autosize = {
  none: 0,
  stretch: 1,
  slide: 2
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_bar'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Bar',bbbfly.Bar);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Bar
 * @extends bbbfly.Frame.Definition
 *
 * @description Slide control definition
 *
 * @property {ngControl.Definition} [SlidePanel=undefined] - Control definition
 */