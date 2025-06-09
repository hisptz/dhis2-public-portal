import React from "react";
import { useWatch } from "react-hook-form";
import { useParams } from "@tanstack/react-router";
import { SectionType } from "@packages/shared/schemas";
import { SectionSingleItemConfig } from "./components/SectionSingleItemConfig";
import { SectionItemsConfig } from "./components/SectionItemsConfig";
import { HighlightedSingleItemsConfig } from "./components/HighlightedSingleValueConfig/HighlightedSingleItemsConfig";

export function SectionVisualizationsConfig() {
	const { sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});

	const sectionType = useWatch({
		name: `config.sections.${sectionIndex}.type`,
	});

	switch (sectionType) {
		case SectionType.SINGLE_ITEM:
			return <SectionSingleItemConfig />;
		case SectionType.GRID_LAYOUT:
			return <HighlightedSingleItemsConfig />;
		default:
			return <SectionItemsConfig />;
	}
}
