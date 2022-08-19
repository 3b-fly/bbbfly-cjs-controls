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
bbbfly.appheader._setLogo = function(icon){
  if(!Object.isObject(icon) && (icon !== null)){return false;}

  this.Logo = icon;
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
bbbfly.appheader._getIcon = function(){
  var icon = this.ParentControl.Logo;
  return (Object.isObject(icon) ? icon : {});
};

/** @ignore */
bbbfly.appheader._getItems = function(){
  var items = this.ParentControl.MenuItems;
  return Object.isObject(items) ? items : null;
};

/**
 * @class
 * @type control
 * @extends bbbfly.Wrapper
 *
 * @inpackage app
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.AppHeader.control} [HeaderControls=none] - Set this property to add desired controls.
 * @property {boolean|bbbfly.Renderer.image} [Logo=true]
 * @property {bbbfly.MenuBar.Items} [MenuItems=null]
 */
bbbfly.AppHeader = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      HeaderControls: bbbfly.AppHeader.control.none,

      Logo: true,
      MenuItems: null
    },
    Methods: {
      /**
       * @function
       * @name SetLogo
       * @memberof bbbfly.AppHeader#
       *
       * @param {bbbfly.Renderer.image} [icon=null]
       * @return {boolean} - If logo icon were set
       */
      SetLogo: bbbfly.appheader._setLogo,
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