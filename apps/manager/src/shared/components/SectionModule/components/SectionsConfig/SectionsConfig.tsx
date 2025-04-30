import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconEdit16,
} from "@dhis2/ui";
import { Sections } from "./components/Sections";
import { useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	BaseSectionConfig,
	Section,
	SectionModuleConfig,
	SectionType,
} from "@packages/shared/schemas";
import { AddSection } from "../AddSection/AddSection";

export function SectionsConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const navigate = useNavigate();

	const { fields, append, remove } = useFieldArray<
		SectionModuleConfig,
		"config.sections"
	>({
		name: "config.sections",
	});

	const normalizeSection = (data: BaseSectionConfig): Section => {
		switch (data.type) {
			case SectionType.FLEXIBLE_LAYOUT:
				return { ...data, items: [], layouts: {} } as Section;
			case SectionType.GRID_LAYOUT:
				return { ...data, items: [] } as Section;
			case SectionType.SINGLE_ITEM:
				return { ...data, item: {} } as Section;
			default:
				throw new Error("Unsupported section type");
		}
	};

	const sections = fields.map((field, index) => ({
		...field,
		actions: (
			<ButtonStrip>
				<Button
					onClick={() =>
						navigate({
							to: "/modules/$moduleId/edit/section/$sectionIndex",
							params: {
								moduleId,
								sectionIndex: index,
							},
						})
					}
					icon={<IconEdit16 />}
				/>
				<Button
					onClick={() => remove(index)}
					title={i18n.t("Remove")}
					icon={<IconDelete16 />}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Sections")}</h3>
				<AddSection
					onAdd={(data) => {
						append(normalizeSection(data));
						navigate({
							to: "/modules/$moduleId/edit/section/$sectionIndex",
							params: {
								moduleId,
								sectionIndex: fields.length,
							},
						});
					}}
				/>
			</div>
			<Divider />
			<Sections sections={sections} />
		</div>
	);
}
