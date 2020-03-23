/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.drawing={_leafletPrefix:"bbbfly_map_drawing_lf-",_packagePrefix:"bbbfly_map_drawing-",_lastId:0,_styles:{},utils:{},layer:{},core:{},item:{},cluster:{listener:{}},handler:{listener:{}}};
bbbfly.map.drawing.utils.LeafletId=function(a){a=Object.isObject(a)?L.stamp(a):null;return Number.isInteger(a)?bbbfly.map.drawing._leafletPrefix+a:a};bbbfly.map.drawing.utils.DrawingId=function(a){a=a?a.ID:null;if(String.isString(a))return a;a=bbbfly.map.drawing._packagePrefix;return a+ ++bbbfly.map.drawing._lastId};
bbbfly.map.drawing.utils.NormalizeGeoJSON=function(a){var b=[],c=function(a,c){if(Array.isArray(a.geometry.coordinates))for(var d in a.geometry.coordinates)b.push({type:"Feature",properties:a.properties,geometry:{type:c,coordinates:a.geometry.coordinates[d]}})},d=function(a){if(Object.isObject(a))switch(a.type){case "FeatureCollection":if(Array.isArray(a.features))for(var e in a.features)d(a.features[e]);break;case "Feature":if(Object.isObject(a.geometry))switch(a.geometry.type){case "MultiLineString":c(a,
"LineString");break;case "MultiPolygon":c(a,"Polygon");break;default:b.push(a)}}};d(a);return{type:"FeatureCollection",features:b}};bbbfly.map.drawing.utils.InitMouseEvents=function(a,b,c){a instanceof L.Layer&&(String.isString(b)||(b=""),Function.isFunction(c)||(c=bbbfly.map.drawing.layer._onMouseEvent),a.on(b+"mouseover",c),a.on(b+"mouseout",c),a.on(b+"click",c),a.on(b+"dblclick",c),a.on(b+"contextmenu",c))};
bbbfly.map.drawing.layer._onMouseEvent=function(a){var b=a.target.Owner,c=null;switch(a.type){case "mouseover":case "clustermouseover":c=b.OnMouseEnter;break;case "mouseout":case "clustermouseout":c=b.OnMouseLeave;break;case "click":case "clusterclick":c=b.OnClick;break;case "dblclick":case "clusterdblclick":c=b.OnDblClick;break;case "contextmenu":case "clustercontextmenu":c=b.OnRightClick}Function.isFunction(c)&&c.apply(b,[a.sourceTarget])};
bbbfly.map.drawing.core._initialize=function(){if(this._Initialized)return!0;if(!Function.isFunction(this.Create))return!1;var a=this.Create();if(Object.isObject(a)){if(!this.DoInitialize(a))return!1}else if(Array.isArray(a))for(var b in a){if(!this.DoInitialize(a[b]))return!1}else return!1;return this._Initialized=!0};
bbbfly.map.drawing.core._doInitialize=function(a,b){if(!(a instanceof L.Layer))return!1;String.isString(b)||(b="");bbbfly.map.drawing.utils.InitMouseEvents(a,b);L.Util.stamp(a);a.Owner=this;this._Layers.push(a);return!0};bbbfly.map.drawing.core._checkEmpty=function(){if(0<this._Layers.length)return!1;Function.isFunction(this.OnEmpty)&&this.OnEmpty();return!0};
bbbfly.map.drawing.core._dispose=function(){var a=this._ParentFeature;a&&this.Scan(function(b){b.removeFrom(a)});this._Layers=[];this._ParentFeature=null;this._Initialized=!1};bbbfly.map.drawing.core._setHandler=function(a){if(!(a instanceof bbbfly.MapDrawingsHandler)||this._Handler&&this._Handler!==a&&!this._Handler.RemoveDrawing(this))return!1;this._Handler=a;return!0};
bbbfly.map.drawing.core._addTo=function(a){return this._ParentFeature?!1:a instanceof L.FeatureGroup&&this.Initialize()?(this._ParentFeature=a,this.Scan(function(b){b.addTo(a)}),Function.isFunction(this.Update)&&this.Update(),!0):!1};bbbfly.map.drawing.core._removeFrom=function(a){a||(a=this._ParentFeature);if(a!==this._ParentFeature)return!1;this.Scan(function(b){b.removeFrom(a)});this._ParentFeature=null;return!0};
bbbfly.map.drawing.core._removeLayer=function(a){if(a instanceof L.Layer)for(var b=this._ParentFeature,c=this._Layers.length-1;0<=c;c--){var d=this._Layers[c];if(d===a){b&&d.removeFrom(b);this._Layers.splice(c,1);break}}return 0<this._Layers.length};bbbfly.map.drawing.core._getGeoJSON=function(){var a=[],b;for(b in this._Layers)a.push(this._Layers[b].toGeoJSON());return a};
bbbfly.map.drawing.core._scan=function(a,b){Boolean.isBoolean(b)||(b=!1);if(Function.isFunction(a))for(var c=this._Layers.length-1;0<=c;c--){var d=a(this._Layers[c],c,this._Layers);if(Boolean.isBoolean(d))return d}return b};
bbbfly.map.drawing.item._create=function(){var a=this.Options.Geometry,b=this.Options.Coords,c=Object.isObject(a),d=b instanceof L.LatLng,e=this.Options.CoordsToGeoCenter;Boolean.isBoolean(e)||(e=!1);var g=this.Options.ShowGeometry;Boolean.isBoolean(g)||(g=!0);this._Marker=this._Geometry=null;var f=[];if(c){a=bbbfly.map.drawing.utils.NormalizeGeoJSON(a);a=new L.GeoJSON(a);c=a.getLayers();var k=this.GetGeometryStyle(),l;for(l in c){var h=c[l];h instanceof L.Path&&(h.options.Owner=this,ng_OverrideMethod(h,
"_project",bbbfly.map.drawing.item._projectGeometry),k&&h.setStyle(k),g&&f.push(h))}this._Geometry=a}!d&&e&&(b=this.GetGeometryCenter())&&(d=!0);d&&(b=L.marker(b,{riseOnHover:!0,riseOffset:999999}),ng_OverrideMethod(b,"_updateZIndex",bbbfly.map.drawing.item._updateIconZIndex),this._Marker=b,f.push(b));return f};bbbfly.map.drawing.item._updateIconZIndex=function(a){if(this.Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){var b=this.options?this.options.riseOffset:0;a=a>b?a:b}this._updateZIndex.callParent(a)};
bbbfly.map.drawing.item._projectGeometry=function(){this._project.callParent();var a=this.getElement();if(a){var b=this.options.Owner,c=b.Options.MinGeometrySize;Number.isInteger(c)||(c=b._Handler.Options.MinGeometrySize,Number.isInteger(c)||(c=0));b=b.GetGeometrySize();a.style.display=0>=b||b<c?"none":"block"}};
bbbfly.map.drawing.item._update=function(){var a=this.GetState();if(this._Marker){var b=this.GetIconStyle(),c=a.mouseover;a.mouseover=!1;var d=bbbfly.Renderer.StackProxy(b.images,a,this.ID+"_I"),e=bbbfly.Renderer.StackHTML(d,a,"MapIconImg");this._IconProxy=d;a.mouseover=c;e!==this._IconHtml&&(this._IconHtml=e,b=new L.DivIcon({iconSize:[d.W,d.H],iconAnchor:[d.Anchor.L,d.Anchor.T],className:b.className,html:e}),this._Marker.setIcon(b),c&&bbbfly.Renderer.UpdateStackHTML(d,a))}this.UpdateTooltip()};
bbbfly.map.drawing.item._dispose=function(){this._Tooltip&&this._Tooltip.Dispose();this.Dispose.callParent()};bbbfly.map.drawing.item._newIcon=function(a,b){String.isString(b)||(b=bbbfly.map.drawing.utils.DrawingId());var c=this.GetIconStyle();b=bbbfly.Renderer.StackProxy(c.images,a,b+"_I");a=bbbfly.Renderer.StackHTML(b,a,"MapIconImg");return new L.DivIcon({iconSize:[b.W,b.H],iconAnchor:[b.Anchor.L,b.Anchor.T],className:c.className,html:a})};
bbbfly.map.drawing.item._getIconStyle=function(){var a=bbbfly.MapDrawingItem.IconStyle,b=this.Options.IconStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.MapDrawingItem.Style.Get(b));return b instanceof a?b:new a};bbbfly.map.drawing.item._getGeometryStyle=function(){var a=bbbfly.MapDrawingItem.GeometryStyle,b=this.Options.GeometryStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.MapDrawingItem.Style.Get(b));return b instanceof a?b:new a};
bbbfly.map.drawing.item._getGeometryCenter=function(){if(this._Geometry){var a=this._Geometry.getBounds();if(a.isValid())return a=a.getCenter(),new L.LatLng(a.lat,a.lng)}return null};
bbbfly.map.drawing.item._getGeometrySize=function(){if(!this._ParentFeature)return 0;var a=this._ParentFeature._map,b=this._Geometry;if(!a||!b)return 0;b=b.getBounds();return(a=new L.Bounds(a.latLngToLayerPoint(b.getSouthWest()),a.latLngToLayerPoint(b.getNorthEast())),a.isValid())?(a=a.getSize(),b=0,a.x&&(b+=Math.pow(a.x,2)),a.y&&(b+=Math.pow(a.y,2)),Math.ceil(Math.sqrt(b))):0};bbbfly.map.drawing.item._clearIcon=function(){var a=this.RemoveLayer(this._Marker);this._Marker=null;return a};
bbbfly.map.drawing.item._clearGeometry=function(){var a=this.RemoveLayer(this._Geometry);this._Geometry=null;return a};bbbfly.map.drawing.item._setState=function(a,b){if(Object.isObject(a)){for(var c in a){var d=bbbfly.MapDrawingItem.state[c],e=a[c];Number.isInteger(d)&&Boolean.isBoolean(e)&&this.SetStateValue(d,e,!1)}b&&this.Update()}};
bbbfly.map.drawing.item._getState=function(){var a={mouseover:this.GetStateValue(bbbfly.MapDrawingItem.state.mouseover),disabled:this.GetStateValue(bbbfly.MapDrawingItem.state.disabled),readonly:this.GetStateValue(bbbfly.MapDrawingItem.state.readonly),selected:this.GetStateValue(bbbfly.MapDrawingItem.state.selected),grayed:this.GetStateValue(bbbfly.MapDrawingItem.state.grayed)};if(a.disabled||a.readonly)a.mouseover=!1;return a};
bbbfly.map.drawing.item._getStateValue=function(a){return!!(this._State&a)};bbbfly.map.drawing.item._setStateValue=function(a,b,c){if(b===!!(this._State&a))return!1;this._State=b?this._State|a:this._State^a;c&&this.Update();return!0};bbbfly.map.drawing.item._getSelected=function(){return this.GetStateValue(bbbfly.MapDrawingItem.state.selected)};
bbbfly.map.drawing.item._setSelected=function(a,b){Boolean.isBoolean(a)||(a=!0);if(this.GetSelected()===a)return!0;if(Function.isFunction(this.OnSetSelected)&&!this.OnSetSelected(this))return!1;var c=bbbfly.MapDrawingItem.state.selected;Boolean.isBoolean(b)||(b=!0);this.SetStateValue(c,a,b);Function.isFunction(this.OnSelectedChanged)&&this.OnSelectedChanged(this);return!0};bbbfly.map.drawing.item._updateTooltip=function(){var a=this.GetState();a.selected||a.mouseover?this.ShowTooltip():this.HideTooltip()};
bbbfly.map.drawing.item._showTooltip=function(){!this._Tooltip&&this.Options.TooltipOptions&&(this._Tooltip=new bbbfly.MapTooltip(this.Options.TooltipOptions));this._Tooltip&&this._Tooltip.Show(this._Marker||this._Geometry)};bbbfly.map.drawing.item._hideTooltip=function(){this._Tooltip&&this._Tooltip.Hide()};bbbfly.map.drawing.item._onMouseEnter=function(){this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,!0);bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());this.UpdateTooltip()};
bbbfly.map.drawing.item._onMouseLeave=function(){this.SetStateValue(bbbfly.MapDrawingItem.state.mouseover,!1);bbbfly.Renderer.UpdateStackHTML(this._IconProxy,this.GetState());this.UpdateTooltip()};bbbfly.map.drawing.item._onClick=function(){this.Options.SelectType&bbbfly.MapDrawingItem.selecttype.click&&this.SetSelected(!this.GetSelected(),!0)};bbbfly.map.drawing.item._onDblClick=function(){this.Options.SelectType&bbbfly.MapDrawingItem.selecttype.dblclick&&this.SetSelected(!this.GetSelected(),!0)};
bbbfly.map.drawing.cluster._create=function(){var a=this.GetSpiderStyle(),b=this;a=new L.MarkerClusterGroup({iconCreateFunction:bbbfly.map.drawing.cluster._createIcon,maxClusterRadius:function(){return bbbfly.map.drawing.cluster._maxClusterRadius(b)},spiderLegPolylineOptions:a,spiderfyOnMaxZoom:!!a,removeOutsideVisibleBounds:!1,showCoverageOnHover:!1,zoomToBoundsOnClick:!0});a.on("spiderfied",bbbfly.map.drawing.cluster._onSpiderfyChanged);a.on("unspiderfied",bbbfly.map.drawing.cluster._onSpiderfyChanged);
this._ClusterGroup=a;return[a]};bbbfly.map.drawing.cluster._update=function(){this._ClusterGroup&&this._ClusterGroup.refreshClusters()};bbbfly.map.drawing.cluster._getState=function(a,b){var c={};if(a instanceof L.MarkerCluster&&a._group._spiderfied!==a){a=a.getAllChildMarkers();for(var d in a)if(a[d].Owner.GetStateValue(bbbfly.MapDrawingItem.state.selected)){c.selected=!0;break}}Object.isObject(b)&&ng_MergeVarReplace(c,b,!0);return c};
bbbfly.map.drawing.cluster._doInitialize=function(a){return this.DoInitialize.callParent(a,"cluster")};bbbfly.map.drawing.cluster._onMouseEnter=function(a){var b=this.GetState(a,{mouseover:!0}),c=bbbfly.map.drawing.utils.LeafletId(a);bbbfly.Renderer.UpdateStackHTML(a._iconProxy,b,c)};bbbfly.map.drawing.cluster._onMouseLeave=function(a){var b=this.GetState(a,{mouseover:!1}),c=bbbfly.map.drawing.utils.LeafletId(a);bbbfly.Renderer.UpdateStackHTML(a._iconProxy,b,c)};
bbbfly.map.drawing.cluster._createIcon=function(a){var b=a._group.Owner,c=a.getChildCount(),d=b.GetIconStyle(c),e=b.GetState(a),g=bbbfly.map.drawing.utils.LeafletId(a),f=bbbfly.Renderer.StackProxy(d.images,e);e=bbbfly.Renderer.StackHTML(f,e,"MapIconImg",g);b=b.Options.ShowNumber;Boolean.isBoolean(b)||(b=!0);b&&(b=Array.isArray(f.Imgs)?f.Imgs.length:0,b={display:"block",position:"absolute","text-align":"center",padding:bbbfly.Renderer.StyleDim(0),margin:bbbfly.Renderer.StyleDim(0),"z-index":(b+1).toString()},
b=bbbfly.Renderer.StyleToString(b),e+='<span id="'+g+'_T" class="MapIconText"'+b+">"+c+"</span>");a._iconProxy=f;return L.divIcon({iconSize:[f.W,f.H],iconAnchor:[f.Anchor.L,f.Anchor.T],className:d.className,html:e})};bbbfly.map.drawing.cluster._maxClusterRadius=function(a){var b=a.Options.MaxClusterRadius;Number.isInteger(b)||(b=a._Handler.Options.MaxClusterRadius);Number.isInteger(b)||(b=null);return b};bbbfly.map.drawing.cluster._onSpiderfyChanged=function(){this.Owner.Update()};
bbbfly.map.drawing.cluster.listener._onSelectedChanged=function(){this.Owner.Update()};
bbbfly.map.drawing.cluster._getIconStyle=function(a){var b=bbbfly.MapDrawingItem.IconStyle,c=this.Options.IconStyle;if(c instanceof b)return c;if(Array.isArray(c)&&Number.isInteger(a))for(var d in c){var e=c[d],g=Number.isInteger(e.from)?e.from:null,f=Number.isInteger(e.to)?e.to:null;if((null===g||a>=g)&&(null===f||a<=f)){c=e.style;break}}String.isString(c)&&(c=bbbfly.MapDrawingItem.Style.Get(c));return c instanceof b?c:new b};
bbbfly.map.drawing.cluster._getSpiderStyle=function(){var a=bbbfly.MapDrawingItem.GeometryStyle,b=this.Options.SpiderStyle;if(b instanceof a)return b;String.isString(b)&&(b=bbbfly.MapDrawingItem.Style.Get(b));return b instanceof a?b:new a};bbbfly.map.drawing.cluster._addDrawing=function(a){if(!(a instanceof bbbfly.MapDrawing))return!1;this._DrawingListener&&a.AddListener(this._DrawingListener.Listen,this._DrawingListener);return this.Scan(function(b){if(a.AddTo(b))return!0},!1)};
bbbfly.map.drawing.cluster._removeDrawing=function(a){if(!(a instanceof bbbfly.MapDrawing))return!1;this._DrawingListener&&a.RemoveListener(this._DrawingListener.Listen,this._DrawingListener);return this.Scan(function(b){if(a.RemoveFrom(b))return!0},!1)};bbbfly.map.drawing.handler._getDrawing=function(a){a=this._Drawings[a];return a instanceof bbbfly.MapDrawing?a:null};
bbbfly.map.drawing.handler._addDrawing=function(a){if(!(a instanceof bbbfly.MapDrawing&&String.isString(a.ID)&&!this._Drawings[a.ID]&&a.SetHandler(this)&&(this._CurrentCluster?this._CurrentCluster.AddDrawing(a):a.AddTo(this._Feature))))return!1;a instanceof bbbfly.MapDrawingItem&&a.AddListener(this._DrawingListener.Listen,this._DrawingListener);this._Drawings[a.ID]=a;return!0};
bbbfly.map.drawing.handler._removeDrawing=function(a){return a instanceof bbbfly.MapDrawing&&a===this._Drawings[a.ID]?a.RemoveFrom()?(delete this._Drawings[a.ID],a instanceof bbbfly.MapDrawingItem&&a.RemoveListener(this._DrawingListener.Listen,this._DrawingListener),!0):!1:!1};bbbfly.map.drawing.handler._clearDrawings=function(){for(var a in this._Drawings){var b=this._Drawings[a];b.RemoveFrom()&&(delete this._Drawings[a],b.Dispose())}};
bbbfly.map.drawing.handler._clearIcons=function(){for(var a in this._Drawings){var b=this._Drawings[a];b.ClearIcon()||(delete this._Drawings[a],b.Dispose())}};bbbfly.map.drawing.handler._clearGeometries=function(){for(var a in this._Drawings){var b=this._Drawings[a];b.ClearGeometry()||(delete this._Drawings[a],b.Dispose())}};bbbfly.map.drawing.handler._beginClustering=function(a){a&&(a.Initialize(),this._CurrentCluster=a)};
bbbfly.map.drawing.handler._endClustering=function(){if(!this._CurrentCluster)return!1;var a=this._CurrentCluster;this._CurrentCluster=null;return this.AddDrawing(a)};bbbfly.map.drawing.handler._getSelected=function(a){Boolean.isBoolean(a)||(a=!0);var b=[],c;for(c in this._Drawings){var d=this._Drawings[c];d instanceof bbbfly.MapDrawingItem&&d.GetSelected()===a&&b.push(d)}return b};
bbbfly.map.drawing.handler._clearSelected=function(){for(var a in this._Selected){var b=this._Selected[a];Function.isFunction(b.SetSelected)&&b.SetSelected(!1,!0)}};bbbfly.map.drawing.handler.listener._onEmpty=function(){switch(this.Owner.Options.SelectType){case bbbfly.MapDrawingsHandler.selecttype.single:case bbbfly.MapDrawingsHandler.selecttype.multi:return!0}return!1};
bbbfly.map.drawing.handler.listener._onSelectedChanged=function(a){var b=this.Owner;if(a.GetSelected())switch(b.Options.SelectType){case bbbfly.MapDrawingsHandler.selecttype.single:this._ignoreSelectChange=!0,b.ClearSelected(),this._ignoreSelectChange=!1;case bbbfly.MapDrawingsHandler.selecttype.multi:b._Selected[a.ID]=a}else b._Selected[a.ID]===a&&delete b._Selected[a.ID];this._ignoreSelectChange||Function.isFunction(b.OnSelectedChanged)&&b.OnSelectedChanged()};
bbbfly.MapDrawing=function(a){Object.isObject(a)||(a={});this.AddEvent=ngObjAddEvent;this.RemoveEvent=ngObjRemoveEvent;bbbfly.listener.SetListenable(this,!0);this.ID=bbbfly.map.drawing.utils.DrawingId(a);this.Options=a;this._Layers=[];this._ParentFeature=this._Handler=null;this._Initialized=!1;this.Initialize=bbbfly.map.drawing.core._initialize;this.DoInitialize=bbbfly.map.drawing.core._doInitialize;this.CheckEmpty=bbbfly.map.drawing.core._checkEmpty;this.Update=this.Create=null;this.Dispose=bbbfly.map.drawing.core._dispose;
this.SetHandler=bbbfly.map.drawing.core._setHandler;this.AddTo=bbbfly.map.drawing.core._addTo;this.RemoveFrom=bbbfly.map.drawing.core._removeFrom;this.RemoveLayer=bbbfly.map.drawing.core._removeLayer;this.GetGeoJSON=bbbfly.map.drawing.core._getGeoJSON;this.Scan=bbbfly.map.drawing.core._scan;this.OnRightClick=this.OnDblClick=this.OnClick=this.OnMouseLeave=this.OnMouseEnter=this.OnEmpty=null};
bbbfly.MapDrawingItem=bbbfly.object.Extend(bbbfly.MapDrawing,function(a){bbbfly.MapDrawing.call(this,a);this._State=0;this._IconProxy=this._Marker=null;this._IconHtml="";this._Tooltip=this._Geometry=null;ng_OverrideMethod(this,"Create",bbbfly.map.drawing.item._create);ng_OverrideMethod(this,"Update",bbbfly.map.drawing.item._update);ng_OverrideMethod(this,"Dispose",bbbfly.map.drawing.item._dispose);ng_OverrideMethod(this,"OnMouseEnter",bbbfly.map.drawing.item._onMouseEnter);ng_OverrideMethod(this,
"OnMouseLeave",bbbfly.map.drawing.item._onMouseLeave);ng_OverrideMethod(this,"OnClick",bbbfly.map.drawing.item._onClick);ng_OverrideMethod(this,"OnDblClick",bbbfly.map.drawing.item._onDblClick);this.NewIcon=bbbfly.map.drawing.item._newIcon;this.GetIconStyle=bbbfly.map.drawing.item._getIconStyle;this.GetGeometryStyle=bbbfly.map.drawing.item._getGeometryStyle;this.GetGeometryCenter=bbbfly.map.drawing.item._getGeometryCenter;this.GetGeometrySize=bbbfly.map.drawing.item._getGeometrySize;this.ClearIcon=
bbbfly.map.drawing.item._clearIcon;this.ClearGeometry=bbbfly.map.drawing.item._clearGeometry;this.SetState=bbbfly.map.drawing.item._setState;this.GetState=bbbfly.map.drawing.item._getState;this.GetStateValue=bbbfly.map.drawing.item._getStateValue;this.SetStateValue=bbbfly.map.drawing.item._setStateValue;this.GetSelected=bbbfly.map.drawing.item._getSelected;this.SetSelected=bbbfly.map.drawing.item._setSelected;this.UpdateTooltip=bbbfly.map.drawing.item._updateTooltip;this.ShowTooltip=bbbfly.map.drawing.item._showTooltip;
this.HideTooltip=bbbfly.map.drawing.item._hideTooltip;this.OnSelectedChanged=this.OnSetSelected=null;this.SetState(this.Options.State);return this});bbbfly.MapDrawingItem.Style=function(){};bbbfly.MapDrawingItem.Style.Get=function(a){return String.isString(a)&&(a=bbbfly.map.drawing._styles[a],a instanceof bbbfly.MapDrawingItem.Style)?a:null};
bbbfly.MapDrawingItem.Style.Define=function(a,b){if(!(b instanceof bbbfly.MapDrawingItem.Style&&String.isString(a)))return!1;var c=bbbfly.map.drawing._styles;if("undefined"!==typeof c[a])return!1;c[a]=b;return!0};bbbfly.MapDrawingItem.IconStyle=bbbfly.object.Extend(bbbfly.MapDrawingItem.Style,function(a,b){Array.isArray(a)||(a=null);String.isString(b)||(b="");this.images=a;this.className=b});
bbbfly.MapDrawingItem.GeometryStyle=bbbfly.object.Extend(bbbfly.MapDrawingItem.Style,function(a){this.fill=this.stroke=!1;this.weight=1;this.color="#000000";this.fillColor=null;this.opacity=1;this.fillOpacity=.2;Object.isObject(a)&&(Number.isInteger(a.weight)&&(this.weight=a.weight),String.isString(a.color)&&(this.color=a.color),String.isString(a.fillColor)&&(this.fillColor=a.fillColor),Number.isNumber(a.opacity)&&(this.opacity=a.opacity),Number.isNumber(a.fillOpacity)&&(this.fillOpacity=a.fillOpacity),
this.stroke=!!(0<this.weight&&0<this.opacity),this.fill=!!(this.fillColor&&0<this.fillOpacity))});bbbfly.MapDrawingItem.state={mouseover:1,disabled:2,readonly:4,selected:8,grayed:16};bbbfly.MapDrawingItem.selecttype={none:0,click:1,dblclick:2,both:3};
bbbfly.MapDrawingCluster=bbbfly.object.Extend(bbbfly.MapDrawing,function(a){bbbfly.MapDrawing.call(this,a);this._ClusterGroup=null;this._DrawingListener={Owner:this,Listen:["OnSelectedChanged"],OnSelectedChanged:bbbfly.map.drawing.cluster.listener._onSelectedChanged};ng_OverrideMethod(this,"Create",bbbfly.map.drawing.cluster._create);ng_OverrideMethod(this,"Update",bbbfly.map.drawing.cluster._update);ng_OverrideMethod(this,"DoInitialize",bbbfly.map.drawing.cluster._doInitialize);ng_OverrideMethod(this,
"OnMouseEnter",bbbfly.map.drawing.cluster._onMouseEnter);ng_OverrideMethod(this,"OnMouseLeave",bbbfly.map.drawing.cluster._onMouseLeave);this.GetState=bbbfly.map.drawing.cluster._getState;this.GetIconStyle=bbbfly.map.drawing.cluster._getIconStyle;this.GetSpiderStyle=bbbfly.map.drawing.cluster._getSpiderStyle;this.AddDrawing=bbbfly.map.drawing.cluster._addDrawing;this.RemoveDrawing=bbbfly.map.drawing.cluster._removeDrawing;return this});
bbbfly.MapDrawingsHandler=function(a,b){if(!(a instanceof L.FeatureGroup))return null;Object.isObject(b)||(b={});this.AddEvent=ngObjAddEvent;this.RemoveEvent=ngObjRemoveEvent;bbbfly.listener.SetListenable(this,!0);this.Options=b;this._Feature=a;this._Drawings={};this._Selected={};this._CurrentCluster=null;this._DrawingListener={Owner:this,Listen:["OnSetSelected","OnSelectedChanged"],OnSetSelected:bbbfly.map.drawing.handler.listener._onSetSelected,OnSelectedChanged:bbbfly.map.drawing.handler.listener._onSelectedChanged};
this.GetDrawing=bbbfly.map.drawing.handler._getDrawing;this.AddDrawing=bbbfly.map.drawing.handler._addDrawing;this.RemoveDrawing=bbbfly.map.drawing.handler._removeDrawing;this.ClearDrawings=bbbfly.map.drawing.handler._clearDrawings;this.ClearIcons=bbbfly.map.drawing.handler._clearIcons;this.ClearGeometries=bbbfly.map.drawing.handler._clearGeometries;this.BeginClustering=bbbfly.map.drawing.handler._beginClustering;this.EndClustering=bbbfly.map.drawing.handler._endClustering;this.GetSelected=bbbfly.map.drawing.handler._getSelected;
this.ClearSelected=bbbfly.map.drawing.handler._clearSelected;this.OnSelectedChanged=null};bbbfly.MapDrawingsHandler.selecttype={none:0,single:1,multi:2};
