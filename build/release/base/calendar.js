/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE_GPLv3_with_commercial_exception' file
 */
var bbbfly=bbbfly||{};bbbfly.EditDate=function(a,b,c){a=a||{};return bbbfly.Edit?bbbfly.Edit(a,b,c,"ngEditDate"):ngCreateControlAsType(a,"ngEditDate",b,c)};bbbfly.EditTime=function(a,b,c){a=a||{};return bbbfly.Edit?bbbfly.Edit(a,b,c,"ngEditTime"):ngCreateControlAsType(a,"ngEditTime",b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_calendar={OnInit:function(){ngRegisterControlType("bbbfly.EditDate",bbbfly.EditDate);ngRegisterControlType("bbbfly.EditTime",bbbfly.EditTime)}};
