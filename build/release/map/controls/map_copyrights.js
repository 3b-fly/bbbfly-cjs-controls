/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control=bbbfly.map.control||{};bbbfly.map.control.copyrights={control_type:"copyrights"};bbbfly.map.control.copyrights._onLinkedToMap=function(a){a&&this.FillCopyrights()};bbbfly.map.control.copyrights._createListener=function(){return{Listen:["OnLayersChanged"],OnLayersChanged:bbbfly.map.control.copyrights._onLayersChanged}};bbbfly.map.control.copyrights._onLayersChanged=function(){this.Owner.FillCopyrights()};
bbbfly.map.control.copyrights._fillCopyrights=function(){var a=this.GetMap(),b="";a&&(b=this.NormalizeCopyrights(a.GetAttributions()));this.Controls.CopyrightsText.SetText(b)};
bbbfly.map.control.copyrights._normalizeCopyrights=function(a){if(!Array.isArray(a))return"";var b=[],c=[],e;for(e in a){var d=a[e],f=d.Name;d=d.Attributions;Array.isArray(d)&&(d=d.join("<br/>"))&&(f?b.push("<p><b>"+f+"</b><br/>"+d+"</p>"):c.push(d))}0<c.length&&(a=c.join("<br/>"),c="",String.isString(this.OthersTextRes)&&(c="<b>"+ngTxt(this.OthersTextRes)+"</b>"),b.push("<p>"+c+"<br/>"+a+"</p>"));return b.join("")};bbbfly.map.control.copyrights._refresh=function(){this.ParentControl.Owner.Owner.FillCopyrights()};
bbbfly.map.control.copyrights._close=function(){this.ParentControl.Owner.Owner.SetVisible(!1)};
bbbfly.MapCopyrights=function(a,b,c){a=a||{};ng_MergeDef(a,{Data:{ControlType:bbbfly.map.control.copyrights.control_type,OthersTextRes:"bbbfly_map_control_copyrights_others"},Controls:{TitlePanel:{Type:"bbbfly.Panel",ParentReferences:!1,Controls:{Refresh:{Type:"bbbfly.Button",Data:{AltRes:"bbbfly_map_control_copyrights_refresh"},Events:{OnClick:bbbfly.map.control.copyrights._refresh}},Title:{Type:"bbbfly.Text",Data:{TextRes:"bbbfly_map_control_copyrights_title"}},Close:{Type:"bbbfly.Button",Data:{AltRes:"bbbfly_map_control_copyrights_close"},
Events:{OnClick:bbbfly.map.control.copyrights._close}}}},CopyrightsPanel:{Type:"bbbfly.Panel",Controls:{CopyrightsText:{Type:"bbbfly.Text",Data:{MultiLine:!0,HTMLEncode:!1}}}}},Events:{OnLinkedToMap:bbbfly.map.control.copyrights._onLinkedToMap},Methods:{CreateListener:bbbfly.map.control.copyrights._createListener,FillCopyrights:bbbfly.map.control.copyrights._fillCopyrights,NormalizeCopyrights:bbbfly.map.control.copyrights._normalizeCopyrights}});return ngCreateControlAsType(a,"bbbfly.MapControl",
b,c)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_control_copyrights={OnInit:function(){ngRegisterControlType("bbbfly.MapCopyrights",bbbfly.MapCopyrights)}};
