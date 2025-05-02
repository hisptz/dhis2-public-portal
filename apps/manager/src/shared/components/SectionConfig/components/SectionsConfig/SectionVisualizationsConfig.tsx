import React from "react";
import { useWatch } from "react-hook-form";
import { useParams } from "@tanstack/react-router";
import { SectionType } from "@packages/shared/schemas";
import { SectionSingleItemConfig } from "./components/SectionSingleItemConfig";
import { SectionItemsConfig } from "./components/SectionItemsConfig";

export function SectionVisualizationsConfig() {
	const { sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});

	const sectionType = useWatch({
		name: `config.sections.${sectionIndex}.type`,
	});

	return sectionType === SectionType.SINGLE_ITEM ? (
		<SectionSingleItemConfig />
	) : (
		<SectionItemsConfig />
	);
}
