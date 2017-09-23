/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage calendar
 */

/** @ignore */
var bbbfly = bbbfly || {};

/**
 * @class
 * @type control
 * @extends ngEditDate
 * @extends bbbfly.Edit
 * @implements bbbfly.Edit
 *
 * @description
 *   Implements {@link bbbfly.Edit|Edit} features
 *   if {@link package:edit|edit} package is inluded.
 *
 * @inpackage calendar
 *
 * @param {bbbfly.Edit.definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.EditDate = function(def,ref,parent){
  def = def || {};
  return (bbbfly.Edit)
    ? bbbfly.Edit(def,ref,parent,'ngEditDate')
    : ngCreateControlAsType(def,'ngEditDate',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngEditTime
 * @extends bbbfly.Edit
 * @implements bbbfly.Edit
 *
 * @description
 *   Implements {@link bbbfly.Edit|Edit} features
 *   if {@link package:edit|edit} package is inluded.
 *
 * @inpackage calendar
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.EditTime = function(def,ref,parent){
  def = def || {};
  return (bbbfly.Edit)
    ? bbbfly.Edit(def,ref,parent,'ngEditTime')
    : ngCreateControlAsType(def,'ngEditTime',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_calendar'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.EditDate',bbbfly.EditDate);
    ngRegisterControlType('bbbfly.EditTime',bbbfly.EditTime);
  }
};