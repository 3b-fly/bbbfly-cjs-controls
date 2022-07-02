/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage mapbox
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.control = bbbfly.map.control || {};
/** @ignore */
bbbfly.map.control.modebar = {
  control_type: 'modebar'
};

/** @ignore */
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

/** @ignore */
bbbfly.map.control.modebar._createListener = function(){
  return {
    Listen: ['OnModeChanged'],
    OnModeChanged: bbbfly.map.control.modebar._onModeChanged
  };
};

/** @ignore */
bbbfly.map.control.modebar._onModeChanged = function(modeType,mode){
  this.Owner.ShowMode(modeType,mode);
};

/** @ignore */
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

/** @ignore */
bbbfly.map.control.modebar._onButtonClick = function(){
  var map = this.ModeBar.GetMap();
  if(map){map.SetMode(this.ModeType,this.Mode);}
};

/**
 * @class
 * @type control
 * @extends bbbfly.MapControl
 *
 * @inpackage mapbox
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.modebar.control_type]
 *
 * @property {object} [Modes=null] - { modeType: [mode,mode, ...], ... }
 * @property {object} [DefaultModes=null] - { modeType: mode, ... }
 * @property {object} FrameDef - Mode type frame definition
 * @property {object} ButtonDef - Mode button definition
 */
bbbfly.MapModeBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.modebar.control_type,

      Modes: null,
      DefaultModes: null,

      /** @private */
      FrameDef: {
        Type: 'bbbfly.Panel',
        ParentReferences: false
      },
      /** @private */
      ButtonDef: {
        Type: 'bbbfly.Button',
        Events: {
          OnClick: bbbfly.map.control.modebar._onButtonClick
        }
      }
    },
    Controls: {},
    Events: {
      /** @private */
      OnLinkedToMap: bbbfly.map.control.modebar._onLinkedToMap
    },
    Methods: {
      /** @private */
      CreateListener: bbbfly.map.control.modebar._createListener,
      /**
       * @function
       * @name ShowMode
       * @memberof bbbfly.MapModeBar#
       *
       * @param {string} modeType - Map mode type name
       * @param {string} mode - Map mode name
       */
      ShowMode: bbbfly.map.control.modebar._showMode,
      /**
       * @function
       * @abstract
       * @name GetButtonIcon
       * @memberof bbbfly.MapModeBar#
       *
       * @param {object} mapMode
       * @param {string} mapMode.type - Map mode type id
       * @param {string} mapMode.mode - Map mode id
       * @return {image}
       */
      GetButtonIcon: null
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_modebar'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapModeBar',bbbfly.MapModeBar
    );
  }
};
