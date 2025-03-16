/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

(function(b,c){"object"===typeof exports&&"undefined"!==typeof module?c(exports,require("leaflet")):"function"===typeof define&&define.amd?define(["exports","leaflet"],c):c((b.L=b.L||{},b.L.bbbfly={}),b.L)})(this,function(b){var c=L.GridLayer.extend({options:{color:""},setColor:function(a){this.options.color=a;this._updateColor();return this},_updateColor:function(){this._container&&"string"===typeof this.options.color&&(this._container.style.backgroundColor=this.options.color)},_initContainer:function(){L.GridLayer.prototype._initContainer.call(this);
this._updateColor()},_initTile:function(a){L.GridLayer.prototype._initTile.call(this,a);a.style.backgroundColor="inherit"},_onCreateLevel:function(a){a.el.style.backgroundColor="inherit"}});b.ColorLayer=c;b.colorLayer=function(a){return new c(a)}});
