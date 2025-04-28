import React, { useCallback } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Divider, IconDelete16, IconLayoutColumns24 } from "@dhis2/ui";
import { DashboardVisualizations } from "./components/DashboardVisualizations";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AddVisualization } from "../AddVisualization/AddVisualization";
import { mapValues } from "lodash";
import { EditVisualization } from "../AddVisualization/componets/EditVisualization";
import { DisplayItem, FlexibleLayoutConfig, VisualizationItem, DisplayItemType, VisualizationModule } from "@packages/shared/schemas";
import { useNavigate, useParams } from "@tanstack/react-router";

export function DashboardVisualizationsConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { setValue, getValues } = useFormContext<VisualizationModule>();
	const navigate = useNavigate();
	const hasGroups = useWatch<VisualizationModule, "config.grouped">({
		name: "config.grouped",
	});

	const { fields, append, update, remove } = useFieldArray<
		VisualizationModule,
		"config.items"
	>({
		name: "config.items",
		keyName: "fieldId" as unknown as "id",
	});

	const onAddVisualization = useCallback(
		(visualization: VisualizationItem) => {
			const displayItem: DisplayItem = {
				type: DisplayItemType.VISUALIZATION,
				item: visualization,
			};
			append(displayItem);
			const layouts = getValues("config.layouts") as FlexibleLayoutConfig;
			if (layouts) {
				const updatedLayouts = mapValues(layouts, (value) => {
					if (value) {
						return [
							...value,
							{
								i: visualization.id,
								x: 0,
								y: 0,
								w: 4,
								h: 4,
							},
						];
					}
				});
				setValue("config.layouts", updatedLayouts);
			} else {
				setValue("config.layouts", {
					lg: [
						{
							i: visualization.id,
							x: 0,
							y: 0,
							w: 4,
							h: 4,
						},
					],
					md: [
						{
							i: visualization.id,
							x: 0,
							y: 0,
							w: 4,
							h: 4,
						},
					],
					sm: [
						{
							i: visualization.id,
							x: 0,
							y: 0,
							w: 4,
							h: 4,
						},
					],
					xs: [
						{
							i: visualization.id,
							x: 0,
							y: 0,
							w: 4,
							h: 4,
						},
					],
				});
			}
		},
		[append, getValues, setValue],
	);

	if (hasGroups) {
		return null;
	}

	const rows = fields
    .filter((field) => field.type === DisplayItemType.VISUALIZATION)
    .map((field, index) => {
        const visualizationField = field as DisplayItem & { 
            type: DisplayItemType.VISUALIZATION;
            item: VisualizationItem;
        };

        return {
            ...visualizationField.item,
            actions: (
                <ButtonStrip key={field.id}>
                    <EditVisualization
                        visualization={visualizationField.item}
                        onUpdate={(data) => update(index, { 
                            ...visualizationField,
                            item: data 
                        })}
                    />
                    <Button
                        onClick={() => remove(index)}
                        title={i18n.t("Remove")}
                        icon={<IconDelete16 />}
                    />
                </ButtonStrip>
            ),
        };
    });

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Visualizations")}</h3>
				<ButtonStrip end>
					<Button
						onClick={() =>
							navigate({
								to: "/modules/$moduleId/edit/layout",
								params: { moduleId },
							})
						}
						icon={<IconLayoutColumns24 />}
					>
						{i18n.t("Configure layout")}
					</Button>
					<AddVisualization onAdd={onAddVisualization} />
				</ButtonStrip>
			</div>
			<Divider />
			<DashboardVisualizations visualizations={rows} />
		</div>
	);
}
