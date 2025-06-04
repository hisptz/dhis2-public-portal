import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React, { useCallback, useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Card, Divider, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { DashboardLayoutEditor } from "../../../../../../shared/components/DashboardLayoutEditor";
import { AppModule, DisplayItem, DisplayItemType, FlexibleLayoutConfig, VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
import { AddVisualization } from "../../../../../../shared/components/VisualizationModule/components/AddVisualization/AddVisualization";
import { mapValues } from "lodash";
import { useSaveModule } from "../../../../../../shared/components/ModulesPage/hooks/save";
import { useAlert } from "@dhis2/app-runtime";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/layout",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { resetField } = useFormContext<AppModule>();
	const { save } = useSaveModule(moduleId);
	const { handleSubmit, formState, reset } = useFormContext<AppModule>();

	const navigate = useNavigate();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const goBack = () => {
		navigate({
			to: "/modules/$moduleId/edit",
			params: { moduleId },
		});
	};
	const { setValue, getValues } = useFormContext<VisualizationModule>();
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
		VisualizationModule,
		"config.items"
	>({
		name: "config.items",
		keyName: "fieldId" as unknown as "id",
	});

	const onSubmit = async (data: AppModule) => {
		try {
			await save(data);
 			 reset(data, { keepDirty: false, keepTouched: true });
		} catch (error) {
			show({
				message: i18n.t("Failed to save visualization", error),
				type: { critical: true },
			});
		}
	};

	const onAddVisualization = useCallback(
		(visualization: VisualizationItem) => {
			const displayItem: DisplayItem = {
				type: DisplayItemType.VISUALIZATION,
				item: visualization,
			};
			append(displayItem);
			const layouts = getValues("config.layouts") as FlexibleLayoutConfig;
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
				setValue("config.layouts", updatedLayouts);
			} else {
				setValue("config.layouts", {
					lg: [{ i: visualization.id, x: 0, y: 0, w: 12, h: 8 }],
					md: [{ i: visualization.id, x: 0, y: 0, w: 10, h: 8 }],
					sm: [{ i: visualization.id, x: 0, y: 0, w: 6, h: 8 }],
					xs: [{ i: visualization.id, x: 0, y: 0, w: 4, h: 8 }],
				});
			}
		},
		[append, getValues, setValue],
	);

	const handleDelete = useCallback(
		(id: string) => {
			const index = fields.findIndex(field => field.item.id === id);
			if (index === -1) {
				return;
			}
			remove(index);
			const layouts = getValues("config.layouts") as FlexibleLayoutConfig;
			const updatedLayouts = Object.fromEntries(
				Object.entries(layouts).map(([key, value]) => [
					key,
					value ? value.filter((layoutItem) => layoutItem.i !== id) : [],
				])
			);
			setValue("config.layouts", updatedLayouts);
		},
		[fields, remove, getValues, setValue]
	);

	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="w-full flex flex-col ">
				<div className="flex justify-between gap-8">
					<h2 className="text-2xl">{i18n.t("Manage visualization")}</h2>
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
								handleSubmit(onSubmit)();
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
							<h5 className="text-sm pb-[1px]">{i18n.t("Add visualization")}</h5>
							<AddVisualization onAdd={onAddVisualization} />
						</div>
					</div>
				</Card>
				<DashboardLayoutEditor size={size} onDelete={handleDelete} />
			</div>
		</div>
	);
}

