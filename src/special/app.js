/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage app
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.appheader = {};
/** @ignore */
bbbfly.appheader.logo = {};
/** @ignore */
bbbfly.appheader.menu = {};
/** @ignore */
bbbfly.appheader.auth = {};

/** @ignore */
bbbfly.appheader._setLogoIcon = function(icon){
  if(!Object.isObject(icon) && (icon !== null)){return false;}

  this.LogoIcon = icon;
  var button = this.Controls.AppLogo;

  if(Object.isObject(button) && Function.isFunction(button.Update)){
    button.Update();
  }

  return true;
};

/** @ignore */
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

/** @ignore */
bbbfly.appheader.logo._getIcon = function(){
  var icon = this.ParentControl.LogoIcon;
  return (Object.isObject(icon) ? icon : {});
};

/** @ignore */
bbbfly.appheader.menu._getItems = function(){
  var items = this.ParentControl.MenuItems;
  return Object.isObject(items) ? items : null;
};

/** @ignore */
bbbfly.appheader.auth._getText = function(){
  var data = bbbfly.Auth.GetUserData();
  if(!Object.isObject(data)){return null;}

  return String.isString(data.Name)
    ? data.Name : null;
};

/**
 * @class
 * @type control
 * @extends bbbfly.Wrapper
 *
 * @inpackage app
 *
 * @param {bbbfly.AppHeader.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.AppHeader.control} [HeaderControls=none] - Set this property to add desired controls.
 * @property {boolean|bbbfly.Renderer.image} [LogoIcon=true]
 * @property {bbbfly.MenuBar.Items} [MenuItems=null]
 */
bbbfly.AppHeader = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      HeaderControls: bbbfly.AppHeader.control.none,

      LogoIcon: true,
      MenuItems: null
    },
    Methods: {
      /**
       * @function
       * @name SetLogoIcon
       * @memberof bbbfly.AppHeader#
       *
       * @param {bbbfly.Renderer.image} [icon=null]
       * @return {boolean} - If logo icon were set
       */
      SetLogoIcon: bbbfly.appheader._setLogoIcon,
      /**
       * @function
       * @name SetMenuItems
       * @memberof bbbfly.AppHeader#
       *
       * @param {bbbfly.MenuBar.Items} [items=null]
       * @return {boolean} - If items were set
       */
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

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.AppHeader|bbbfly.AppHeader.HeaderControls}
 */
bbbfly.AppHeader.control = {
  none: 0,
  logo: 1,
  menu: 2,
  auth: 4
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_app'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.AppHeader',bbbfly.AppHeader);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.AppHeader
 * @extends bbbfly.Wrapper.Definition
 *
 * @description AppHeader control definition
 */
