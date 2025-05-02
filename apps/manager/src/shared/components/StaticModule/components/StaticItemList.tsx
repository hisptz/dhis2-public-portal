import { useNavigate } from "@tanstack/react-router";
import { SimpleDataTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { StaticItemConfig } from "@packages/shared/schemas";
import { Button, IconView16 } from "@dhis2/ui";
import { useItemList } from "../hooks/data";
import React from "react";
import { StyledIcon } from "../../Icon";
import { AddItem } from "./AddItem/AddItem";
import { useModule } from "../../ModulesPage/providers/ModuleProvider";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Title"),
		key: "title",
	},
	{
		label: i18n.t("Short Description"),
		key: "shortDescription",
	},
	{
		label: i18n.t("Content"),
		key: "content",
	},
	{
		label: i18n.t("Icon"),
		key: "icon",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function StaticItemList() {
	const { items, loading, error } = useItemList();
	const module = useModule();
	const itemList = items.flat() as StaticItemConfig[];
	const navigate = useNavigate();

	const rows = itemList.map((item: StaticItemConfig) => ({
		...item,
		shortDescription:
			item?.shortDescription.length > 100
				? item?.shortDescription.slice(0, 100) + "..."
				: item?.shortDescription,
		content:
			item?.content.length > 100
				? item?.content.slice(0, 100) + "..."
				: item?.content,
		icon: (
			<div
				style={{ borderRadius: "10%" }}
				className="p-4 flex items-center justify-center"
			>
				<StyledIcon height={48} width={48} icon={item.icon} />
			</div>
		),
		actions: (
			<Button
				icon={<IconView16 />}
				onClick={() =>
					navigate({
						to: "/modules/$moduleId/edit/static/$itemId",
						params: { moduleId: module.id, itemId: item.id },
					})
				}
			></Button>
		),
	}));

	if (loading)
		return (
			<div>
				<FullLoader />
			</div>
		);
	if (error)
		return (
			<div>
				<ErrorPage
					error={i18n.t("Error: {{error}}", { error: error.message })}
				/>
			</div>
		);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<h3 className="text-2xl">{i18n.t("Items")}</h3>
				<AddItem />
			</div>
			<SimpleDataTable columns={columns} rows={rows} />
		</div>
	);
}
