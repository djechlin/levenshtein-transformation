"use strict";

var Levenshtein = module.exports = function Levenshtein(a, b) {

	if(typeof a !== 'string' || typeof b !== 'string') {
		throw new Error("Invalid arguments; please supply strings");
	}

	this.a = a;
	this.b = b;
};

Levenshtein.prototype.distance = function() {
	this.computeMatrix();

	// matrix has an extra row/column for the empty string
	// so highest indices are a.length and b.length
	return this.matrix[this.a.length][this.b.length].distance;

};

Levenshtein.prototype.transform = function() {
	throw new Error("not yet implemented");
};

Levenshtein.prototype.computeMatrix = function() {

	if(this.matrix) {
		return this.matrix;
	}

	var a = this.a;
	var b = this.b;

	this.matrix = [];

	// create 2-dimensional array
	for(var i = 0; i < a.length + 1; i++) {
		this.matrix[i] = [];
	}

	// fill first row with 1..n
	for(i = 0; i < a.length + 1; i++) {
		this.matrix[i][0] =
		{
			operation: i == 0 ? null : "delete",
			distance: i
		};
	}

	for(var j = 0; j < b.length + 1; j++) {
		this.matrix[0][j] =
		{
			operation: j == 0 ? null : "insert",
			distance: j
		}
	}

	// now walk the whole array and apply the comparison

	for(i = 1; i < a.length + 1; i++) {
		for(j = 1; j < b.length + 1; j++) {

			var deleteDistance = this.matrix[i-1][j].distance + 1;
			var insertDistance = this.matrix[i][j-1].distance + 1;
			var substituteDistance = this.matrix[i-1][j-1].distance + (a[i-1] != b[j-1]);

			if(deleteDistance <= insertDistance && deleteDistance <= substituteDistance) {
				this.matrix[i][j] = {
					operation: "delete",
					distance: deleteDistance
				};
			}
			else if(insertDistance <= substituteDistance) {
				this.matrix[i][j] = {
					operation: "insert",
					distance: insertDistance
				}
			}
			else {
				this.matrix[i][j] = {
					operation: a[i-1] == b[i-1] ? "cancel" : "substitute",
					distance: substituteDistance
				}
			}
		}
	}
};