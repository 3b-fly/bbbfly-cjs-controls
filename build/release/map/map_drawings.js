/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.drawing={_lastId:0,utils:{},layer:{},marker:{},geometry:{},handler:{}};bbbfly.map.drawing.utils.IsLatLng=function(a){return Array.isArray(a)||a instanceof L.LatLng};
bbbfly.map.drawing.utils.NormalizeGeoJSON=function(a){if(a&&a.features){var b=function(a,b,c){for(var d in a.geometry.coordinates)c.push({type:"Feature",properties:a.properties,geometry:{type:b,coordinates:a.geometry.coordinates[d]}})},c=[],d;for(d in a.features){var e=a.features[d];if(e.geometry)switch(e.geometry.type){case "MultiLineString":b(e,"LineString",c);break;case "MultiPolygon":b(e,"Polygon",c);break;default:c.push(e)}}a.features=c}return a};
bbbfly.map.drawing._getState=function(){var a={mouseover:!!(this._State&bbbfly.MapDrawing.state.mouseover),disabled:!!(this._State&bbbfly.MapDrawing.state.disabled),selected:!!(this._State&bbbfly.MapDrawing.state.selected),grayed:!!(this._State&bbbfly.MapDrawing.state.grayed)};a.disabled&&(a.mouseover=!1);return a};bbbfly.map.drawing._getStateValue=function(a){return!!(this._State&a)};
bbbfly.map.drawing._setStateValue=function(a,b){var c=!!(this._State&a);b&&!c?(this._State|=a,this.Update()):!b&&c&&(this._State^=a,this.Update())};bbbfly.map.drawing._toggleStateValue=function(a){this.SetStateValue(a,!this.GetStateValue(a))};
bbbfly.map.drawing._initialize=function(){if(this._Initialized)return!0;if(!Function.isFunction(this.Create))return!1;var a=this.Create(this.Options);if(!Array.isArray(a))return!1;for(var b in a){var c=a[b];Object.isObject(c)&&c instanceof L.Layer&&(c.Owner=this,c.on("mouseover",bbbfly.map.drawing.layer._onEvent),c.on("mouseout",bbbfly.map.drawing.layer._onEvent),c.on("click",bbbfly.map.drawing.layer._onEvent),c.on("dblclick",bbbfly.map.drawing.layer._onEvent),c.on("contextmenu",bbbfly.map.drawing.layer._onEvent),
L.Util.stamp(c),this._Layers.push(c))}return this._Initialized=!0};bbbfly.map.drawing._dispose=function(){for(var a in this._Layers)this._Layers[a].remove();this._Layers=[];this._ParentFeature=null;this._Initialized=!1};bbbfly.map.drawing._update=function(){this.GetStateValue(bbbfly.MapDrawing.state.disabled)||this.GetStateValue(bbbfly.MapDrawing.state.mouseover)||this.GetStateValue(bbbfly.MapDrawing.state.selected)};
bbbfly.map.drawing._add=function(a){if(a instanceof L.FeatureGroup&&!this._ParentFeature){this.Initialize();for(var b in this._Layers)this._Layers[b].addTo(a);this._ParentFeature=a;return!0}return!1};bbbfly.map.drawing._remove=function(a){if(a&&a===this._ParentFeature){for(var b in this._Layers)this._Layers[b].removeFrom(this._ParentFeature);this._ParentFeature=null;return!0}return!1};bbbfly.map.drawing._onMouseIn=function(){this.SetStateValue(bbbfly.MapDrawing.state.mouseover,!0)};
bbbfly.map.drawing._onMouseOut=function(){this.SetStateValue(bbbfly.MapDrawing.state.mouseover,!1)};bbbfly.map.drawing._onClick=function(){this.ToggleStateValue(bbbfly.MapDrawing.state.selected)};bbbfly.map.drawing.layer._onEvent=function(a){var b=a.target.Owner,c=null;switch(a.type){case "mouseover":c=b.OnMouseIn;break;case "mouseout":c=b.OnMouseOut;break;case "click":c=b.OnClick;break;case "dblclick":c=b.OnDblClick;break;case "contextmenu":c=b.OnRightClick}Function.isFunction(c)&&c.apply(b)};
bbbfly.map.drawing.layer._updateZIndex=function(a){if(this.Owner.GetStateValue(bbbfly.MapDrawing.state.selected)){var b=this.options?this.options.riseOffset:0;a=a>b?a:b}this._updateZIndex.callParent(a)};bbbfly.map.drawing.marker._create=function(a){if(!Object.isObject(a))return null;a=a.Coordinates;var b=null;bbbfly.map.drawing.utils.IsLatLng(a)&&(b=L.marker(a,{riseOnHover:!0,riseOffset:999999}),ng_OverrideMethod(b,"_updateZIndex",bbbfly.map.drawing.layer._updateZIndex));return[b]};
bbbfly.map.drawing.geometry._create=function(a){if(!Object.isObject(a))return null;a=a.GeoJSON;a instanceof L.GeoJSON||(a=bbbfly.map.drawing.utils.NormalizeGeoJSON(a),a=new L.GeoJSON(a));a=a.getLayers();if(!Array.isArray(a))return[];for(var b in a)ng_OverrideMethod(a[b],"_project",bbbfly.map.drawing.geometry._project);return a};
bbbfly.map.drawing.geometry._project=function(){this._project.callParent();var a=this.getElement();if(a){var b=this.Owner.Options;b=b?b.MinPartSize:null;var c="block";if(Number.isInteger(b)){var d=this._pxBounds.getSize();if(d.x<b||d.y<b)c="none"}a.style.display=c}};bbbfly.map.drawing.handler._getDrawing=function(a){a=this._Drawings[a];return a instanceof bbbfly.MapDrawing?a:null};
bbbfly.map.drawing.handler._addDrawing=function(a){return a instanceof bbbfly.MapDrawing&&String.isString(a.Id)&&!this._Drawings[a.Id]&&a.Add(this._Feature)?(this._Drawings[a.Id]=a,!0):!1};bbbfly.map.drawing.handler._removeDrawing=function(a){return a instanceof bbbfly.MapDrawing&&String.isString(a.Id)&&this._Drawings[a.Id]&&a.Remove(this._Feature)?(delete this._Drawings[a.Id],!0):!1};
bbbfly.MapDrawing=function(a){Object.isObject(a)||(a=null);var b=a?a.Id:null;String.isString(b)||(b="_"+ ++bbbfly.map.drawing._lastId);this.Id=b;this.Options=a;this._State=0;this._Layers=[];this._ParentFeature=null;this._Initialized=!1;this.Initialize=bbbfly.map.drawing._initialize;this.GetState=bbbfly.map.drawing._getState;this.GetStateValue=bbbfly.map.drawing._getStateValue;this.SetStateValue=bbbfly.map.drawing._setStateValue;this.ToggleStateValue=bbbfly.map.drawing._toggleStateValue;this.Dispose=
bbbfly.map.drawing._dispose;this.Create=null;this.Update=bbbfly.map.drawing._update;this.Add=bbbfly.map.drawing._add;this.Remove=bbbfly.map.drawing._remove;this.OnMouseIn=bbbfly.map.drawing._onMouseIn;this.OnMouseOut=bbbfly.map.drawing._onMouseOut;this.OnDblClick=this.OnClick=bbbfly.map.drawing._onClick;this.OnRightClick=null};bbbfly.MapDrawing.state={mouseover:1,disabled:2,selected:4,grayed:8};
bbbfly.MapIcon=function(a){a=new bbbfly.MapDrawing(a);ng_OverrideMethod(a,"Create",bbbfly.map.drawing.marker._create);this.__proto__=a};bbbfly.MapGeometry=function(a){a=new bbbfly.MapDrawing(a);ng_OverrideMethod(a,"Create",bbbfly.map.drawing.geometry._create);this.__proto__=a};
bbbfly.MapDrawingsHandler=function(a){if(!(a instanceof L.FeatureGroup))return null;this._Feature=a;this._Drawings={};this.GetDrawing=bbbfly.map.drawing.handler._getDrawing;this.AddDrawing=bbbfly.map.drawing.handler._addDrawing;this.RemoveDrawing=bbbfly.map.drawing.handler._removeDrawing;return this};
