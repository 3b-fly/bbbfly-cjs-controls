/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage progress
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.progressbar = {};

/** @ignore */
bbbfly.progressbar._reset = function(){
  this.EndProcess();
};

/** @ignore */
bbbfly.progressbar._setProgress = function(end,start){
  if(!Number.isInteger(start)){start = 0;}
  if(!Number.isInteger(end)){end = 0;}

  this._Progress = {
    start: start,
    end: end
  };

  var indicator = this.Controls.Indicator;
  if(!indicator){return;}

  var holder = this.GetControlsHolder();
  var node = holder.Elm();
  if(!node){return;}

  var dims = indicator.GetFrameDims();

  var minWidth = (dims.L+dims.R);
  var maxWidth = ng_ClientWidth(node);
  var innerWidth = Math.floor(maxWidth-minWidth);

  var width = Math.floor(innerWidth/100*(end-start));
  var left = Math.floor(innerWidth/100*start);

  var bounds = {
    W: (width+minWidth)+'px',
    L: left+'px',
    R: null
  };

  if(indicator.SetBounds(bounds)){
    indicator.Update();
  }
};

/** @ignore */
bbbfly.progressbar._doProcess = function(step){
  if(!this.Enabled){return;}

  var pos = (step%16);
  if(pos > 8){pos = (16-pos);}

  pos = Math.floor(pos*10);
  this.SetProgress(pos+20,pos);
};

/** @ignore */
bbbfly.progressbar._startProcess = function(){
  var indicator = this.Controls.Indicator;
  if(!indicator || this._ProcessTimer){return;}

  var node = indicator.Elm();
  if(node){
    node.style.transitionProperty = 'left, right';
    node.style.transitionDuration = '99ms';
  }

  var step = 0;
  var self = this;

  this._ProcessTimer = function(){
    self.DoProcess(step++);
    setTimeout(self._ProcessTimer,100);
  };

  this.SetProgress(0,0);
  this._ProcessTimer();
};

/** @ignore */
bbbfly.progressbar._endProcess = function(){
  var indicator = this.Controls.Indicator;
  if(!indicator || !this._ProcessTimer){return;}

  var node = indicator.Elm();
  if(node){
    node.style.transitionProperty = '';
    node.style.transitionDuration = '';
  }

  clearTimeout(this._ProcessTimer);
  this._ProcessTimer = null;
  this.SetProgress(0,0);
};

/** @ignore */
bbbfly.progressbar._onEnabledChanged = function(){
  var indicator = this.Controls.Indicator;
  if(indicator){indicator.SetVisible(this.Enabled);}
};

/**
 * @class
 * @type control
 * @extends bbbfly.Image
 *
 * @inpackage progress
 *
 * @param {bbbfly.ProgressRing.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.ProgressRing = function(def,ref,parent){
  return ngCreateControlAsType(def,'bbbfly.Image',ref,parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @inpackage progress
 *
 * @param {bbbfly.ProgressBar.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.ProgressBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      /** @private */
      _Progress: null,
      /** @private */
      _ProcessTimer: null
    },
    Controls: {
      Indicator: {
        Type: 'bbbfly.Frame',
        className: 'Indicator'
      }
    },
    Events: {
      /** @private */
      OnEnabledChanged: bbbfly.progressbar._onEnabledChanged
    },
    Methods: {
      /** @private */
      DoProcess: bbbfly.progressbar._doProcess,

      /**
       * @function
       * @name Reset
       * @memberof bbbfly.ProgressBar#
       */
      Reset: bbbfly.progressbar._reset,
      /**
       * @function
       * @name SetProgress
       * @memberof bbbfly.ProgressBar#
       *
       * @param {integer} [end] - Indicator end percentage
       * @param {integer} [start=0] - Indicator start percentage
       */
      SetProgress: bbbfly.progressbar._setProgress,
      /**
       * @function
       * @name StartProcess
       * @memberof bbbfly.ProgressBar#
       *
       * @see {@link bbbfly.ProgressBar#EndProcess|EndProcess()}
       */
      StartProcess: bbbfly.progressbar._startProcess,
      /**
       * @function
       * @name StartProcess
       * @memberof bbbfly.ProgressBar#
       *
       * @see {@link bbbfly.ProgressBar#StartProcess|StartProcess()}
       */
      EndProcess: bbbfly.progressbar._endProcess
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_progress'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ProgressRing',bbbfly.ProgressRing);
    ngRegisterControlType('bbbfly.ProgressBar',bbbfly.ProgressBar);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.ProgressRing
 * @extends bbbfly.Image.Definition
 *
 * @description ProgressRing control definition
 */

/**
 * @interface Definition
 * @memberOf bbbfly.ProgressBar
 * @extends bbbfly.Frame.Definition
 *
 * @description ProgressBar control definition
 */