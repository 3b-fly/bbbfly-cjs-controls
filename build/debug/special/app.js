/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.appheader = {};
bbbfly.appheader.logo = {};
bbbfly.appheader.menu = {};
bbbfly.appheader.auth = {};
bbbfly.appheader._setLogoIcon = function(icon){
  if(!Object.isObject(icon) && (icon !== null)){return false;}

  this.LogoIcon = icon;
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
bbbfly.appheader.logo._getIcon = function(){
  var icon = this.ParentControl.LogoIcon;
  return (Object.isObject(icon) ? icon : {});
};
bbbfly.appheader.menu._getItems = function(){
  var items = this.ParentControl.MenuItems;
  return Object.isObject(items) ? items : null;
};
bbbfly.appheader.auth._getText = function(){
  var data = bbbfly.Auth.GetUserData();
  if(!Object.isObject(data)){return null;}

  return String.isString(data.Name)
    ? data.Name : null;
};
bbbfly.AppHeader = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      HeaderControls: bbbfly.AppHeader.control.none,

      LogoIcon: true,
      MenuItems: null
    },
    Methods: {
      SetLogoIcon: bbbfly.appheader._setLogoIcon,
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
              GetIcon: bbbfly.appheader.logo._getIcon
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
              GetItems: bbbfly.appheader.menu._getItems
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
            },
            Methods: {
              GetText: bbbfly.appheader.auth._getText
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
