/**
 * @type {import("semantic-release").GlobalConfig}
 */
export default {
	branches: ["main"],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		[
			"@semantic-release/exec",
			{
				prepareCmd: "yarn build",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json"],
				message:
					"chore(release): cut ${nextRelease.version} [skip release]\n\n${nextRelease.notes}",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{
						path: "build/bundle/*.zip",
						label: "DHIS2 app bundle",
					},
				],
			},
		],
	],
};
