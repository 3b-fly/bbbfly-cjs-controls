/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.menu={};bbbfly.menu._normalizeItems=function(a){a.Data.Items=bbbfly.menu._itemsToArray(a.Data.Items)};bbbfly.menu._itemsToArray=function(a){if(Array.isArray(a))return a;if(!Object.isObject(a))return[];var b=[],c;for(c in a){var e=a[c];0<b.length&&b.push({Text:"-"});for(var f in e){var d=e[f];d.SubMenu&&(d.SubMenu=bbbfly.menu._itemsToArray(d.SubMenu));b.push(d)}}return b};
bbbfly.menu._add=function(a,b){"undefined"===typeof a.CloseOnClick&&(a.CloseOnClick=!a.SubMenu);a.Owner=this;this.Add.callParent(a,b)};bbbfly.menu._onMenuClick=function(a,b,c){"undefined"===typeof c.Checked&&"undefined"===typeof c.RadioGroup||b.CheckItem(c,!c.Checked);return!!c.CloseOnClick};
bbbfly.Menu=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{Items:null},Events:{OnMenuClick:bbbfly.menu._onMenuClick},Methods:{Add:bbbfly.menu._add}});bbbfly.menu._normalizeItems(a);return ngCreateControlAsType(a,"ngMenu",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_menu={OnInit:function(){ngRegisterControlType("bbbfly.Menu",bbbfly.Menu)}};
