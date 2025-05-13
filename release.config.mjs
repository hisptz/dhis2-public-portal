/**
 * @type {import("semantic-release").GlobalConfig}
 */
export default {
	branches: ["main"],
	branch: "main",
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
						path: "apps/portal/build/bundle/*.zip",
						label: "Web Portal",
					},
					{
						path: "apps/manager/build/bundle/*.zip",
						label: "DHIS2 Portal Manager App",
					},
				],
			},
		],
	],
};
