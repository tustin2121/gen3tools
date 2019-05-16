'use strict';

var util = require('util');
var Stream = require('stream');
var Parser = require('pngjs/lib/indexed-parser');
var Packer = require('pngjs/lib/packer-async');

var PNG = exports.PNG = function(options) {
	Stream.call(this);

	options = options || {}; // eslint-disable-line no-param-reassign

	// coerce pixel dimensions to integers (also coerces undefined -> 0):
	this.width = options.width | 0;
	this.height = options.height | 0;
	
	/** @type {Buffer} */
	this.data = this.width > 0 && this.height > 0 ?
		new Buffer(4 * this.width * this.height) : null;

	if (options.fill && this.data) {
		this.data.fill(0);
	}

	this.gamma = 0;
	this.readable = this.writable = true;

	this._parser = new Parser(options);

	this._parser.on('error', this.emit.bind(this, 'error'));
	this._parser.on('close', this._handleClose.bind(this));
	this._parser.on('metadata', this._metadata.bind(this));
	this._parser.on('gamma', this._gamma.bind(this));
	this._parser.on('parsed', function(data) {
		this.data = data;
		this.emit('parsed', data);
	}.bind(this));

	this._packer = new Packer(options);
	this._packer.on('data', this.emit.bind(this, 'data'));
	this._packer.on('end', this.emit.bind(this, 'end'));
	this._packer.on('close', this._handleClose.bind(this));
	this._packer.on('error', this.emit.bind(this, 'error'));

};
util.inherits(PNG, Stream);

PNG.prototype.pack = function() {

	if (!this.data || !this.data.length) {
		this.emit('error', 'No data provided');
		return this;
	}

	process.nextTick(function() {
		this._packer.pack(this.data, this.width, this.height, this.gamma);
	}.bind(this));

	return this;
};


PNG.prototype.parse = function(data, callback) {

	if (callback) {
		var onParsed, onError;

		onParsed = function(parsedData) {
			this.removeListener('error', onError);

			this.data = parsedData;
			callback(null, this);
		}.bind(this);

		onError = function(err) {
			this.removeListener('parsed', onParsed);

			callback(err, null);
		}.bind(this);

		this.once('parsed', onParsed);
		this.once('error', onError);
	}

	this.end(data);
	return this;
};

PNG.prototype.write = function(data) {
	this._parser.write(data);
	return true;
};

PNG.prototype.end = function(data) {
	this._parser.end(data);
};

PNG.prototype._metadata = function(metadata) {
	this.width = metadata.width;
	this.height = metadata.height;

	this.emit('metadata', metadata);
};

PNG.prototype._gamma = function(gamma) {
	this.gamma = gamma;
};

PNG.prototype._handleClose = function() {
	if (!this._parser.writable && !this._packer.readable) {
		this.emit('close');
	}
};

/**
 * @param {PNG} src
 * @param {Buffer} dst
 * @param {number} tileId
 */
PNG.copytile = function(src, dst, tileId) { // eslint-disable-line max-params
	// coerce pixel dimensions to integers (also coerces undefined -> 0):
	let numTilesAcross = (src.width >> 3);
	let tileX = (tileId % numTilesAcross) | 0;
	let tileY = (tileId / numTilesAcross) | 0;
	
	// if (srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height) {
	// 	throw new Error('copytile reading outside image');
	// }

	// if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height) {
	// 	throw new Error('copytile writing outside image');
	// }

	for (var y = 0; y < 8; y++) {
		src.data.copy(dst, 
			y << 3,
			(tileY << 3) * dst.width + (tileX << 3),
			(tileY << 3) * dst.width + (tileX << 3) + 8
		);
	}
};

PNG.prototype.copytile = function(dst, tileId) { // eslint-disable-line max-params

	PNG.copytile(this, dst, tileId);
	return this;
};


// PNG.bitblt = function(src, dst, srcX, srcY, width, height, deltaX, deltaY) { // eslint-disable-line max-params
// 	// coerce pixel dimensions to integers (also coerces undefined -> 0):
// 	/* eslint-disable no-param-reassign */
// 	srcX |= 0;
// 	srcY |= 0;
// 	width |= 0;
// 	height |= 0;
// 	deltaX |= 0;
// 	deltaY |= 0;
// 	/* eslint-enable no-param-reassign */

// 	if (srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height) {
// 		throw new Error('bitblt reading outside image');
// 	}

// 	if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height) {
// 		throw new Error('bitblt writing outside image');
// 	}

// 	for (var y = 0; y < height; y++) {
// 		src.data.copy(dst.data,
// 			((deltaY + y) * dst.width + deltaX) << 2,
// 			((srcY + y) * src.width + srcX) << 2,
// 			((srcY + y) * src.width + srcX + width) << 2
// 		);
// 	}
// };


// PNG.prototype.bitblt = function(dst, srcX, srcY, width, height, deltaX, deltaY) { // eslint-disable-line max-params

// 	PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
// 	return this;
// };

/*
PNG.adjustGamma = function(src) {
	if (src.gamma) {
		for (var y = 0; y < src.height; y++) {
			for (var x = 0; x < src.width; x++) {
				var idx = (src.width * y + x) << 2;

				for (var i = 0; i < 3; i++) {
					var sample = src.data[idx + i] / 255;
					sample = Math.pow(sample, 1 / 2.2 / src.gamma);
					src.data[idx + i] = Math.round(sample * 255);
				}
			}
		}
		src.gamma = 0;
	}
};

PNG.prototype.adjustGamma = function() {
	PNG.adjustGamma(this);
};
*/