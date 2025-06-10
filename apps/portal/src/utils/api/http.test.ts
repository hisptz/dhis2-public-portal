import { describe, expect, test } from "vitest";
import { D2HttpClient } from "./http";

export const baseURLTests = [
	{
		value: "https://example.com",
		expected: "https://example.com/api/",
	},
	{
		value: "https://example.com/api/",
		expected: "https://example.com/api/",
	},
	{
		value: "https://example.com/api",
		expected: "https://example.com/api/",
	},
	{
		value: "https://example.com/path/to/api",
		expected: "https://example.com/path/to/api/",
	},
	{
		value: "https://example.com/path/to/api/in/the/middle",
		expected: "https://example.com/path/to/api/in/the/middle/api/",
	},
];

describe("Base URL converter", () => {
	for (const { value, expected } of baseURLTests) {
		test(`Expect ${value} to be converted to ${expected}`, () => {
			expect(D2HttpClient.sanitizeURL(value).toString()).to.equal(
				expected,
			);
		});
	}
});
