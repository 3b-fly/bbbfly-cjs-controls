(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
	typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
	(factory((global.L = global.L || {}, global.L.bbbfly = {}),global.L));
}(this, (function (exports) { 'use strict';

/*
 * @class L.bbbfly.ColorLayer
 * @extends L.GridLayer
 *
 * @param {L.bbbfly.ColorLayer#options} options
 *
 * @example
 *
 * ```js
 * L.bbbfly.colorLayer({
 *   color: '#ff0000',
 *   opacity: 0.5
 * }).addTo(map);
 * ```
 */

var ColorLayer = L.GridLayer.extend({
    /**
     * @member {object} options
     * @memberOf L.bbbfly.ColorLayer
     *
     * @property {color} [color='']
     */
    options: {
		color: ''
	},

    /**
     * @function
     * @name setColor
     * @memberof L.bbbfly.ColorLayer#
     *
     * @param {color} color
     */
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

/**
 * @function
 * @name L.bbbfly.colorLayer
 *
 * @param {L.bbbfly.ColorLayer#options} options
 */
var colorLayer = function (options) {
	return new ColorLayer(options);
};

exports.ColorLayer = ColorLayer;
exports.colorLayer = colorLayer;

})));