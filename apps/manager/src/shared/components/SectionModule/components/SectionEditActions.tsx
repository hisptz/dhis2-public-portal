import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useNavigate } from "@tanstack/react-router";

export function SectionEditActions() {
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/section/$sectionIndex",
	});

	return (
		<ButtonStrip end>
			<Button
				onClick={() => {
					navigate({
						to: "/modules/$moduleId/edit",
					});
				}}
			>
				{i18n.t("Cancel")}
			</Button>
			<Button
				primary
				onClick={() => {
					navigate({
						to: "/modules/$moduleId/edit",
					});
				}}
			>
				{i18n.t("Save section changes")}
			</Button>
		</ButtonStrip>
	);
}
