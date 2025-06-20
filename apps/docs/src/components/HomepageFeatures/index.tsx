import type { ReactNode } from "react";
import styles from "./styles.module.css";
import Heading from "@theme/Heading";
import {
	IconArticle,
	IconChartBarPopular,
	IconFolders,
	IconSettingsCheck,
	IconTrophy,
	
} from "@tabler/icons-react";

type FeatureItem = {
	title: string;
	description: string;
	icon: ReactNode;
};

const FeatureList: FeatureItem[] = [
	{
		title: "Configurable",
		description:
			"Customize your portal to fit your organization's needs. Add or remove modules and customize their appearance.",
		icon: <IconSettingsCheck color="#047260" size={64} />,
	},
	{
		title: "Visualizations",
		description:
			"Display DHIS2 visualizations like charts, maps, and tables to share data with the public.",
		icon: <IconChartBarPopular color="#047260" size={64} />,
	},
	{
		title: "Static Content",
		description:
			"Display static content like blog or articles, and social media content right in your portal.",
		icon: <IconArticle color="#047260" size={64} />,
	},
	{
		title: "Document Module",
		description:
			"Share documents and resources stored in DHIS2 with your portal visitors.",
		icon: <IconFolders color="#047260" size={64} />,
	},
];

function Feature({ title, description, icon }: FeatureItem) {
	return (
		<div className="col col--3">
			<div className="text--center padding-horiz--md">
				<div className={styles.featureIcon}>{icon}</div>
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	);
}

export default function HomepageFeatures(): ReactNode {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="text--center margin-bottom--xl">
						<div>
							<IconTrophy color="#047260" size={72} />
							<p className="text-lg font-bold italic">
								DHIS2 App Winner 2025
							</p>
						</div>
					<Heading as="h2">Key Features of DHIS2 FlexiPortal</Heading>
					<p>
						Explore the powerful modules that make DHIS2 FlexiPortal
						a versatile solution for sharing DHIS2 data with the
						public
					</p>
				</div>
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	);
}
