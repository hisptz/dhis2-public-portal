/**
 * @type {import("semantic-release").GlobalConfig}
 */
export default {
	branches: ["main"],
	branch: "main",
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/npm",
			{
				npmPublish: false,
			},
		],
		"@semantic-release/changelog",
		[
			"@semantic-release/exec",
			{
				prepareCmd: "pnpm update-versions ${nextRelease.version}",
			},
		],
		[
			"@semantic-release/exec",
			{
				prepareCmd:
					"pnpm build --filter manager && pnpm build:standalone --filter portal",
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
						label: "FlexiPortal",
					},
					{
						path: "apps/manager/build/bundle/*.zip",
						label: "FlexiPortal Manager",
					},
				],
			},
		],
	],
};
