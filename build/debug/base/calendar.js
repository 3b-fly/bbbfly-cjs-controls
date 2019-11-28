/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.EditDate = function(def,ref,parent){
  def = def || {};

  return (bbbfly.Edit)
    ? bbbfly.Edit(def,ref,parent,'ngEditDate')
    : ngCreateControlAsType(def,'ngEditDate',ref,parent);
};
bbbfly.EditTime = function(def,ref,parent){
  def = def || {};
  
  return (bbbfly.Edit)
    ? bbbfly.Edit(def,ref,parent,'ngEditTime')
    : ngCreateControlAsType(def,'ngEditTime',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_calendar'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.EditDate',bbbfly.EditDate);
    ngRegisterControlType('bbbfly.EditTime',bbbfly.EditTime);
  }
};