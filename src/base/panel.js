/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage panel
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.panel = {};

/** @ignore */
bbbfly.panel._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};

/** @ignore */
bbbfly.panel._getControlsHolder = function(){
  return this.ControlsPanel ? this.ControlsPanel : this;
};

/**
 * @class
 * @type control
 * @extends bbbfly.Panel
 *
 * @description
 *   Panel with conditioned frame support.
 *
 * @inpackage panel
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 *  @property {frame} [Frame=undefined]
 *    Define this property before panel creation to add frame support
 */
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Frame: undefined
    },
    Methods: {
      /**
       * @function
       * @name GetControlsPanel
       * @memberof bbbfly.Panel#
       *
       * @return {object|null} ControlsPanel control
       */
      GetControlsPanel: bbbfly.panel._getControlsPanel,
      /**
       * @function
       * @name GetControlsHolder
       * @memberof bbbfly.Panel#
       *
       * @return {object} ControlsPanel control or self
       */
      GetControlsHolder: bbbfly.panel._getControlsHolder
    }
  });

  return (def.Data && (typeof def.Data.Frame !== 'undefined'))
    ? ngCreateControlAsType(def,'ngGroup',ref,parent)
    : ngCreateControlAsType(def,'ngPanel',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
  }
};