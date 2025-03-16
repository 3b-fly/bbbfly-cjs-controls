/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.progressbar = {};
bbbfly.progressbar._reset = function(){
  this.EndProcess();
};
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
bbbfly.progressbar._doProcess = function(step){
  if(!this.Enabled){return;}

  var pos = (step%16);
  if(pos > 8){pos = (16-pos);}

  pos = Math.floor(pos*10);
  this.SetProgress(pos+20,pos);
};
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
bbbfly.progressbar._onEnabledChanged = function(){
  var indicator = this.Controls.Indicator;
  if(indicator){indicator.SetVisible(this.Enabled);}
};
bbbfly.ProgressRing = function(def,ref,parent){
  return ngCreateControlAsType(def,'bbbfly.Image',ref,parent);
};
bbbfly.ProgressBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      _Progress: null,
      _ProcessTimer: null
    },
    Controls: {
      Indicator: {
        Type: 'bbbfly.Frame',
        className: 'Indicator'
      }
    },
    Events: {
      OnEnabledChanged: bbbfly.progressbar._onEnabledChanged
    },
    Methods: {
      DoProcess: bbbfly.progressbar._doProcess,
      Reset: bbbfly.progressbar._reset,
      SetProgress: bbbfly.progressbar._setProgress,
      StartProcess: bbbfly.progressbar._startProcess,
      EndProcess: bbbfly.progressbar._endProcess
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_progress'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ProgressRing',bbbfly.ProgressRing);
    ngRegisterControlType('bbbfly.ProgressBar',bbbfly.ProgressBar);
  }
};
