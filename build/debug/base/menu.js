/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.menu = {};
bbbfly.menubar = {};
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
  if(typeof item.CloseOnClick === 'undefined'){
    item.CloseOnClick = !item.SubMenu;
  }
  item.Owner = this;

  this.Add.callParent(item,parent);
};
bbbfly.menu._onMenuClick = function(event,menu,item){
  if(
    (typeof item.Checked !== 'undefined')
    || (typeof item.RadioGroup !== 'undefined')
  ){
    menu.CheckItem(item,!item.Checked);
  }

  return !!item.CloseOnClick;
};
bbbfly.menubar._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);
  this.FillItems();
};
bbbfly.menubar._setItems = function(items){
  if(!Object.isObject(items)){return false;}

  this.Items = items;
  this.FillItems();
  this.Update();
  return true;
};
bbbfly.menubar._getItems = function(){
  return Object.isObject(this.Items) ? this.Items : null;
};
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
bbbfly.menubar._getButtons = function(){
  return Array.isArray(this._Buttons) ? this._Buttons : [];
};
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
bbbfly.menubar._onButtonClick = function(){
  var bar = this._Bar;
  if(!Object.isObject(bar)){return;}

  if(Function.isFunction(bar.OnItemClick)){
    bar.OnItemClick(this._Item,this.Selected);
  }
};
bbbfly.menubar._onButtonSelectedChanged = function(){
  var bar = this._Bar;
  if(!Object.isObject(bar)){return;}

  if(Function.isFunction(bar.OnItemSelectedChanged)){
    bar.OnItemSelectedChanged(this._Item,this.Selected);
  }
};
bbbfly.Menu = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Items: null
    },
    Events: {
      OnMenuClick: bbbfly.menu._onMenuClick
    },
    Methods: {
      Add: bbbfly.menu._add
    }
  });

  bbbfly.menu._normalizeItems(def);

  return ngCreateControlAsType(def,'ngMenu',ref,parent);
};
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
      _Buttons: []
    },
    Events: {
      OnItemClick: null,
      OnItemSelectedChanged: null
    },
    Methods: {
      DoCreate: bbbfly.menubar._doCreate,
      SetItems: bbbfly.menubar._setItems,
      GetItems: bbbfly.menubar._getItems,
      FillItems: bbbfly.menubar._fillItems,
      GetButtons: bbbfly.menubar._getButtons,
      CreateItemButton: bbbfly.menubar._createItemButton
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Bar',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_menu'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Menu',bbbfly.Menu);
    ngRegisterControlType('bbbfly.MenuBar',bbbfly.MenuBar);
  }
};

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