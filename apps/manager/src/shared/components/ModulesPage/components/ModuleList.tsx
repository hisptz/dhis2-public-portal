import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React, {useMemo } from "react";
import { Button, ButtonStrip, IconView16 } from "@dhis2/ui";
import { useNavigate } from "@tanstack/react-router";
import { useModules } from "../providers/ModulesProvider";
import { ModuleType } from "@packages/shared/schemas";
import { startCase } from "lodash";
import { Links } from "../../../constants/links";
const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Label"),
		key: "label",
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
	const  modules  = useModules();
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

	const hasOnlyDefault =
		filteredModules.length === 1 && filteredModules[0].id === "home";
	const rows = useMemo(
		() =>
			filteredModules.map((module) => ({
				...module,
				type: startCase(module.type.toLowerCase()),
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
		<div className="space-y-6">
			<SimpleTable
				emptyLabel={
					filterType
						? i18n.t(
								"There are no modules matching the selected type.",
							)
						: i18n.t("There are no modules configuration present")
				}
				columns={columns}
				rows={rows}
			/>

			{hasOnlyDefault && (
				<div className="p-6   bg-gray-50 text-center">
					<p className="text-gray-700 ">
						{i18n.t(
							"Only the default module is currently configured",
						)}
					</p>
					<p className="mt-2 ">
						<a
							href={Links.DOCUMENTATION}
							className=" text-gray-700"
						>
							{i18n.t("Read the")}{" "}
							<strong>{i18n.t("documentation")}</strong>{" "}
							{i18n.t("to add more modules")}
						</a>
					</p>
				</div>
			)}
		</div>
	);
}
