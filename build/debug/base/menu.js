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
      }
      resultItems.push(item);
    }
  }
  return resultItems;
};

bbbfly.menu._add = function(item,parent){
  if(!item.AddEvent){item.AddEvent = ngObjAddEvent;}
  item.AddEvent('OnMenuClick',bbbfly.menu._onItemClick,true);

  if(typeof item.CloseOnClick === 'undefined'){
    item.CloseOnClick = !item.SubMenu;
  }
  item.Owner = this;

  this.Add.callParent(item,parent);
};

bbbfly.menu._onItemClick = function(event,menu,item){
  if(typeof item.Checked !== 'undefined'){
    menu.CheckItem(item,!item.Checked);
  }
  return !!item.CloseOnClick;
};
bbbfly.Menu = function(def,ref,parent){
  def = def || {};
  ng_MergeDef(def, {
    Data: {
      Items: null
    },
    Methods: {
      Add: bbbfly.menu._add
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

/**
 * @typedef {ngMenuItem} Item
 * @memberOf bbbfly.Menu
 *
 * @property {boolean} CloseOnClick - If close Popup menu on item click
 */