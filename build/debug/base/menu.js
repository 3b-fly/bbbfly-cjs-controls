/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.menu = {};
bbbfly.menu._normalizeItems = function(def){
  def.Data.Items = bbbfly.menu._itemsToArray(def.Data.Items);
};
bbbfly.menu._itemsToArray = function(items){
  if(Array.isArray(items)){return items;}
  if(!Object.isObject(items)){return new Array();}

  var resultItems = new Array();

  for(var name in items){
    var itemGroup = items[name];

    if(resultItems.length > 0){
      resultItems.push({Text: '-'});
    }

    for(var id in itemGroup){
      var item = itemGroup[id];

      if(item.SubMenu){
        item.SubMenu = bbbfly.menu._itemsToArray(item.SubMenu);
        ng_MergeVar(item,{OnClick: bbbfly.menu._onSubMenuClick});
      }
      resultItems.push(item);
    }
  }
  return resultItems;
};
bbbfly.menu._onSubMenuClick = function(){
  return false;
};
bbbfly.Menu = function(def,ref,parent){
  def = def || {};
  ng_MergeDef(def, {
    Data: {
      Items: null
    }
  });

  bbbfly.menu._normalizeItems(def);

  return ngCreateControlAsType(def,'ngMenu',ref, parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_menu'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Menu',bbbfly.Menu);
  }
};
