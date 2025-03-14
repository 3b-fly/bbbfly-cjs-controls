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
bbbfly.menubar = {};

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

/** @ignore */
bbbfly.menu._add = function(item,parent){
  if(typeof item.CloseOnClick === 'undefined'){
    item.CloseOnClick = !item.SubMenu;
  }
  item.Owner = this;

  this.Add.callParent(item,parent);
};

/** @ignore */
bbbfly.menu._onMenuClick = function(event,menu,item){
  if(
    (typeof item.Checked !== 'undefined')
    || (typeof item.RadioGroup !== 'undefined')
  ){
    menu.CheckItem(item,!item.Checked);
  }

  return !!item.CloseOnClick;
};

/** @ignore */
bbbfly.menubar._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.FillItems();
};

/** @ignore */
bbbfly.menubar._setItems = function(items){
  if(!Object.isObject(items)){return false;}

  this.Items = items;
  this.FillItems();
  this.Update();
  return true;
};

/** @ignore */
bbbfly.menubar._getItems = function(){
  return Object.isObject(this.Items) ? this.Items : null;
};

/** @ignore */
bbbfly.menubar._fillItems = function(){
  for(var i in this._Buttons){
    var ctrl = this._Buttons[i];

    if(Function.isFunction(ctrl.Dispose)){
      this._Buttons.pop(i);
      ctrl.Dispose();
    }
  }

  var items = this.GetItems();

  if(!Object.isObject(items)){return;}

  var group = bbbfly.PanelGroup.NewGroupId();

  for(var id in items){
    if(!items.hasOwnProperty(id)){continue;}

    var item = items[id];
    if(!Object.isObject(item)){continue;}

    var def = {
      ID: (String.isString(item.ID) ? item.ID : id),
      Group: { Selected: group }
    };

    if(String.isString(item.Alt)){def.Alt = item.Alt;}
    if(String.isString(item.AltRes)){def.AltRes = item.AltRes;}
    if(String.isString(item.Text)){def.Text = item.Text;}
    if(String.isString(item.TextRes)){def.TextRes = item.TextRes;}
    if(Boolean.isBoolean(item.Visible)){def.Visible = item.Visible;}
    if(Boolean.isBoolean(item.Enabled)){def.Enabled = item.Enabled;}
    if(Object.isObject(item.Icon)){def.Icon = item.Icon;}

    var def = { Data: def };
    var ctrl = this.CreateItemButton(item,def);

    this._Buttons.push(ctrl);
  }
};

/** @ignore */
bbbfly.menubar._getButtons = function(){
  return Array.isArray(this._Buttons) ? this._Buttons : [];
};

/** @ignore */
bbbfly.menubar._createItemButton = function(item,def){
  if(!Object.isObject(item)){return null;}
  if(!Object.isObject(def)){def = {};}

  var btnDef = this.ButtonDef;
  if(Object.isObject(btnDef)){ng_MergeDef(def,btnDef);}

  var ctrl = this.CreateControl(def);
  if(!ctrl){return null;}

  ctrl._Bar = this;
  ctrl._Item = item;
  return ctrl;
};

/** @ignore */
bbbfly.menubar._onButtonClick = function(){
  var bar = this._Bar;
  if(!Object.isObject(bar)){return;}

  if(Function.isFunction(bar.OnItemClick)){
    bar.OnItemClick(this._Item,this.Selected);
  }
};

/** @ignore */
bbbfly.menubar._onButtonSelectedChanged = function(){
  var bar = this._Bar;
  if(!Object.isObject(bar)){return;}

  if(Function.isFunction(bar.OnItemSelectedChanged)){
    bar.OnItemSelectedChanged(this._Item,this.Selected);
  }
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

  ng_MergeDef(def,{
    Data: {
      Items: null
    },
    Events: {
      /** @private */
      OnMenuClick: bbbfly.menu._onMenuClick
    },
    Methods: {
      /** @private */
      Add: bbbfly.menu._add
    }
  });

  bbbfly.menu._normalizeItems(def);

  return ngCreateControlAsType(def,'ngMenu',ref,parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Bar
 *
 * @inpackage menu
 *
 * @param {bbbfly.MenuBar.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {bbbfly.Bar.barOptions} BarOptions
 * @property {boolean} BarOptions.TrackChanges=true
 * @property {bbbfly.Button.Definition} [ButtonDef=null] - Definition shared by all buttons
 * @property {bbbfly.MenuBar.Items} [Items=null]
 */
bbbfly.MenuBar = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      BarOptions: {
        TrackChanges: true
      },
      ButtonDef: {
        Type: 'bbbfly.Button',
        Data: {
          SelectType: bbbfly.Button.selecttype.click
        },
        Events: {
          OnSelectedChanged: bbbfly.menubar._onButtonSelectedChanged,
          OnClick: bbbfly.menubar._onButtonClick
        }
      },
      Items: null,

      /** @private */
      _Buttons: []
    },
    Events: {
      /**
       * @event
       * @name OnItemClick
       * @memberof bbbfly.MenuBar#
       *
       * @param {bbbfly.MenuBar.Item} item
       * @param {boolean} selected
       */
      OnItemClick: null,
      /**
       * @event
       * @name OnItemSelectedChanged
       * @memberof bbbfly.MenuBar#
       *
       * @param {bbbfly.MenuBar.Item} item
       * @param {boolean} selected
       */
      OnItemSelectedChanged: null
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.menubar._doCreate,

      /**
       * @function
       * @name SetItems
       * @memberof bbbfly.MenuBar#
       *
       * @param {bbbfly.MenuBar.Items} [items=null]
       * @return {boolean} - If items were set
       */
      SetItems: bbbfly.menubar._setItems,
      /**
       * @function
       * @name GetItems
       * @memberof bbbfly.MenuBar#
       *
       * @return {bbbfly.MenuBar.Items|null}
       */
      GetItems: bbbfly.menubar._getItems,
      /**
       * @function
       * @name FillItems
       * @memberof bbbfly.MenuBar#
       */
      FillItems: bbbfly.menubar._fillItems,
      /**
       * @function
       * @name GetButtons
       * @memberof bbbfly.MenuBar#
       *
       * @return {bbbfly.Button[]}
       */
      GetButtons: bbbfly.menubar._getButtons,
      /**
       * @function
       * @name CreateItemButton
       * @memberof bbbfly.MenuBar#
       *
       * @param {object} item
       * @param {object} [def=undefined]
       * @return {ngControl}
       */
      CreateItemButton: bbbfly.menubar._createItemButton
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Bar',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_menu'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Menu',bbbfly.Menu);
    ngRegisterControlType('bbbfly.MenuBar',bbbfly.MenuBar);
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

/**
 * @interface Definition
 * @memberOf bbbfly.MenuBar
 * @extends bbbfly.Bar.Definition
 *
 * @description MenuBar control definition
 */

/**
 * @typedef {object} Items
 * @memberOf bbbfly.MenuBar
 *
 * @description Object containing {@link bbbfly.MenuBar.Item|Item}.
 */

/**
 * @typedef {object} Item
 * @memberOf bbbfly.MenuBar
 *
 * @property {string} [Alt=undefined]
 * @property {string} [AltRes=undefined]
 * @property {string} [Text=undefined]
 * @property {string} [TextRes=undefined]
 * @property {boolean} [Visible=undefined]
 * @property {boolean} [Enabled=undefined]
 * @property {bbbfly.Renderer.image} [Icon=undefined]
 */
