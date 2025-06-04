import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconLayoutColumns24,
} from "@dhis2/ui";
import { GroupVisualizations } from "./components/GroupVisualizations";
import { useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useGroupNamePrefix } from "../../hooks/route";
import {
	DisplayItem,
	DisplayItemType,
	VisualizationItem,
	VisualizationModule,
} from "@packages/shared/schemas";
import { useVisualizationNames } from "../../../VisualizationModule/hooks/data";
import { FullLoader } from "../../../FullLoader";
import ErrorPage from "../../../ErrorPage/ErrorPage";

export function GroupVisualizationsConfig() {
	const { moduleId, groupIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/",
	});
	const namePrefix = useGroupNamePrefix();
	const navigate = useNavigate();

	const { fields } = useFieldArray<
		VisualizationModule,
		`config.groups.${number}.items`
	>({
		name: `${namePrefix}.items`,
		keyName: "fieldId" as unknown as "id",
	});

	const visualizationIds = fields
		.filter((field) => field.type === DisplayItemType.VISUALIZATION)
		.map((field) => (field.item as VisualizationItem).id);

	const { visualizationNames, loading, error } =
		useVisualizationNames(visualizationIds);

	const rows = fields
		.filter((field) => field.type === DisplayItemType.VISUALIZATION)
		.map((field) => {
			const visField = field as DisplayItem & {
				type: DisplayItemType.VISUALIZATION;
				item: VisualizationItem;
			};
			const visId = visField.item.id;
			return {
				...visField.item,
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
								to: "/modules/$moduleId/edit/$groupIndex/layout",
								params: { moduleId, groupIndex },
							})
						}
						icon={<IconLayoutColumns24 />}
					>
						{i18n.t("Manage visualization")}
					</Button>
				</ButtonStrip>
			</div>
			<Divider />
			<GroupVisualizations visualizations={rows} />
		</div>
	);
}
