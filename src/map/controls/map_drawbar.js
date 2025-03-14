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
bbbfly.map.control.drawbar = {
  control_type: 'drawbar'
};

/**
 * @class
 * @type control
 * @extends bbbfly.MapControl
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapDrawBar.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.drawbar.control_type]
 *
 * @property {object} FrameDef - Draw type frame definition
 * @property {object} ButtonDef - Draw button definition
 */
bbbfly.MapDrawBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.drawbar.control_type,

      /** @private */
      FrameDef: {
        Type: 'bbbfly.Panel',
        ParentReferences: false
      },
      /** @private */
      ButtonDef: {
        Type: 'bbbfly.Button',
        Events: {

        }
      }
    },
    Controls: {},
    Events: {},
    Methods: {}
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_drawbar'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapDrawBar',bbbfly.MapDrawBar
    );
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.MapDrawBar
 * @extends bbbfly.MapControl.Definition
 *
 * @description MapDrawBar control definition
 */
