/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */
var bbbfly=bbbfly||{};bbbfly.menu={};bbbfly.menu._normalizeItems=function(a){var d=function(a){if(Array.isArray(a))return a;if(Object.isObject(a)){var c=[],f;for(f in a){var g=a[f];0<c.length&&c.push({Text:"-"});for(var e in g){var b=g[e];b.SubMenu&&(b.SubMenu=d(b.SubMenu),ng_MergeVar(b,{OnClick:bbbfly.menu._onSubMenuClick}));c.push(b)}}return c}return[]};a.Data.Items=d(a.Data.Items)};bbbfly.menu._onSubMenuClick=function(){return!1};
bbbfly.Menu=function(a,d,e){a=a||{};ng_MergeDef(a,{Data:{Items:null}});bbbfly.menu._normalizeItems(a);return ngCreateControlAsType(a,"ngMenu",d,e)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_menu={OnInit:function(){ngRegisterControlType("bbbfly.Menu",bbbfly.Menu)}};
