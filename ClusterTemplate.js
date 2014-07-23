"use strict";

var _ = require('lodash');
var regexpQuote = require('regexp-quote');
var Levenshtein = require('./Levenshtein.js');
var assert = require('assert');

var ClusterTemplate = module.exports = function() {
	this.strings = _.flatten(arguments);
}

ClusterTemplate.prototype.generate = function() {

	var self = this;

	if(this.strings.length === 0) {
		return /^$/;
	}

	var best = _.reduce(this.strings, function(best, string) {
		return self.matchStringToLevenshtein(best, string);
	}, this.strings[0]);

	return best.regex();

}

function branch(matcher) {

	if(matcher.length === 0) {
		return [];
	}

	var char = matcher[0];
	var ops = [];
	if(typeof char === 'string') {
		ops.push(char);
	}
	else if(char[0] === '.') {
		ops.push(char);
	}
	else if(char[0] === '?') {
		ops.push(['.']);
		ops.push(null);
	}
	else {
		assert(false);
	}


	var subresults = branch(matcher.slice(1));

	var results = [];

	ops.forEach(function(op) {

		if(subresults.length === 0) {
			if(op !== null) {
				results.push(op);
			}
		}

		else {
			subresults.forEach(function(subresult) {
				if (op === null) {
					results.push(subresult);
				}
				else {
					results.push(_.flatten([op, subresult]));
				}
			});
		}
	});

	return results;

}

ClusterTemplate.prototype.matchStringToLevenshtein = function(lev, string) {

	if(typeof lev === 'string') {
		lev = new Levenshtein(string, string);
	}

	var regex = lev.regex();

	if(regex.test(string)) {
		return lev;
	}

	var matcher = lev.matcher();

	//var nonvariadicMatchers = branch(matcher);
	var nonvariadicMatchers = [matcher];

	var best = lev;
	var bound = Infinity;

	nonvariadicMatchers.forEach(function(matcher) {

		var next = new Levenshtein(string, matcher);

		if(next.distance() < bound) {
			best = next;
			bound = next.distance();
		}
	});

	return best;


}