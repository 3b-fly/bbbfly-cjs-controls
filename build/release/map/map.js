/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.map=bbbfly.map||{};bbbfly.map.map={};bbbfly.map.layer={mapbox_tile:{},mapbox_style:{}};bbbfly.map.map._onCreated=function(a){a.CreateMap();return!0};bbbfly.map.map._onUpdated=function(){var a=this.GetMap();a&&Function.isFunction(a.invalidateSize)&&a.invalidateSize()};bbbfly.map.map._dispose=function(){this.DestroyMap();this.Dispose.callParent()};
bbbfly.map.map._getMap=function(){return this._Map};
bbbfly.map.map._createMap=function(){if(this.GetMap())return!0;var a={center:[0,0],zoom:0,fadeAnimation:!0,zoomAnimation:!0,markerZoomAnimation:!0};if(Object.isObject(this.MaxBounds)||Array.isArray(this.MaxBounds))a.maxBounds=this.MaxBounds;Number.isInteger(this.MinZoom)&&(a.minZoom=this.MinZoom,a.zoom=this.MinZoom);Number.isInteger(this.MaxZoom)&&(a.maxZoom=this.MaxZoom);String.isString(this.Crs)&&(a.crs=L.CRS[this.Crs]);a=this.DoCreateMap(a);if(!a)return!1;this.AddLayers(this.Layers);a.getZoom&&
this.OnZoomChanged&&this.OnZoomChanged(a.getZoom());return!0};bbbfly.map.map._doCreateMap=function(a){if(this.GetMap()||!this.Controls.Map)return null;var b=this.Controls.Map.GetControlsHolder();a=L.map(b.ID,a);if(!a)return null;a.Owner=this;a.on("zoomend",bbbfly.map.map._onMapZoomEnd);a.on("layeradd",bbbfly.map.map._onMapLayersChanged);a.on("layerremove",bbbfly.map.map._onMapLayersChanged);return this._Map=a};bbbfly.map.map._destroyMap=function(){var a=this.GetMap();if(!a)return!1;a.remove();return!0};
bbbfly.map.map._setMaxBounds=function(a){Array.isArray(a)&&(a=new L.LatLngBounds(a));if(!(a instanceof L.LatLngBounds&&a.isValid()))return!1;this.MaxBounds=a;var b=this.GetMap();b&&b.setMaxBounds(a);return!0};bbbfly.map.map._setBoundsPadding=function(a){if(null===a)this.BoundsPadding=null;else if(Object.isObject(a))this.BoundsPadding=a;else if(Number.isInteger(a))this.BoundsPadding={T:a,R:a,B:a,L:a};else return!1;return!0};
bbbfly.map.map._getBoundsPadding=function(a){Object.isObject(a)||(a=this.BoundsPadding);return Object.isObject(a)?{T:Number.isInteger(a.T)?a.T:0,R:Number.isInteger(a.R)?a.R:0,B:Number.isInteger(a.B)?a.B:0,L:Number.isInteger(a.L)?a.L:0}:{T:0,R:0,B:0,L:0}};
bbbfly.map.map._fitBounds=function(a,b){var c=this.GetMap();if(!c)return!1;!a&&this.MaxBounds&&(a=this.MaxBounds);if(!(a instanceof L.LatLngBounds&&a.isValid()))return!1;b=this.GetBoundsPadding(b);c.fitBounds(a,{paddingTopLeft:new L.Point(b.L,b.T),paddingBottomRight:new L.Point(b.R,b.B),animate:!!this.Animate});return!0};
bbbfly.map.map._fitCoords=function(a,b){var c=this.GetMap();if(!(c&&a instanceof L.LatLng))return!1;b=this.GetBoundsPadding(b);c.panInside(a,{paddingTopLeft:new L.Point(b.L,b.T),paddingBottomRight:new L.Point(b.R,b.B),animate:!!this.Animate});return!0};bbbfly.map.map._setMinZoom=function(a){if(Number.isInteger(a)){this.MinZoom=a;var b=this.GetMap();b&&b.setMinZoom(a);return!0}return!1};bbbfly.map.map._getMinZoom=function(){var a=this.GetMap();return a?a.getMinZoom():null};
bbbfly.map.map._setMaxZoom=function(a){if(Number.isInteger(a)){this.MaxZoom=a;var b=this.GetMap();b&&b.setMaxZoom(a);return!0}return!1};bbbfly.map.map._getMaxZoom=function(){var a=this.GetMap();return a?a.getMaxZoom():null};bbbfly.map.map._enableAnimation=function(a){if(a===this.Animate)return!1;this.Animate=!!a;return!0};
bbbfly.map.map._setView=function(a,b){var c=this.GetMap();if(c){if("undefined"===typeof a||null===a)a=c.getCenter();if("undefined"===typeof b||null===b)b=c.getZoom();c.setView(a,b,{animate:!!this.Animate});return!0}return!1};bbbfly.map.map._setZoom=function(a){return this.SetView(null,a)};bbbfly.map.map._getZoom=function(){var a=this.GetMap();return a?a.getZoom():null};bbbfly.map.map._zoomIn=function(a){var b=this.GetMap();return b?(b.zoomIn(a,{animate:!!this.Animate}),!0):!1};
bbbfly.map.map._zoomOut=function(a){var b=this.GetMap();return b?(b.zoomOut(a,{animate:!!this.Animate}),!0):!1};bbbfly.map.map._onMapZoomEnd=function(a){if((a=a.target)&&a.Owner){var b=a.Owner;Function.isFunction(b.OnZoomChanged)&&b.OnZoomChanged(a.getZoom())}};bbbfly.map.map._setCenter=function(a){return this.SetView(a,null)};bbbfly.map.map._getCenter=function(){var a=this.GetMap();return a?a.getCenter():null};
bbbfly.map.map._beginLayersChanges=function(a){1>++a._LayersChanging&&(a._LayersChanging=1)};bbbfly.map.map._endLayersChanges=function(a){0>--a._LayersChanging&&(a._LayersChanging=0);bbbfly.map.map._layersChanged(a)};bbbfly.map.map._layersChanged=function(a){0<a._LayersChanging||Function.isFunction(a.OnLayersChanged)&&a.OnLayersChanged()};
bbbfly.map.map._layerInterface=function(a,b){if(String.isString(a)&&(a=bbbfly.Map[a],Object.isObject(a)))return Object.isObject(b)?ng_MergeVar(b,a):b=ng_CopyVar(a),a.extends&&this.LayerInterface(a.extends,b),b};
bbbfly.map.map._createLayer=function(a){if(!Object.isObject(a)||!this.GetMap())return null;var b=this.LayerInterface(a.Type);if(!Object.isObject(b))return null;Object.isObject(this.DefaultLayer)&&ng_MergeVar(a,this.DefaultLayer);var c={};if(Object.isObject(b.options_map))for(var d in b.options_map){var e=b.options_map[d],f=a[d];"undefined"!==typeof f&&(c[e]=f)}Object.isObject(b.options)&&ng_MergeVar(c,b.options);if(Function.isFunction(b.onCreateOptions))b.onCreateOptions(c);d=null;switch(b.type){case "L.bbbfly.ColorLayer":d=
new L.bbbfly.ColorLayer(c);break;case "L.ImageOverlay":d=new L.ImageOverlay(c.url,c.bounds,c);break;case "L.TileLayer":d=new L.TileLayer(c.url,c);break;case "L.TileLayer.wms":d=new L.TileLayer.WMS(c.url,c);break;case "L.esri.TiledMapLayer":d=new L.esri.TiledMapLayer(c);break;case "L.esri.DynamicMapLayer":d=new L.esri.DynamicMapLayer(c)}return d?{Id:String.isString(a.Id)?a.Id:"_L_"+this._LayerId++,Display:a.Display?a.Display:bbbfly.Map.Layer.display.fixed,NameRes:a.NameRes?a.NameRes:null,Name:a.Name?
a.Name:null,Layer:d,Visible:!1}:null};bbbfly.map.map._getLayers=function(){return Object.isObject(this._Layers)?this._Layers:{}};bbbfly.map.map._getLayer=function(a){if(!String.isString(a))return null;a=this.GetLayers()[a];return Object.isObject(a)?a:null};bbbfly.map.map._addLayers=function(a){if(!Array.isArray(a))return!1;bbbfly.map.map._beginLayersChanges(this);var b=!0,c;for(c in a)this.AddLayer(a[c])||(b=!1);bbbfly.map.map._endLayersChanges(this);return b};
bbbfly.map.map._addLayer=function(a){a=this.CreateLayer(a);if(!a)return!1;this.RemoveLayer(a.Id);this._Layers[a.Id]=a;switch(a.Display){case bbbfly.Map.Layer.display.fixed:case bbbfly.Map.Layer.display.visible:this.SetLayerVisible(a.Id,!0)}return!0};
bbbfly.map.map._removeLayers=function(a){bbbfly.map.map._beginLayersChanges(this);var b=!0;if(Array.isArray(a))for(var c in a){if(!this.RemoveLayer(a[c])){b=!1;break}}else for(var d in this._Layers)if(!this.RemoveLayer(d)){b=!1;break}bbbfly.map.map._endLayersChanges(this);return b};bbbfly.map.map._removeLayer=function(a){return String.isString(a)?this.SetLayerVisible(a,!1)?(delete this._Layers[a],!0):!1:!1};
bbbfly.map.map._setLayerVisible=function(a,b){var c=this.GetMap();if(!c)return!1;a=this.GetLayer(a);if(!a)return!1;var d=a.Layer;if(!d)return!1;b=!!b;if(b===a.Visible)return!0;if(!b&&a.Display===bbbfly.Map.Layer.display.fixed)return!1;if(b){if(Function.isFunction(d.addTo))return a.Visible=!0,d.addTo(c),!0}else if(Function.isFunction(d.removeFrom))return a.Visible=!1,d.removeFrom(c),!0;return!1};bbbfly.map.map._onMapLayersChanged=function(a){a.target&&a.target.Owner&&bbbfly.map.map._layersChanged(a.target.Owner)};
bbbfly.map.map._getMapLayerName=function(a){if(!(a instanceof L.Layer))return null;var b=this.GetLayers(),c;for(c in b){var d=b[c];if(Object.isObject(d)&&d.Layer===a)return this.DoGetLayerName(d)}return null};bbbfly.map.map._getLayerName=function(a){a=this.GetLayer(a);return this.DoGetLayerName(a)};
bbbfly.map.map._doGetLayerName=function(a){if(!Object.isObject(a))return null;if(String.isString(a.Name))return a.Name;if(Object.isObject(a.Name)){if(a=a.Name[ngApp.Lang],String.isString(a))return a}else if(String.isString(a.NameRes))return ngTxt(a.NameRes);return null};bbbfly.map.map._getAttributions=function(){var a=this.GetMap(),b={MapCtrl:this,Attributions:[]};a&&a.eachLayer(bbbfly.map.map._getLayerAttribution,b);return b.Attributions};
bbbfly.map.map._getLayerAttribution=function(a){if(a&&Function.isFunction(a.getAttribution)){var b=[],c=a.getAttribution();String.isString(c)&&(c=[c]);if(Array.isArray(c))for(var d in c){var e=c[d];String.isString(e)&&""!==e&&b.push(e)}0<b.length&&this.Attributions.push({Name:this.MapCtrl.GetMapLayerName(a),Attributions:b})}};bbbfly.map.layer.mapbox_tile._oncreateOptions=function(a){String.isString(a.url)||(a.url="https://api.mapbox.com/v4/{mapId}/{z}/{x}/{y}"+(a.detectRetina?"{r}":"")+".{format}?access_token={accessToken}")};
bbbfly.map.layer.mapbox_style._oncreateOptions=function(a){if(!String.isString(a.url)){var b=this.pattern.exec(a.styleUrl);if(Array.isArray(b)&&3===b.length){var c=a.detectRetina?"{r}":"";a.styleOwner=b[1];a.styleId=b[2];delete a.styleUrl;a.url="https://api.mapbox.com/styles/v1/{styleOwner}/{styleId}/tiles/{z}/{x}/{y}"+c+"?access_token={accessToken}"}}delete a.styleUrl};
bbbfly.Map=function(a,b,c){a=a||{};ng_MergeDef(a,{ParentReferences:!1,Data:{Crs:bbbfly.Map.crs.PseudoMercator,BoundsPadding:null,MaxBounds:null,MinZoom:null,MaxZoom:null,Animate:!0,Layers:[],DefaultLayer:null,_Map:null,_Layers:{},_LayerId:1,_LayersChanging:0},OnCreated:bbbfly.map.map._onCreated,Controls:{Map:{Type:"bbbfly.Panel",L:0,R:0,T:0,B:0,style:{zIndex:1}}},Events:{OnUpdated:bbbfly.map.map._onUpdated,OnZoomChanged:null,OnLayersChanged:null},Methods:{Dispose:bbbfly.map.map._dispose,LayerInterface:bbbfly.map.map._layerInterface,
GetMap:bbbfly.map.map._getMap,CreateMap:bbbfly.map.map._createMap,DoCreateMap:bbbfly.map.map._doCreateMap,DestroyMap:bbbfly.map.map._destroyMap,SetMaxBounds:bbbfly.map.map._setMaxBounds,SetBoundsPadding:bbbfly.map.map._setBoundsPadding,GetBoundsPadding:bbbfly.map.map._getBoundsPadding,FitBounds:bbbfly.map.map._fitBounds,FitCoords:bbbfly.map.map._fitCoords,SetMinZoom:bbbfly.map.map._setMinZoom,GetMinZoom:bbbfly.map.map._getMinZoom,SetMaxZoom:bbbfly.map.map._setMaxZoom,GetMaxZoom:bbbfly.map.map._getMaxZoom,
EnableAnimation:bbbfly.map.map._enableAnimation,SetView:bbbfly.map.map._setView,SetZoom:bbbfly.map.map._setZoom,GetZoom:bbbfly.map.map._getZoom,ZoomIn:bbbfly.map.map._zoomIn,ZoomOut:bbbfly.map.map._zoomOut,SetCenter:bbbfly.map.map._setCenter,GetCenter:bbbfly.map.map._getCenter,CreateLayer:bbbfly.map.map._createLayer,GetLayers:bbbfly.map.map._getLayers,GetLayer:bbbfly.map.map._getLayer,AddLayers:bbbfly.map.map._addLayers,AddLayer:bbbfly.map.map._addLayer,RemoveLayers:bbbfly.map.map._removeLayers,RemoveLayer:bbbfly.map.map._removeLayer,
SetLayerVisible:bbbfly.map.map._setLayerVisible,GetMapLayerName:bbbfly.map.map._getMapLayerName,GetLayerName:bbbfly.map.map._getLayerName,DoGetLayerName:bbbfly.map.map._doGetLayerName,GetAttributions:bbbfly.map.map._getAttributions}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};bbbfly.Map.crs={WorldMercator:"EPSG3395",PseudoMercator:"EPSG3857",WGS84:"EPSG4326"};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_map={OnInit:function(){ngRegisterControlType("bbbfly.Map",bbbfly.Map)}};
bbbfly.Map.Layer={options_map:{ZIndex:"zIndex",Opacity:"opacity",ClassName:"className"},options:{zIndex:1,opacity:1,className:""}};bbbfly.Map.Layer.type={color:"ColorLayer",image:"ImageLayer",tile:"TileLayer",wms:"WMSLayer",arcgis_online:"ArcGISOnlineLayer",arcgis_server:"ArcGISServerLayer",arcgis_enterprise:"ArcGISEnterpriseLayer",mapbox_tile:"MapboxTileLayer",mapbox_style:"MapboxStyleLayer"};bbbfly.Map.Layer.display={fixed:"fixed",visible:"visible",hidden:"hidden"};
bbbfly.Map.ColorLayer={extends:"Layer",type:"L.bbbfly.ColorLayer",options_map:{Color:"color"},options:{color:""}};bbbfly.Map.ExternalLayer={extends:"Layer",options_map:{Url:"url",Attribution:"attribution",CrossOrigin:"crossOrigin"},options:{crossOrigin:!1}};bbbfly.Map.ImageLayer={extends:"ExternalLayer",type:"L.ImageOverlay",options_map:{ErrorUrl:"errorOverlayUrl",Bounds:"bounds"}};
bbbfly.Map.TileLayer={extends:"ExternalLayer",type:"L.TileLayer",options_map:{ErrorUrl:"errorTileUrl",Bounds:"bounds",MinZoom:"minZoom",MaxZoom:"maxZoom",TileSize:"tileSize"},options:{minZoom:1,maxZoom:18,tileSize:256,detectRetina:!0}};bbbfly.Map.WMSLayer={extends:"TileLayer",type:"L.TileLayer.wms",options_map:{Layers:"layers",Styles:"styles",Format:"format",Version:"version",Transparent:"transparent",Crs:"crs"},options:{format:"image/png32",version:"1.3.0",transparent:!0}};
bbbfly.Map.ArcGISOnlineLayer={extends:"TileLayer",type:"L.esri.TiledMapLayer"};bbbfly.Map.ArcGISServerLayer={extends:"TileLayer",type:"L.esri.TiledMapLayer"};bbbfly.Map.ArcGISEnterpriseLayer={extends:"ImageLayer",type:"L.esri.DynamicMapLayer",options_map:{Format:"format",Layers:"layers",Transparent:"transparent"},options:{format:"png32",transparent:!0}};bbbfly.Map.MapboxTileLayer={extends:"TileLayer",options_map:{MapId:"mapId",AccessToken:"accessToken",Format:"format"},options:{format:"png32"},onCreateOptions:bbbfly.map.layer.mapbox_tile._oncreateOptions};
bbbfly.Map.MapboxStyleLayer={extends:"TileLayer",options_map:{StyleUrl:"styleUrl",AccessToken:"accessToken",Format:"format"},options:{tileSize:512,zoomOffset:-1,minNativeZoom:0},pattern:/^mapbox:\/\/styles\/([\w-]+)\/([a-z0-9]+).*$/,onCreateOptions:bbbfly.map.layer.mapbox_style._oncreateOptions};
