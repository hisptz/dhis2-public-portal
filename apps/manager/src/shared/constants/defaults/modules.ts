import {
	AppModule,
	DisplayItemType,
	ModuleType,
	SectionDisplay,
	SectionType,
} from "@packages/shared/schemas";

export const defaultHomeModule: AppModule = {
	type: ModuleType.SECTION as const,
	id: "home",
	sectionDisplay: SectionDisplay.VERTICAL,
	config: {
		sections: [
			{
				sortOrder: 0,
				type: SectionType.SINGLE_ITEM,
				title: "Welcome to DHIS2 FlexiPortal",
				id: "welcome-note",
				item: {
					type: DisplayItemType.RICH_TEXT,
					item: {
						id: "welcome-note",
						content: `
<h1><strong style="font-size: 24pt;">Welcome to DHIS2 FlexiPortal!</strong></h1>

<p>Thank you for using the DHIS2 FlexiPortal! This platform is designed to transform how DHIS2 data is publicly shared, accessed, and understood.</p>

<p><br></p>
<p><strong style="font-size: 18pt;">About the Application</strong></p>
<p>The DHIS2 FlexiPortal brings together up-to-date, visualized, and aggregated health data from DHIS2 systems and enhances it with essential resources, including:</p>


<ul>
    <li><strong><br></strong></li>
</ul>
<ul style="list-style-type: circle;">
    <li><strong>Data Visualizations</strong>: Interactive charts, maps, and dashboards</li>
</ul>
<ul>
    <li><strong>Key Indicators</strong>: Important health metrics at a glance</li>
    <li><strong>Document Library</strong>: Strategic reports, guidelines, and knowledge resources</li>
    <li><strong>News Section or Blogs</strong>: Latest updates and announcements</li>
    <li><strong>FAQ Section</strong>: Answers to common questions</li>
    <li><strong>Feedback System</strong>: A way for users to provide input</li>
</ul>







<p><br></p>
<h2><span style="font-size: 18pt;"><strong>Getting Started</strong></span></h2>
<p><br></p>
<p>To configure your Public Portal:</p>

<ol>
    <li><strong>Access the Manager App</strong>: Log in to your DHIS2 instance and open the Portal Manager application</li>
    <li><strong>Configure Appearance</strong>: Customize the look and feel of your portal</li>
    <li><strong>Set Up Modules</strong>: Add and configure the modules you want to display</li>
    <li><strong>Manage Content</strong>: Add and update content for your portal</li>
</ol>
<p><br></p>

<p>For more detailed instructions, please refer to the documentation or contact your system administrator.</p>
<p><br></p>

<p><em>Enjoy using the DHIS2 FlexiPortal!</em></p>
`,
					},
				},
			},
		],
	},
	label: "Home",
};
