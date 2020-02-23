/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.drawing={_leafletPrefix:"lf-",_lastId:0,_styles:{},utils:{},layer:{},core:{},item:{},group:{},cluster:{},handler:{}};bbbfly.map.drawing.utils.LeafletId=function(a){a=Object.isObject(a)?a._leaflet_id:null;return Number.isInteger(a)?bbbfly.map.drawing._leafletPrefix+a:a};
bbbfly.map.drawing.utils.DrawingId=function(a){a=a?a.ID:null;return String.isString(a)?a:"_"+ ++bbbfly.map.drawing._lastId};bbbfly.map.drawing.utils.GetDrawingStyle=function(a){return String.isString(a)&&(a=bbbfly.map.drawing._styles[a],Object.isObject(a))?a:null};bbbfly.map.drawing.utils.DefineDrawingStyle=function(a,b){if(!Object.isObject(b)||!String.isString(a))return!1;var c=bbbfly.map.drawing._styles;if("undefined"!==typeof c[a])return!1;c[a]=b;return!0};
bbbfly.map.drawing.utils.IsLatLng=function(a){return Array.isArray(a)||a instanceof L.LatLng};
bbbfly.map.drawing.utils.NormalizeGeoJSON=function(a){if(!Object.isObject(a))return null;var b=function(a,b,c){for(var d in a.geometry.coordinates)c.push({type:"Feature",properties:a.properties,geometry:{type:b,coordinates:a.geometry.coordinates[d]}})},c=function(a){if("FeatureCollection"===a.type){var e={type:a.type,features:[]};if(Array.isArray(a.features))for(var d in a.features){var f=a.features[d];switch(f.type){case "FeatureCollection":e.features.push(c(f));break;case "Feature":var h=e.features;
if(f.geometry)switch(f.geometry.type){case "MultiLineString":b(f,"LineString",h);break;case "MultiPolygon":b(f,"Polygon",h);break;default:h.push(f)}}}return e}return null};return c(a)};bbbfly.map.drawing.utils.InitMouseEvents=function(a,b,c){a instanceof L.Layer&&(String.isString(b)||(b=""),Function.isFunction(c)||(c=bbbfly.map.drawing.layer._onMouseEvent),a.on(b+"mouseover",c),a.on(b+"mouseout",c),a.on(b+"click",c),a.on(b+"dblclick",c),a.on(b+"contextmenu",c))};
bbbfly.map.drawing.layer._onMouseEvent=function(a){var b=a.target.Owner,c=null;switch(a.type){case "mouseover":case "clustermouseover":c=b.OnMouseEnter;break;case "mouseout":case "clustermouseout":c=b.OnMouseLeave;break;case "click":case "clusterclick":c=b.OnClick;break;case "dblclick":case "clusterdblclick":c=b.OnDblClick;break;case "contextmenu":case "clustercontextmenu":c=b.OnRightClick}Function.isFunction(c)&&c.apply(b,[a.sourceTarget])};
bbbfly.map.drawing.core._initialize=function(){if(this._Initialized)return!0;if(!Function.isFunction(this.Create))return!1;var a=this.Create();if(Object.isObject(a)){if(!this.DoInitialize(a))return!1}else if(Array.isArray(a))for(var b in a){if(!this.DoInitialize(a[b]))return!1}else return!1;return this._Initialized=!0};
bbbfly.map.drawing.core._doInitialize=function(a,b){if(!(a instanceof L.Layer))return!1;String.isString(b)||(b="");bbbfly.map.drawing.utils.InitMouseEvents(a,b);L.Util.stamp(a);a.Owner=this;this._Layers.push(a);return!0};bbbfly.map.drawing.core._dispose=function(){this.Scan(function(a){a.remove()});this._Layers=[];this._ParentFeature=null;this._Initialized=!1};
bbbfly.map.drawing.core._addTo=function(a){return this._ParentFeature?!1:a instanceof L.FeatureGroup&&this.Initialize()?(this.Scan(function(b){b.addTo(a)}),this._ParentFeature=a,Function.isFunction(this.Update)&&this.Update(),!0):!1};bbbfly.map.drawing.core._removeFrom=function(a){a||(a=this._ParentFeature);if(a!==this._ParentFeature)return!1;this.Scan(function(b){b.removeFrom(a)});this._ParentFeature=null;return!0};
bbbfly.map.drawing.core._getGeoJSON=function(){var a=[],b;for(b in this._Layers)a.push(this._Layers[b].toGeoJSON());return a};bbbfly.map.drawing.core._scan=function(a,b){Boolean.isBoolean(b)||(b=!1);if(Function.isFunction(a))for(var c in this._Layers){var d=a(this._Layers[c]);if(Boolean.isBoolean(d))return d}return b};
bbbfly.map.drawing.item._create=function(){var a=this.Options.Geometry,b=this.Options.Coords,c=Object.isObject(a),d=bbbfly.map.drawing.utils.IsLatLng(b),e=this.Options.CoordsToGeoCenter;Boolean.isBoolean(e)||(e=!0);this._Marker=this._Geometry=null;var g=[];c&&(c=this.GetGeometryStyle(),a=bbbfly.map.drawing.utils.NormalizeGeoJSON(a),this._Geometry=a=new L.GeoJSON(a,{Owner:this,style:c,onEachFeature:bbbfly.map.drawing.item._initGeometry}),g.push(a));!d&&e&&(b=this.GetGeometryCenter())&&(d=!0);d&&(b=
L.marker(b,{riseOnHover:!0,riseOffset:999999}),ng_OverrideMethod(b,"_updateZIndex",bbbfly.map.drawing.item._updateIconZIndex),this._Marker=b,g.push(b));return g};bbbfly.map.drawing.item._updateIconZIndex=function(a){if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){var b=this.options?this.options.riseOffset:0;a=a>b?a:b}this._updateZIndex.callParent(a)};bbbfly.map.drawing.item._initGeometry=function(a,b){ng_OverrideMethod(b,"_project",bbbfly.map.drawing.item._projectGeometry)};
bbbfly.map.drawing.item._projectGeometry=function(){this._project.callParent();var a=this.getElement();if(a){var b=this.options.Owner,c=b.Options.MinGeometrySize;Number.isInteger(c)||(c=25);b.GetGeometrySize()<c?a.style.display="none":a.style.display="block"}};
bbbfly.map.drawing.item._update=function(){var a=this.GetState();if(this._Marker){var b=this.GetIconStyle(),c=a.mouseover;a.mouseover=!1;var d=bbbfly.Renderer.StackProxy(b.images,a,this.ID+"_I"),e=bbbfly.Renderer.StackHTML(d,a,"MapIconImg");this._IconProxy=d;a.mouseover=c;e!==this._IconHtml&&(this._IconHtml=e,b=L.divIcon({iconSize:[d.W,d.H],iconAnchor:[d.Anchor.L,d.Anchor.T],className:b.className,html:e}),this._Marker.setIcon(b),c&&bbbfly.Renderer.UpdateStackHTML(d,a))}};
bbbfly.map.drawing.item._getIconStyle=function(){var a=bbbfly.MapDrawingItem.IconStyle,b=this.Options.IconStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.map.drawing.utils.GetDrawingStyle(b));return b instanceof a?b:new a};bbbfly.map.drawing.item._getGeometryStyle=function(){var a=bbbfly.MapDrawingItem.GeometryStyle,b=this.Options.GeometryStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.map.drawing.utils.GetDrawingStyle(b));return b instanceof a?b:new a};
bbbfly.map.drawing.item._getGeometryCenter=function(){if(this._Geometry){var a=this._Geometry.getBounds();if(a.isValid())return a=a.getCenter(),[a.lat,a.lng]}return null};
bbbfly.map.drawing.item._getGeometrySize=function(){if(this._Geometry){var a=new L.Bounds(new L.Point(Number.MIN_VALUE,Number.MIN_VALUE),new L.Point(Number.MAX_VALUE,Number.MAX_VALUE)),b=!1;this._Geometry.eachLayer(function(c){(c=c._pxBounds)&&c.isValid()&&(c.min.x<a.max.x&&(a.max.x=c.min.x),c.min.y<a.max.y&&(a.max.y=c.min.y),c.max.x>a.min.x&&(a.min.x=c.max.x),c.max.y>a.min.y&&(a.min.y=c.max.y),b=!0)});if(b&&a.isValid()){var c=a.getSize(),d=0;c.x&&(d+=Math.pow(c.x,2));c.y&&(d+=Math.pow(c.y,2));return Math.ceil(Math.sqrt(d))}}return 0};
bbbfly.map.drawing.item._getState=function(){var a={mouseover:this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover),disabled:this.GetStateValue(bbbfly.MapDrawingItem.state.disabled),selected:this.GetStateValue(bbbfly.MapDrawingItem.state.selected),grayed:this.GetStateValue(bbbfly.MapDrawingItem.state.grayed)};a.disabled&&(a.mouseover=!1);return a};bbbfly.map.drawing.item._getStateValue=function(a){return!!(this._State&a)};
bbbfly.map.drawing.item._setStateValue=function(a,b,c){if(b===!!(this._State&a))return!1;this._State=b?this._State|a:this._State^a;c&&this.Update();return!0};bbbfly.map.drawing.item._getSelected=function(){return this.GetStateValue(bbbfly.MapDrawingItem.state.selected)};
bbbfly.map.drawing.item._setSelected=function(a,b){Boolean.isBoolean(a)||(a=!0);if(this.GetSelected()===a)return!0;if(Function.isFunction(this.OnSetSelected)&&!this.OnSetSelected())return!1;var c=bbbfly.MapDrawingItem.state.selected;Boolean.isBoolean(b)||(b=!0);this.SetStateValue(c,a,b);Function.isFunction(this.OnSelectedChanged)&&this.OnSelectedChanged();return!0};
bbbfly.map.drawing.item._onMouseEnter=function(){this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,!0);bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState())};bbbfly.map.drawing.item._onMouseLeave=function(){this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,!1);bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState())};bbbfly.map.drawing.item._onClick=function(){this.Options.SelectType&bbbfly.MapDrawingItem.selecttype.click&&this.SetSelected(!this.GetSelected(),!0)};
bbbfly.map.drawing.item._onDblClick=function(){this.Options.SelectType&bbbfly.MapDrawingItem.selecttype.dblclick&&this.SetSelected(!this.GetSelected(),!0)};
bbbfly.map.drawing.cluster._create=function(){var a=this.GetSpiderStyle(),b=this.Options.Radius;Number.isInteger(b)||(b=50);a=new L.MarkerClusterGroup({iconCreateFunction:bbbfly.map.drawing.cluster._createIcon,removeOutsideVisibleBounds:!1,showCoverageOnHover:!1,zoomToBoundsOnClick:!0,maxClusterRadius:b,spiderfyOnMaxZoom:!!a,spiderLegPolylineOptions:a});a.on("spiderfied",bbbfly.map.drawing.cluster._onSpiderfyChanged);a.on("unspiderfied",bbbfly.map.drawing.cluster._onSpiderfyChanged);this._ClusterGroup=
a;return[a]};bbbfly.map.drawing.cluster._update=function(){this._ClusterGroup&&this._ClusterGroup.refreshClusters()};bbbfly.map.drawing.cluster._getState=function(a,b){var c={};if(a instanceof L.MarkerCluster&&a._group._spiderfied!==a){a=a.getAllChildMarkers();for(var d in a)if(a[d].Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){c.selected=!0;break}}Object.isObject(b)&&ng_MergeVarReplace(c,b,!0);return c};
bbbfly.map.drawing.cluster._doInitialize=function(a){return this.DoInitialize.callParent(a,"cluster")};bbbfly.map.drawing.cluster._onMouseEnter=function(a){var b=this.GetState(a,{mouseover:!0}),c=bbbfly.map.drawing.utils.LeafletId(a);bbbfly.Renderer.UpdateStackHTML(a._iconProxy,b,c)};bbbfly.map.drawing.cluster._onMouseLeave=function(a){var b=this.GetState(a,{mouseover:!1}),c=bbbfly.map.drawing.utils.LeafletId(a);bbbfly.Renderer.UpdateStackHTML(a._iconProxy,b,c)};
bbbfly.map.drawing.cluster._createIcon=function(a){var b=a._group.Owner,c=a.getChildCount(),d=b.GetIconStyle(c),e=b.GetState(a),g=bbbfly.map.drawing.utils.LeafletId(a),f=bbbfly.Renderer.StackProxy(d.images,e);e=bbbfly.Renderer.StackHTML(f,e,"MapIconImg",g);b=b.Options.ShowNumber;Boolean.isBoolean(b)||(b=!0);b&&(b=Array.isArray(f.Imgs)?f.Imgs.length:0,b={display:"block",position:"absolute","text-align":"center",padding:bbbfly.Renderer.StyleDim(0),margin:bbbfly.Renderer.StyleDim(0),"z-index":(b+1).toString()},
b=bbbfly.Renderer.StyleToString(b),e+='<span id="'+g+'_T" class="MapIconText"'+b+">"+c+"</span>");a._iconProxy=f;return L.divIcon({iconSize:[f.W,f.H],iconAnchor:[f.Anchor.L,f.Anchor.T],className:d.className,html:e})};bbbfly.map.drawing.cluster._onSpiderfyChanged=function(){this.Owner.Update()};
bbbfly.map.drawing.cluster._getIconStyle=function(a){var b=bbbfly.MapDrawingItem.IconStyle,c=this.Options.IconStyle;if(c instanceof b)return c;if(Array.isArray(c)&&Number.isInteger(a))for(var d in c){var e=c[d],g=Number.isInteger(e.from)?e.from:null,f=Number.isInteger(e.to)?e.to:null;if((null===g||a>=g)&&(null===f||a<=f)){c=e.style;break}}String.isString(c)&&(c=bbbfly.map.drawing.utils.GetDrawingStyle(c));return c instanceof b?c:new b};
bbbfly.map.drawing.cluster._getSpiderStyle=function(){var a=bbbfly.MapDrawingItem.GeometryStyle,b=this.Options.SpiderStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.map.drawing.utils.GetDrawingStyle(b));return b instanceof a?b:new a};bbbfly.map.drawing.cluster._addDrawing=function(a){return a instanceof bbbfly.MapDrawing?this.Scan(function(b){if(a.AddTo(b))return!0},!1):!1};
bbbfly.map.drawing.cluster._removeDrawing=function(a){return a instanceof bbbfly.MapDrawing?this.Scan(function(b){if(a.RemoveFrom(b))return!0},!1):!1};bbbfly.map.drawing.handler._getDrawing=function(a){a=this._Drawings[a];return a instanceof bbbfly.MapDrawing?a:null};
bbbfly.map.drawing.handler._addDrawing=function(a){if(!(a instanceof bbbfly.MapDrawing&&String.isString(a.ID)&&!this._Drawings[a.ID]&&(this._CurrentCluster?this._CurrentCluster.AddDrawing(a):a.AddTo(this._Feature))))return!1;a instanceof bbbfly.MapDrawingItem&&(a.AddEvent("OnSetSelected",this._drawing_onSetSelected,!0),a.AddEvent("OnSelectedChanged",this._drawing_onSelectedChanged,!0));this._Drawings[a.ID]=a;return!0};
bbbfly.map.drawing.handler._removeDrawing=function(a){return a instanceof bbbfly.MapDrawing&&a===this._Drawings[a.ID]?a.RemoveFrom()?(delete this._Drawings[a.ID],a instanceof bbbfly.MapDrawingItem&&(a.RemoveEvent("OnSetSelected",this._drawing_onSetSelected),a.RemoveEvent("OnSelectedChanged",this._drawing_onSelectedChanged)),!0):!1:!1};bbbfly.map.drawing.handler._clearDrawings=function(){for(var a in this._Drawings)this._Drawings[a].RemoveFrom()&&delete this._Drawings[a]};
bbbfly.map.drawing.handler._beginClustering=function(a){a&&(a.Initialize(),this._CurrentCluster=a)};bbbfly.map.drawing.handler._endClustering=function(){if(!this._CurrentCluster)return!1;var a=this._CurrentCluster;this._CurrentCluster=null;return this.AddDrawing(a)};bbbfly.map.drawing.handler._getSelectedDrawings=function(a){var b=[],c;for(c in this._Drawings){var d=this._Drawings[c];Boolean.isBoolean(a)&&d.GetSelected()!==a||b.push(d)}};
bbbfly.map.drawing.handler._clearSelected=function(){for(var a in this._Selected){var b=this._Selected[a];Function.isFunction(b.SetSelected)&&b.SetSelected(!1,!0)}};bbbfly.map.drawing.handler._onSetSelected=function(){switch(this.Options.SelectType){case bbbfly.MapDrawingsHandler.selecttype.single:case bbbfly.MapDrawingsHandler.selecttype.multi:return!0}return!1};
bbbfly.map.drawing.handler._onSelectedChanged=function(a){if(a.GetSelected())switch(this.Options.SelectType){case bbbfly.MapDrawingsHandler.selecttype.single:this.ClearSelected();case bbbfly.MapDrawingsHandler.selecttype.multi:this._Selected[a.ID]=a}else this._Selected[a.ID]===a&&delete this._Selected[a.ID]};
bbbfly.MapDrawing=function(a){Object.isObject(a)||(a={});this.AddEvent=ngObjAddEvent;this.RemoveEvent=ngObjRemoveEvent;this.ID=bbbfly.map.drawing.utils.DrawingId(a);this.Options=a;this._Layers=[];this._ParentFeature=null;this._Initialized=!1;this.Initialize=bbbfly.map.drawing.core._initialize;this.DoInitialize=bbbfly.map.drawing.core._doInitialize;this.Update=this.Create=null;this.Dispose=bbbfly.map.drawing.core._dispose;this.AddTo=bbbfly.map.drawing.core._addTo;this.RemoveFrom=bbbfly.map.drawing.core._removeFrom;
this.GetGeoJSON=bbbfly.map.drawing.core._getGeoJSON;this.Scan=bbbfly.map.drawing.core._scan;this.OnRightClick=this.OnDblClick=this.OnClick=this.OnMouseLeave=this.OnMouseEnter=null};
bbbfly.MapDrawingItem=bbbfly.object.Extend(bbbfly.MapDrawing,function(a){bbbfly.MapDrawing.call(this,a);this._State=0;this._IconProxy=this._Marker=null;this._IconHtml="";this._Geometry=null;ng_OverrideMethod(this,"Create",bbbfly.map.drawing.item._create);ng_OverrideMethod(this,"Update",bbbfly.map.drawing.item._update);ng_OverrideMethod(this,"OnMouseEnter",bbbfly.map.drawing.item._onMouseEnter);ng_OverrideMethod(this,"OnMouseLeave",bbbfly.map.drawing.item._onMouseLeave);ng_OverrideMethod(this,"OnClick",
bbbfly.map.drawing.item._onClick);ng_OverrideMethod(this,"OnDblClick",bbbfly.map.drawing.item._onDblClick);this.GetIconStyle=bbbfly.map.drawing.item._getIconStyle;this.GetGeometryStyle=bbbfly.map.drawing.item._getGeometryStyle;this.GetGeometryCenter=bbbfly.map.drawing.item._getGeometryCenter;this.GetGeometrySize=bbbfly.map.drawing.item._getGeometrySize;this.GetState=bbbfly.map.drawing.item._getState;this.GetStateValue=bbbfly.map.drawing.item._getStateValue;this.SetStateValue=bbbfly.map.drawing.item._setStateValue;
this.GetSelected=bbbfly.map.drawing.item._getSelected;this.SetSelected=bbbfly.map.drawing.item._setSelected;this.OnSelectedChanged=this.OnSetSelected=null;return this});bbbfly.MapDrawingItem.IconStyle=function(a,b){Array.isArray(a)||(a=null);String.isString(b)||(b="");this.images=a;this.className=b};
bbbfly.MapDrawingItem.GeometryStyle=function(a){this.fill=this.stroke=!1;this.weight=1;this.color="#000000";this.fillColor=void 0;this.opacity=1;this.fillOpacity=.2;Object.isObject(a)&&(Number.isInteger(a.weight)&&(this.weight=a.weight),String.isString(a.color)&&(this.color=a.color),String.isString(a.fillColor)&&(this.fillColor=a.fillColor),Number.isNumber(a.opacity)&&(this.opacity=a.opacity),Number.isNumber(a.fillOpacity)&&(this.fillOpacity=a.fillOpacity),this.stroke=!!(0<this.weight&&0<this.opacity),
this.fill=!!(this.fillColor&&0<this.fillOpacity))};bbbfly.MapDrawingItem.state={mouseover:1,disabled:2,selected:4,grayed:8};bbbfly.MapDrawingItem.selecttype={none:0,click:1,dblclick:2,both:3};
bbbfly.MapDrawingCluster=bbbfly.object.Extend(bbbfly.MapDrawing,function(a){bbbfly.MapDrawing.call(this,a);this._ClusterGroup=null;ng_OverrideMethod(this,"Create",bbbfly.map.drawing.cluster._create);ng_OverrideMethod(this,"Update",bbbfly.map.drawing.cluster._update);ng_OverrideMethod(this,"DoInitialize",bbbfly.map.drawing.cluster._doInitialize);ng_OverrideMethod(this,"OnMouseEnter",bbbfly.map.drawing.cluster._onMouseEnter);ng_OverrideMethod(this,"OnMouseLeave",bbbfly.map.drawing.cluster._onMouseLeave);
this.GetState=bbbfly.map.drawing.cluster._getState;this.GetIconStyle=bbbfly.map.drawing.cluster._getIconStyle;this.GetSpiderStyle=bbbfly.map.drawing.cluster._getSpiderStyle;this.AddDrawing=bbbfly.map.drawing.cluster._addDrawing;this.RemoveDrawing=bbbfly.map.drawing.cluster._removeDrawing;return this});
bbbfly.MapDrawingsHandler=function(a,b){if(!(a instanceof L.FeatureGroup))return null;Object.isObject(b)||(b={});var c=this;this.Options=b;this._Feature=a;this._Drawings={};this._Selected={};this._CurrentCluster=null;this._drawing_onSetSelected=function(){return c.OnSetSelected(this)};this._drawing_onSelectedChanged=function(){c.OnSelectedChanged(this)};this.GetDrawing=bbbfly.map.drawing.handler._getDrawing;this.AddDrawing=bbbfly.map.drawing.handler._addDrawing;this.RemoveDrawing=bbbfly.map.drawing.handler._removeDrawing;
this.ClearDrawings=bbbfly.map.drawing.handler._clearDrawings;this.BeginClustering=bbbfly.map.drawing.handler._beginClustering;this.EndClustering=bbbfly.map.drawing.handler._endClustering;this.GetSelectedDrawings=bbbfly.map.drawing.handler._getSelectedDrawings;this.ClearSelected=bbbfly.map.drawing.handler._clearSelected;this.OnSetSelected=bbbfly.map.drawing.handler._onSetSelected;this.OnSelectedChanged=bbbfly.map.drawing.handler._onSelectedChanged};
bbbfly.MapDrawingsHandler.selecttype={none:0,single:1,multi:2};
