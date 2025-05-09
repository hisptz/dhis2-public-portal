import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Divider } from "@dhis2/ui";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { AppModule } from "@packages/shared/schemas";
import { SectionLayoutEditor } from "../../../../../../../../shared/components/SectionLayoutEditor";
import { useSaveModule } from "../../../../../../../../shared/components/ModulesPage/hooks/save";
import { useAlert } from "@dhis2/app-runtime";

const searchSchema = z.object({
	subGroupIndex: z.number().optional(),
});

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/layout",
)({
	component: RouteComponent,
	validateSearch: searchSchema,
	params: {
		parse: (rawParams) => {
			return {
				...rawParams,
				sectionIndex: parseInt(rawParams.sectionIndex),
			};
		},
		stringify: (params) => {
			return {
				...params,
				sectionIndex: params.sectionIndex.toString(),
			};
		},
	},
});

function RouteComponent() {
	const { moduleId, sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/layout",
	});
	const { resetField } = useFormContext<AppModule>();
	const navigate = useNavigate();

	const goBack = () => {
		navigate({
			to: "/modules/$moduleId/edit/section/$sectionIndex",
			params: { moduleId, sectionIndex },
		});
	};

	const { save } = useSaveModule(moduleId);
	const { handleSubmit, formState, reset } = useFormContext<AppModule>();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

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
			reset(data);
			goBack();
		} catch (error) {
			show({
				message: i18n.t("Failed to save section", error),
				type: { critical: true },
			});
		}
	};

	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="w-full flex flex-col ">
				<div className="flex justify-between gap-8">
					<h2 className="text-2xl">{i18n.t("Layout editor")}</h2>
					<ButtonStrip end>
						<Button
							onClick={() => {
								resetField("config.layouts");
								goBack();
							}}
						>
							{i18n.t("Cancel")}
						</Button>
						<Button
							primary
							loading={formState.isSubmitting}
							disabled={
								!formState.isDirty || formState.isSubmitting
							}
							onClick={() => {
								handleSubmit(onSubmit, onError)();
							}}
						>
							{i18n.t("Update layout")}
						</Button>
					</ButtonStrip>
				</div>
				<Divider />
			</div>
			<div className="w-full flex-1">
				<SectionLayoutEditor
					prefix={`config.sections.${sectionIndex}`}
				/>
			</div>
			<div>
				<ButtonStrip end>
					<Button
						onClick={() => {
							resetField("config.layouts");
							goBack();
						}}
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						primary
						loading={formState.isSubmitting}
						disabled={!formState.isDirty || formState.isSubmitting}
						onClick={() => {
							handleSubmit(onSubmit, onError)();
						}}
					>
						{i18n.t("Update layout")}
					</Button>
				</ButtonStrip>
			</div>
		</div>
	);
}
