import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React, { useCallback, useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Card, Divider, IconArrowLeft24, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { AppModule, DisplayItem, DisplayItemType, FlexibleLayoutConfig, SectionModuleConfig, VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
import { SectionLayoutEditor } from "../../../../../../../../shared/components/SectionLayoutEditor";
import { useSaveModule } from "../../../../../../../../shared/components/ModulesPage/hooks/save";
import { useAlert } from "@dhis2/app-runtime";
import { AddVisualization } from "../../../../../../../../shared/components/VisualizationModule/components/AddVisualization/AddVisualization";
import { mapValues } from "lodash";

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
	const { setValue, getValues } = useFormContext<SectionModuleConfig>();
	const [size, setSize] = useState<number>(1200);

	const widths = useMemo(
		() => [
			{ name: i18n.t("small screen"), value: 996 },
			{ name: i18n.t("medium screen"), value: 1200 },
			{ name: i18n.t("large screen"), value: 1500 },
		],
		[],
	);

	const { append, remove, fields } = useFieldArray<
		SectionModuleConfig,
		`config.sections.${number}.items`
	>({
		name: `config.sections.${sectionIndex}.items`,
		keyName: "fieldId" as unknown as "id",
	});

	const onError = (error) => {
		console.error("Form validation errors:", error);
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


	const onAddVisualization = useCallback(
		(visualization: VisualizationItem) => {
			if (fields.some(field => field.item.id === visualization.id)) {
				show({
					message: i18n.t("This visualization is already added"),
					type: { critical: true },
				});
				return;
			}

			const displayItem: DisplayItem = {
				type: DisplayItemType.VISUALIZATION,
				item: visualization,
			};
			append(displayItem);
			const layouts = getValues(`config.sections.${sectionIndex}.layouts`) as FlexibleLayoutConfig;
			if (layouts) {
				const updatedLayouts = mapValues(layouts, (value, key) => {
					if (value) {
						return [
							...value,
							{
								i: visualization.id,
								x: 0,
								y: 0,
								w: key === "lg" ? 12 : key === "md" ? 10 : key === "sm" ? 6 : 4,
								h: 8,
							},
						];
					}
					return [
						{
							i: visualization.id,
							x: 0,
							y: 0,
							w: key === "lg" ? 12 : key === "md" ? 10 : key === "sm" ? 6 : 4,
							h: 8,
						},
					];
				});
				setValue(`config.sections.${sectionIndex}.layouts`, updatedLayouts);
			} else {
				setValue(`config.sections.${sectionIndex}.layouts`, {
					lg: [{ i: visualization.id, x: 0, y: 0, w: 12, h: 8 }],
					md: [{ i: visualization.id, x: 0, y: 0, w: 10, h: 8 }],
					sm: [{ i: visualization.id, x: 0, y: 0, w: 6, h: 8 }],
					xs: [{ i: visualization.id, x: 0, y: 0, w: 4, h: 8 }],
				});
			}
		},
		[append, fields, getValues, sectionIndex, setValue, show],
	);

	const handleDelete = useCallback(
		(id: string) => {
			const index = fields.findIndex(field => field.item.id === id);
			if (index === -1) {
				return;
			}
			remove(index);
			const layouts = getValues(`config.sections.${sectionIndex}.layouts`) as FlexibleLayoutConfig;
			const updatedLayouts = Object.fromEntries(
				Object.entries(layouts).map(([key, value]) => [
					key,
					value ? value.filter((layoutItem) => layoutItem.i !== id) : [],
				])
			);
			setValue(`config.sections.${sectionIndex}.layouts`, updatedLayouts);
		},
		[fields, remove, getValues, sectionIndex, setValue]
	);

	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="w-full flex flex-col">
				<div className="mb-2">
					<Button
						onClick={() => {
							goBack();
						}}
						icon={<IconArrowLeft24 />}
					>
						{i18n.t("Back")}
					</Button>
				</div>
				<div className="flex justify-between gap-8">
					<h2 className="text-2xl">{i18n.t("Manage visualization")}</h2>
					<ButtonStrip end>
						<Button
							onClick={() => {
								resetField(`config.sections.${sectionIndex}.layouts`);
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
							{i18n.t("Save changes")}
						</Button>
					</ButtonStrip>
				</div>
				<Divider />
			</div>
			<div className="w-full flex-1">
				<Card className="p-4 mb-4 max-h-[100px]  min-h-[100px] ">
					<div className="flex flex-row gap-8">
						<div className="max-w-[300px] min-w-[300px]">
							<SingleSelectField
								dataTest={"screen-size-select"}
								selected={size.toString()}
								onChange={({ selected }) => setSize(parseInt(selected))}
								label={i18n.t("Select screen size")}>
								{widths.map(({ name, value }) => (
									<SingleSelectOption
										key={value.toString()}
										label={name}
										value={value.toString()}
									/>
								))}
							</SingleSelectField>
						</div>
						<div className="flex-col">
							<h5 className="text-sm pb-5">{i18n.t("")}</h5>
							<AddVisualization onAdd={onAddVisualization} />
						</div>
					</div>
				</Card>
				<SectionLayoutEditor
					size={size}
					onDelete={handleDelete}
					prefix={`config.sections.${sectionIndex}`}
				/>
			</div>
			<div className="py-4">
				<ButtonStrip end>
					<Button
						onClick={() => {
							resetField(`config.sections.${sectionIndex}.layouts`);
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
						{i18n.t("Save changes")}
					</Button>
				</ButtonStrip>
			</div>
		</div>
	);
}
