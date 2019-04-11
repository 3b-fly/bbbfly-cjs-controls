/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.panel = {};
bbbfly.panel._getControlsPanel = function(){
  return this.ControlsPanel ? this.ControlsPanel : null;
};
bbbfly.panel._getControlsHolder = function(){
  return this.ControlsPanel ? this.ControlsPanel : this;
};
bbbfly.Panel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Frame: undefined
    },
    Methods: {
      GetControlsPanel: bbbfly.panel._getControlsPanel,
      GetControlsHolder: bbbfly.panel._getControlsHolder
    }
  });

  return (def.Data && (typeof def.Data.Frame !== 'undefined'))
    ? ngCreateControlAsType(def,'ngGroup',ref,parent)
    : ngCreateControlAsType(def,'ngPanel',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_panel'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Panel',bbbfly.Panel);
  }
};