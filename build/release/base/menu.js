/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.menu={};bbbfly.menu._normalizeItems=function(a){a.Data.Items=bbbfly.menu._itemsToArray(a.Data.Items)};bbbfly.menu._itemsToArray=function(a){if(Array.isArray(a))return a;if(!Object.isObject(a))return[];var b=[],d;for(d in a){var e=a[d];0<b.length&&b.push({Text:"-"});for(var f in e){var c=e[f];c.SubMenu&&(c.SubMenu=bbbfly.menu._itemsToArray(c.SubMenu),ng_MergeVar(c,{OnClick:bbbfly.menu._onSubMenuClick}));b.push(c)}}return b};bbbfly.menu._onSubMenuClick=function(){return!1};
bbbfly.Menu=function(a,b,d){a=a||{};ng_MergeDef(a,{Data:{Items:null}});bbbfly.menu._normalizeItems(a);return ngCreateControlAsType(a,"ngMenu",b,d)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_menu={OnInit:function(){ngRegisterControlType("bbbfly.Menu",bbbfly.Menu)}};
