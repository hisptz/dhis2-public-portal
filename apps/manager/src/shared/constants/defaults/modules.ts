import {
	AppModule,
	DisplayItemType,
	ModuleType,
	SectionType,
} from "@packages/shared/schemas";

export const defaultModules: AppModule[] = [
	{
		type: ModuleType.SECTION as const,
		id: "home",
		config: {
			sections: [
				{
					type: SectionType.SINGLE_ITEM,
					title: "Welcome to DHIS2 Public portal",
					id: "welcome-note",
					item: {
						type: DisplayItemType.RICH_TEXT,
						item: {
							id: "welcome-note",
							content: `<h1>Welcome to DHIS2 Public Portal</h1>

<p>Thank you for using the DHIS2 Public Portal! This platform is designed to transform how DHIS2 data is publicly shared, accessed, and understood.</p>

<h2>About the Application</h2>

<p>The DHIS2 Public Portal brings together up-to-date, visualized, and aggregated health data from DHIS2 systems and enhances it with essential resources, including:</p>

<ul>
  <li><strong>Data Visualizations</strong>: Interactive charts, maps, and dashboards</li>
  <li><strong>Key Indicators</strong>: Important health metrics at a glance</li>
  <li><strong>Document Library</strong>: Strategic reports, guidelines, and knowledge resources</li>
  <li><strong>News Section or Blogs</strong>: Latest updates and announcements</li>
  <li><strong>FAQ Section</strong>: Answers to common questions</li>
  <li><strong>Feedback System</strong>: A way for users to provide input</li>
</ul>

<h2>Getting Started</h2>

<p>To configure your Public Portal:</p>

<ol>
  <li><strong>Access the Manager App</strong>: Log in to your DHIS2 instance and open the Portal Manager application</li>
  <li><strong>Configure Appearance</strong>: Customize the look and feel of your portal</li>
  <li><strong>Set Up Modules</strong>: Add and configure the modules you want to display</li>
  <li><strong>Manage Content</strong>: Add and update content for your portal</li>
  <li><strong>Publish</strong>: Make your portal available to the public</li>
</ol>

<p>For more detailed instructions, please refer to the documentation or contact your system administrator.</p>

<p>Enjoy using the DHIS2 Public Portal!</p>`,
						},
					},
				},
			],
		},
		label: "Home",
	},
];
