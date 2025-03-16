/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.control=bbbfly.map.control||{};bbbfly.map.control.modebar={control_type:"modebar"};
bbbfly.map.control.modebar._onLinkedToMap=function(){var a=this.GetControlsHolder();a.Controls?a.Controls.Dispose():a.Controls=new ngControls;var d=this.GetMap(),b=d.GetModes();if("object"===typeof this.Modes&&"object"===typeof this.FrameDef){var f={},c;for(c in this.Modes){var g=this.Modes[c],k=ng_CopyVar(this.FrameDef);if(g&&"object"===typeof g&&"object"===typeof this.ButtonDef){var l={},m;for(m in g){var e=g[m];if("string"===typeof e){var h=ng_CopyVar(this.ButtonDef);ng_MergeDef(h,{Data:{ModeType:c,
Mode:e,ModeBar:null,Selected:b[c]===e}});"function"===typeof this.GetButtonIcon&&(h.Data.Icon=this.GetButtonIcon({type:c,mode:e}));h.Data.ModeBar=this;l[e]=h}}k.Controls=l}f[c]=k}a.Controls.AddControls(f,a)}if(this.DefaultModes&&"object"===typeof this.DefaultModes)for(c in this.DefaultModes)a=this.DefaultModes[c],"string"===typeof a&&d.SetMode(c,a);return!0};bbbfly.map.control.modebar._createListener=function(){return{Listen:["OnModeChanged"],OnModeChanged:bbbfly.map.control.modebar._onModeChanged}};
bbbfly.map.control.modebar._onModeChanged=function(a,d){this.Owner.ShowMode(a,d)};bbbfly.map.control.modebar._showMode=function(a,d){var b=this.GetControlsHolder();if(b&&b.Controls&&(a=b.Controls[a])&&a.Controls)for(var f in a.Controls)(b=a.Controls[f])&&b.ModeType&&b.Mode&&b.SetSelected(b.Mode===d)};bbbfly.map.control.modebar._onButtonClick=function(){var a=this.ModeBar.GetMap();a&&a.SetMode(this.ModeType,this.Mode)};
bbbfly.MapModeBar=function(a,d,b){a=a||{};ng_MergeDef(a,{Data:{ControlType:bbbfly.map.control.modebar.control_type,Modes:null,DefaultModes:null,FrameDef:{Type:"bbbfly.Panel",ParentReferences:!1},ButtonDef:{Type:"bbbfly.Button",Events:{OnClick:bbbfly.map.control.modebar._onButtonClick}}},Controls:{},Events:{OnLinkedToMap:bbbfly.map.control.modebar._onLinkedToMap},Methods:{CreateListener:bbbfly.map.control.modebar._createListener,ShowMode:bbbfly.map.control.modebar._showMode,GetButtonIcon:null}});return ngCreateControlAsType(a,
"bbbfly.MapControl",d,b)};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map_control_modebar={OnInit:function(){ngRegisterControlType("bbbfly.MapModeBar",bbbfly.MapModeBar)}};
