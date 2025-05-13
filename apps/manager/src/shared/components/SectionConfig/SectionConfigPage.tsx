import React from "react";
import { SectionGeneralConfig } from "./components/SectionGeneralConfig";
import { SectionVisualizationsConfig } from "./components/SectionsConfig/SectionVisualizationsConfig";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useFormContext, useWatch } from "react-hook-form";
import { PageHeader } from "../PageHeader";
import { AppModule } from "@packages/shared/schemas";
import { SectionEditActions } from "../SectionModule/components/SectionEditActions";
import { useDialog } from "@hisptz/dhis2-ui";

function SectionPageHeader() {
	const { sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});
	const label = useWatch<AppModule, `config.sections.${number}.title`>({
		name: `config.sections.${sectionIndex}.title`,
	});

	return (
		<PageHeader
			title={`${i18n.t("Section")} - ${label}`}
			actions={<SectionEditActions />}
		/>
	);
}

export function SectionConfigPage() {
	const { resetField, getFieldState } = useFormContext();
	const { confirm } = useDialog();
	const { moduleId, sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});

	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/section/$sectionIndex",
	});

	return (
		<div className="flex flex-col gap-6 w-full h-full">
			<div>
				<Button
					onClick={() => {
						const fieldState = getFieldState(
							`config.sections.${sectionIndex}`,
						);
						if (fieldState.isDirty) {
							confirm({
								title: i18n.t("Confirm reset"),
								message: i18n.t(
									"There were changes made to this section. Would you like to reset them? Resetting will remove all changes made to this section. This action is not reversible.",
								),
								onCancel: () => {
									navigate({
										to: "/modules/$moduleId/edit",
										params: { moduleId },
									});
								},
								onConfirm: () => {
									resetField(
										`config.sections.${sectionIndex}`,
									);
									navigate({
										to: "/modules/$moduleId/edit",
										params: { moduleId },
									});
								},
								confirmButtonText: i18n.t("Reset changes"),
								cancelButtonText: i18n.t("Keep changes"),
								confirmButtonColor: "primary",
							});
						} else {
							navigate({
								to: "/modules/$moduleId/edit",
								params: { moduleId },
							});
						}
					}}
					icon={<IconArrowLeft24 />}
				>
					{i18n.t("Back to Module")}
				</Button>
			</div>
			<SectionPageHeader />
			<SectionGeneralConfig />
			<SectionVisualizationsConfig />
		</div>
	);
}
