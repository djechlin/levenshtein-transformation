"use strict";

var ClusterTemplate = require('../ClusterTemplate.js');

describe("ClusterTemplate", function() {

	describe("#generate", function() {
		it("should generate a regex for a group of three strings", function() {
			var t = new ClusterTemplate("abc 11 def", "abc def", "abcdef");
			console.log(t.generate());
		});

		it("should handle rotated alphabet", function() {
			var strings = [
				"abcdefghijklmnop",
				"pabcdefghijklmno",
				"opabcdefghijklmn",
				"nopabcdefghijklm",
				"mnopabcdefghijkl",
				"lmnopabcdefghijk"
			];
			var t = new ClusterTemplate(strings);

			console.log(t.generate());

		});
	});
});