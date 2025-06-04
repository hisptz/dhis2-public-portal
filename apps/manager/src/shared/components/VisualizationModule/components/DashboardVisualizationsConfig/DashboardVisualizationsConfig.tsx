import React, { useCallback, useMemo } from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconLayoutColumns24,
} from "@dhis2/ui";
import { DashboardVisualizations } from "./components/DashboardVisualizations";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AddVisualization } from "../AddVisualization/AddVisualization";
import { mapValues } from "lodash";
import { EditVisualization } from "../AddVisualization/componets/EditVisualization";
import {
	DisplayItem,
	DisplayItemType,
	FlexibleLayoutConfig,
	VisualizationItem,
	VisualizationModule,
} from "@packages/shared/schemas";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useVisualizationNames } from "../../hooks/data";
import { FullLoader } from "../../../FullLoader";
import ErrorPage from "../../../ErrorPage/ErrorPage";

export function DashboardVisualizationsConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const navigate = useNavigate();
	const hasGroups = useWatch<VisualizationModule, "config.grouped">({
		name: "config.grouped",
	});

	const { fields} = useFieldArray<
		VisualizationModule,
		"config.items"
	>({
		name: "config.items",
		keyName: "fieldId" as unknown as "id",
	});

	const visualizationIds = useMemo(
		() =>
			fields
				.filter((field) => field.type === DisplayItemType.VISUALIZATION)
				.map((field) => (field.item as VisualizationItem).id),
		[fields],
	);
	const { visualizationNames, loading, error } =
		useVisualizationNames(visualizationIds);

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
			const visId = visualizationField.item.id;
			return {
				...visualizationField.item,
				id: visualizationNames.get(visId) || visId,
			};
		});

	if (loading) {
		return (
			<div>
				<FullLoader />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<ErrorPage error={i18n.t("Error loading visualizations: ")} />
			</div>
		);
	}

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
						{i18n.t("Manage visualization")}
					</Button>
				</ButtonStrip>
			</div>
			<Divider />
			<DashboardVisualizations visualizations={rows} />
		</div>
	);
}
