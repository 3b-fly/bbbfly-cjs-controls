/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = bbbfly.map.control || {};
bbbfly.map.control.modebar = {
  control_type: 'modebar'
};
bbbfly.map.control.modebar._onLinkedToMap = function(){
  var cHolder = this.GetControlsHolder();

  if(!cHolder.Controls){cHolder.Controls = new ngControls();}
  else{cHolder.Controls.Dispose();}

  var map = this.GetMap();
  var mapModes = map.GetModes();

  if(
    (typeof this.Modes === 'object')
    && (typeof this.FrameDef === 'object')
  ){
    var frames = {};
    for(var modeType in this.Modes){
      var modeTypeDef = this.Modes[modeType];
      var typeFrame = ng_CopyVar(this.FrameDef);

      if(
        (modeTypeDef)
        && (typeof modeTypeDef === 'object')
        && (typeof this.ButtonDef === 'object')
      ){

        var buttons = {};
        for(var i in modeTypeDef){
          var mode = modeTypeDef[i];
          if(typeof mode === 'string'){
            var button = ng_CopyVar(this.ButtonDef);

            ng_MergeDef(button,{
              Data: {
                ModeType: modeType,
                Mode: mode,
                ModeBar: null,
                Selected: (mapModes[modeType] === mode)
              }
            });

            if(typeof this.GetButtonIcon === 'function'){
              button.Data.Icon = this.GetButtonIcon({
                type: modeType,
                mode: mode
              });
            }

            button.Data.ModeBar = this;
            buttons[mode] = button;
          }
        }
        typeFrame.Controls = buttons;

      }
      frames[modeType] = typeFrame;
    }

    cHolder.Controls.AddControls(frames,cHolder);
  }

  if(this.DefaultModes && (typeof this.DefaultModes === 'object')){
    for(var modeType in this.DefaultModes){
      var defMode = this.DefaultModes[modeType];
      if(typeof defMode === 'string'){
        map.SetMode(modeType,defMode);
      }
    }
  }

  return true;
};
bbbfly.map.control.modebar._createListener = function(){
  return {
    Listen: ['OnModeChanged'],
    OnModeChanged: bbbfly.map.control.modebar._onModeChanged
  };
};
bbbfly.map.control.modebar._onModeChanged = function(modeType,mode){
  this.Owner.ShowMode(modeType,mode);
};
bbbfly.map.control.modebar._showMode = function(modeType,mode){
  var cHolder = this.GetControlsHolder();
  if(!cHolder || !cHolder.Controls){return;}

  var frame = cHolder.Controls[modeType];
  if(!frame || !frame.Controls){return;}

  for(var i in frame.Controls){
    var button = frame.Controls[i];
    if(button && button.ModeType && button.Mode){
      button.SetSelected(button.Mode === mode);
    }
  }
};
bbbfly.map.control.modebar._onButtonClick = function(){
  var map = this.ModeBar.GetMap();
  if(map){map.SetMode(this.ModeType,this.Mode);}
};
bbbfly.MapModeBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.modebar.control_type,

      Modes: null,
      DefaultModes: null,
      FrameDef: {
        Type: 'bbbfly.Panel',
        ParentReferences: false
      },
      ButtonDef: {
        Type: 'bbbfly.Button',
        Events: {
          OnClick: bbbfly.map.control.modebar._onButtonClick
        }
      }
    },
    Controls: {},
    Events: {
      OnLinkedToMap: bbbfly.map.control.modebar._onLinkedToMap
    },
    Methods: {
      CreateListener: bbbfly.map.control.modebar._createListener,
      ShowMode: bbbfly.map.control.modebar._showMode,
      GetButtonIcon: null
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_modebar'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapModeBar',bbbfly.MapModeBar
    );
  }
};
