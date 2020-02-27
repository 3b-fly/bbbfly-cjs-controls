/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
	typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
	(factory((global.L = global.L || {}, global.L.bbbfly = {}),global.L));
}(this, (function (exports) { 'use strict';

var ColorLayer = L.GridLayer.extend({
    options: {
		color: ''
	},
	setColor: function (color) {
		this.options.color = color;
        this._updateColor();
		return this;
	},

    _updateColor: function () {
        if (this._container && typeof this.options.color === 'string') {
            this._container.style.backgroundColor = this.options.color;
        }
    },

    _initContainer: function () {
        L.GridLayer.prototype._initContainer.call(this);
		this._updateColor();
	},

    _initTile: function (tile) {
      L.GridLayer.prototype._initTile.call(this,tile);
      tile.style.backgroundColor = 'inherit';
    },

    _onCreateLevel: function (level) {
      level.el.style.backgroundColor = 'inherit';
    }
});
var colorLayer = function (options) {
	return new ColorLayer(options);
};

exports.ColorLayer = ColorLayer;
exports.colorLayer = colorLayer;

})));