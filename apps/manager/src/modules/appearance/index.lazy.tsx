import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../shared/components/ModuleContainer";
import i18n from "@dhis2/d2-i18n";

export const Route = createLazyFileRoute("/appearance/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ModuleContainer title="Appearance">
			<section>
				<h3 className="text-lg font-bold">
					{i18n.t("Application colors")}
				</h3>
				<div>
					<ul>
						<li>
							Primary color - Selector of available colors -
							Mantine colors
						</li>

						<li>
							Custom colors - Add one color and generate the
							shades
						</li>
					</ul>
				</div>
				<h4>Chart colors</h4>
				Selection of colors for chart visualizations
			</section>
			<section>
				<h3 className="text-lg font-bold">
					{i18n.t("Header configuration")}
				</h3>
			</section>
			<section>
				<h3 className="text-lg font-bold">
					{i18n.t("Footer configuration")}
				</h3>
			</section>
		</ModuleContainer>
	);
}
