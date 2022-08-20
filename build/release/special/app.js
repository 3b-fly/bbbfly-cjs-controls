/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.appheader={};bbbfly.appheader.logo={};bbbfly.appheader.menu={};bbbfly.appheader.auth={};bbbfly.appheader._setLogoIcon=function(a){if(!Object.isObject(a)&&null!==a)return!1;this.LogoIcon=a;a=this.Controls.AppLogo;Object.isObject(a)&&Function.isFunction(a.Update)&&a.Update();return!0};bbbfly.appheader._setMenuItems=function(a){if(!Object.isObject(a)&&null!==a)return!1;this.MenuItems=a;a=this.Controls.AppMenu;Object.isObject(a)&&(a.FillItems(),a.Update());return!0};
bbbfly.appheader.logo._getIcon=function(){var a=this.ParentControl.LogoIcon;return Object.isObject(a)?a:{}};bbbfly.appheader.menu._getItems=function(){var a=this.ParentControl.MenuItems;return Object.isObject(a)?a:null};bbbfly.appheader.auth._getText=function(){var a=bbbfly.Auth.GetUserData();return Object.isObject(a)?String.isString(a.Name)?a.Name:null:null};
bbbfly.AppHeader=function(a,c,d){a=a||{};ng_MergeDef(a,{Data:{HeaderControls:bbbfly.AppHeader.control.none,LogoIcon:!0,MenuItems:null},Methods:{SetLogoIcon:bbbfly.appheader._setLogoIcon,SetMenuItems:bbbfly.appheader._setMenuItems}});var b=a.Data.HeaderControls;b&&(b&bbbfly.AppHeader.control.logo&&ng_MergeDef(a,{Controls:{AppLogo:{Type:"bbbfly.Button",Data:{ReadOnly:!0},Methods:{GetIcon:bbbfly.appheader.logo._getIcon}}}}),b&bbbfly.AppHeader.control.menu&&ng_MergeDef(a,{Controls:{AppMenu:{Type:"bbbfly.MenuBar",
Methods:{GetItems:bbbfly.appheader.menu._getItems}}}}),b&bbbfly.AppHeader.control.auth&&ng_MergeDef(a,{Controls:{AppAuth:{Type:"bbbfly.Button",Data:{ReadOnly:!0},Methods:{GetText:bbbfly.appheader.auth._getText}}}}));return ngCreateControlAsType(a,"bbbfly.Wrapper",c,d)};bbbfly.AppHeader.control={none:0,logo:1,menu:2,auth:4};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_app={OnInit:function(){ngRegisterControlType("bbbfly.AppHeader",bbbfly.AppHeader)}};
