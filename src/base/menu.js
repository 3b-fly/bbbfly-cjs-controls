/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage menu
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.menu = {};

/** @ignore */
bbbfly.menu._normalizeItems = function(def){
  def.Data.Items = bbbfly.menu._itemsToArray(def.Data.Items);
};

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends ngMenu
 *
 * @inpackage menu
 *
 * @param {bbbfly.Menu.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {array|object} [Items=null]
 *   Define {@link bbbfly.Menu.Item|items} as object to allow their merging
 */
bbbfly.Menu = function(def,ref,parent){
  def = def || {};
  ng_MergeDef(def, {
    Data: {
      Items: null
    },
    Methods: {
      /** @private */
      Add: bbbfly.menu._add
    }
  });

  bbbfly.menu._normalizeItems(def);

  return ngCreateControlAsType(def,'ngMenu',ref, parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_menu'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Menu',bbbfly.Menu);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Menu
 * @extends ngControl.Definition
 *
 * @description Menu control definition
 *
 * @property {array|object} [Items=null] - Define items as object to allow their merging
 */

/**
 * @typedef {ngMenuItem} Item
 * @memberOf bbbfly.Menu
 *
 * @property {boolean} CloseOnClick - If close Popup menu on item click
 */