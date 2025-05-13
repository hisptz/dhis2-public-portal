import { useFormContext, useWatch } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import React, { useEffect } from "react";
import { kebabCase } from "lodash";
import { VisualizationGroup } from "@packages/shared/schemas";

export function SectionIDField() {
	const { setValue } = useFormContext<VisualizationGroup>();
	const label = useWatch<VisualizationGroup, "title">({
		name: "title",
	});

	useEffect(() => {
		if (label) {
			setValue("id", kebabCase(label.toLowerCase()));
		}
	}, [label, setValue]);

	return (
		<RHFTextInputField required disabled name="id" label={i18n.t("ID")} />
	);
}
