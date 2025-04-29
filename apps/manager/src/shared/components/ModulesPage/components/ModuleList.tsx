import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React, { useMemo } from "react";
import { Button, ButtonStrip, IconView16 } from "@dhis2/ui";
import { useNavigate } from "@tanstack/react-router";
import { useModules } from "../providers/ModulesProvider";
import { ModuleType } from "@packages/shared/schemas";
import { startCase } from "lodash";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Title"),
		key: "title",
	},
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function ModuleList({ filterType }: { filterType?: ModuleType }) {
	const modules = useModules();
	const navigate = useNavigate();

	const filteredModules = useMemo(() => {
		if (!modules) {
			return [];
		}
		if (!filterType) {
			return modules;
		}
		return modules.filter((module) => module.type === filterType);
	}, [modules, filterType]);

	const rows = useMemo(
		() =>
			filteredModules.map((module) => ({
				...module,
				type: startCase(module.type.toLowerCase()),
				title: module.config.title ?? module.id,

				actions: (
					<ButtonStrip>
						<Button
							small
							icon={<IconView16 />}
							onClick={() => {
								navigate({
									to: "/modules/$moduleId/edit",
									params: {
										moduleId: module.id,
									},
								});
							}}
						/>
					</ButtonStrip>
				),
			})),
		[filteredModules, navigate],
	);

	return (
		<SimpleTable
			emptyLabel={
				filterType
					? i18n.t("There are no modules matching the selected type.")
					: i18n.t("There are no dashboard configuration present")
			}
			columns={columns}
			rows={rows}
		/>
	);
}
