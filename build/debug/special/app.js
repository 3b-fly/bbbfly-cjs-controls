/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.appheader = {};
bbbfly.appheader._setLogo = function(icon){
  if(!Object.isObject(icon) && (icon !== null)){return false;}

  this.Logo = icon;
  var button = this.Controls.AppLogo;

  if(Object.isObject(button) && Function.isFunction(button.Update)){
    button.Update();
  }

  return true;
};
bbbfly.appheader._setMenuItems = function(items){
  if(!Object.isObject(items) && (items !== null)){return false;}

  this.MenuItems = items;
  var menu = this.Controls.AppMenu;

  if(Object.isObject(menu)){
    menu.FillItems();
    menu.Update();
  }

  return true;
};
bbbfly.appheader._getIcon = function(){
  var icon = this.ParentControl.Logo;
  return (Object.isObject(icon) ? icon : {});
};
bbbfly.appheader._getItems = function(){
  var items = this.ParentControl.MenuItems;
  return Object.isObject(items) ? items : null;
};
bbbfly.AppHeader = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      HeaderControls: bbbfly.AppHeader.control.none,

      Logo: true,
      MenuItems: null
    },
    Methods: {
      SetLogo: bbbfly.appheader._setLogo,
      SetMenuItems: bbbfly.appheader._setMenuItems
    }
  });

  var headerControls = def.Data.HeaderControls;
  if(headerControls){

    if(headerControls & bbbfly.AppHeader.control.logo){
      ng_MergeDef(def,{
        Controls: {
          AppLogo: {
            Type: 'bbbfly.Button',
            Data: {
              ReadOnly: true
            },
            Methods: {
              GetIcon: bbbfly.appheader._getIcon
            }
          }
        }
      });
    }

    if(headerControls & bbbfly.AppHeader.control.menu){
      ng_MergeDef(def,{
        Controls: {
          AppMenu: {
            Type: 'bbbfly.MenuBar',
            Methods: {
              GetItems: bbbfly.appheader._getItems
            }
          }
        }
      });
    }

    if(headerControls & bbbfly.AppHeader.control.auth){
      ng_MergeDef(def,{
        Controls: {
          AppAuth: {
            Type: 'bbbfly.Button',
            Data: {
              ReadOnly: true
            }
          }
        }
      });
    }
  }

  return ngCreateControlAsType(def,'bbbfly.Wrapper',ref,parent);
};
bbbfly.AppHeader.control = {
  none: 0,
  logo: 1,
  menu: 2,
  auth: 4
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_app'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.AppHeader',bbbfly.AppHeader);
  }
};