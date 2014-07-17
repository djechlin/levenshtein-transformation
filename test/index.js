"use strict";

var Levenshtein = require('..');
var assert = require('assert');


var dist = function(a,b) {
	return new Levenshtein(a, b).distance();
};

describe("Levenshtein", function() {
	describe("#distance", function() {
		it("should return 0 when the strings are both empty", function() {
			assert.equal(dist("", ""), 0);
		});

		it("should return zero when two strings of length one are identical", function() {
			assert.equal(dist("a", "a"), 0);
		});
		it("should return zero when two strings of length two or more are identical", function() {
			assert.equal(dist("ab", "ab"), 0);
			assert.equal(dist ("The quick brown fox", "The quick brown fox"), 0);
		});

		it("should return the length of the longer string when one strings are empty", function() {
			assert.equal(dist("", "abcdefg"), 7);
			assert.equal(dist("abcdefg", ""), 7);
			assert.equal(dist("", "a"), 1);
			assert.equal(dist("a", ""), 1);
		});

		it("should return the hamming distance when strings are of equal length", function() {

			assert.equal(dist("1234567", "7654321"), 6);
			assert.equal(dist("11110000", "10101010"), 4);
		});

		it("should return 2 for cyclic rotated strings", function() {
			assert.equal(dist("abcdefg", "gabcdef"), 2);
		});

		it("should return 3 for kitty and sitting", function() {
			assert.equal(dist("kitten", "sitting"), 3);
			assert.equal(dist("sitting", "kitten"), 3);
		});
	});
});