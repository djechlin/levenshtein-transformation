"use strict";

var regexpQuote = require('regexp-quote');
var assert = require('assert');

var Levenshtein = module.exports = function Levenshtein(a, b) {
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

	if(this.operations) {
		return this.operations;
	}
	this.computeMatrix();

	// recursively backtrace through matrix
	var i = this.a.length;
	var j = this.b.length;

	this.operations = [];

	while(i > 0 || j > 0) {
		var node = this.matrix[i][j];
		this.operations.unshift(node);

		switch(node.operation) {
			case "delete":
				i--;
				break;
			case "insert":
				j--;
				break;
			case "substitute":
			case "cancel":
			case "wildcard":
			case "optional":
				i--;
				j--;
				break;
		}
	}

	return this.operations;
};

Levenshtein.prototype.matcher = function() {

	if(this.matcherSet) {
		return this.matcherSet;
	}
	var operations = this.transform();

	var a = this.a;
	var b = this.b;

	var index = 0;

	return this.matcherSet = operations.map(function(node) {
		switch(node.operation) {
			case "cancel":
			case "substitute":
			case "wildcard":
			case "optional":
				index++;
				return node.resultCharacter;
			case "insert":
				return ["?"];
			case "delete":
				index++;
				return ["?"];
		}
	});
}

Levenshtein.prototype.regex = function(test) {
	var matcher = this.matcher();

	var regex = "^";

	matcher.forEach(function(instruction) {

		assert(typeof instruction === 'string' || typeof instruction[0] === 'string');

		if(typeof instruction === 'string') {
			regex += regexpQuote(instruction);
		}
		else {
			switch(instruction[0]) {
				case '.':
					regex += '.';
					break;
				case '?':
					regex += '.?';
					break;
			}
		}
	});

	regex += "$";

	var result = new RegExp(regex);

	if(test) {
		assert(result.test(this.a));
		assert(result.test(this.b));
	}

	return result;
};

Levenshtein.prototype.steps = function() {

	var operations = this.transform();

	var a = this.a;
	var b = this.b;
};



var  substitutes = function(a, b, i, j) {

	if(i < 0 || j < 0) {
		return false;
	}

	if(typeof b === 'string' || typeof b[j] === 'string') {
		return {
			operation: a[i] === b[j] ? 'cancel' : 'substitute',
			distance: a[i] === b[j] ? 0 : 1,
			resultCharacter: a[i] === b[j] ? a[i] : ['.']
		};
	}

	assert(b[j] instanceof Array);

	var metacharacter = b[j][0];

	assert(metacharacter === '.' || metacharacter === '?');

	switch(metacharacter) {
		case '.':
			return {
				operation: 'wildcard',
				distance: 0,
				resultCharacter: ['.']
			};
		case '?':
			return {
				operation: 'optional',
				distance: 1,
				resultCharacter: ['?']
			};
	}
}


Levenshtein.prototype.computeMatrix = function() {

	// this method works when b is not a string but an array containing characters and wildcards
	// it can NOT work when the wildcards or any characters are optional; that is an exponential
	// algorithm that occurs in a different function

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

	// now walk the whole array and apply the comparison

	for(i = 0; i < a.length + 1; i++) {
		for(var j = 0; j < b.length + 1; j++) {

			// only necessary base case if we use Infinity, which simplifies the work
			// needed to generalize to matching against regex
			if(i === 0 && j === 0) {
				this.matrix[i][j] = {
					operation: null,
					distance: 0
				};
				continue;
			}

			// remember strings are indexed -1 less than matrix, since matrix needs
			// to consider the empty string, whereas a[0] is of course a 1-length string

			// Infinity represents illegal operations

			var  substitution = substitutes(a, b, i - 1, j - 1);

			var deleteDistance = i-1 >= 0 ? this.matrix[i-1][j].distance + 1 : Infinity;
			var insertDistance = j-1 >= 0 ? this.matrix[i][j-1].distance + 1 : Infinity;
			var substituteDistance = i-1 >= 0 && j-1 >= 0 ? this.matrix[i-1][j-1].distance + substitution.distance : Infinity;

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
					operation: substitution.operation,
					distance: substituteDistance,
					resultCharacter: substitution.resultCharacter
				}
			}
		}
	}
};

// everything can be done statically

for(var name in Levenshtein.prototype) {

	if (!Levenshtein.prototype.hasOwnProperty(name)) {
		continue;
	}

	var func = Levenshtein.prototype[name];

	if (typeof func !== 'function') {
		continue;
	}

	Levenshtein[func] = function(a,b) {
		return new Levenshtein(a,b)[func]();
	}
}