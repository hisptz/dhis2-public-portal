import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
	const { siteConfig } = useDocusaurusContext();
	return (
		<header className={clsx("hero hero--primary", styles.heroBanner)}>
			<div className="container">
				<Heading as="h1" className="hero__title">
					{siteConfig.title}
				</Heading>
				<p className="hero__subtitle">{siteConfig.tagline}</p>
				<p
					style={{
						fontSize: "1.2rem",
						textAlign: "center",
					}}
				>
					DHIS2 FlexiPortal is a customizable, deployment-ready
					public-facing portal that enables easy, secure access to
					data stored in a DHIS2 instance. It simplifies sharing data
					with the public by allowing DHIS2 visualizations and
					resources to be published with minimal effort, promoting
					data use.
				</p>
				<div className={styles.buttons}>
					<Link
						className="button button--secondary button--lg"
						to="/docs/deployment/intro"
					>
						Get started
					</Link>
				</div>
			</div>
		</header>
	);
}

export default function Home(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description="DHIS2 FlexiPortal is a customizable, deployment-ready
					public-facing portal that enables easy, unauthenticated
					access to data stored in a DHIS2 instance"
		>
			<HomepageHeader />
			<main>
				<HomepageFeatures />
			</main>
		</Layout>
	);
}
