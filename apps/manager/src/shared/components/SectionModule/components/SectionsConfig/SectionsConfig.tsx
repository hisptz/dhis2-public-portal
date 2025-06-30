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
import { useFieldArray, useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	AppModule,
	BaseSectionConfig,
	DisplayItemType,
	Section,
	SectionModuleConfig,
	SectionType,
} from "@packages/shared/schemas";
import { AddSection } from "../AddSection/AddSection";
import { useAlert } from "@dhis2/app-runtime";
import { useSaveModule } from "../../../ModulesPage/hooks/save";

export function SectionsConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { save } = useSaveModule(moduleId);
	const navigate = useNavigate();

	const { fields, append, remove } = useFieldArray<
		SectionModuleConfig,
		"config.sections"
	>({
		name: "config.sections",
	});
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const normalizeSection = (data: BaseSectionConfig): Section => {
		switch (data.type) {
			case SectionType.FLEXIBLE_LAYOUT:
				return { ...data, items: [], layouts: {} } as Section;
			case SectionType.GRID_LAYOUT:
				return { ...data, items: [] } as Section;
			case SectionType.SINGLE_ITEM:
				return {
					...data,
					item: {
						type: DisplayItemType.RICH_TEXT,
						item: { id: "", content: "" },
					},
				} as Section;
			default:
				throw new Error("Unsupported section type");
		}
	};

	const { handleSubmit, formState } = useFormContext<AppModule>();

	const onError = (e) => {
		console.log(e);
		show({
			message: i18n.t("Please fix the validation errors before saving"),
			type: { critical: true },
		});
	};

	const onSubmit = async (data: AppModule) => {
		try {
			await save(data);
			navigate({
				to: "/modules/$moduleId/edit/section/$sectionIndex",
				params: {
					moduleId,
					sectionIndex: fields.length,
				},
			});
		} catch (error) {
			show({
				message: i18n.t("Failed to save section", error),
				type: { critical: true },
			});
		}
	};

	const sections = fields.map((field, index) => ({
		...field,
		actions: (
			<ButtonStrip>
				<Button
					dataTest={`edit-section-${index}`}
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
					dataTest={`remove-section-${index}`}
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
						handleSubmit(onSubmit, onError)();
					}}
				/>
			</div>
			<Divider />
			<Sections sections={sections} />
		</div>
	);
}
