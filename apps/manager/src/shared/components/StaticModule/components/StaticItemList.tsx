import { useNavigate } from "@tanstack/react-router";
import { SimpleDataTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { StaticItemConfig } from "@packages/shared/schemas";
import { Button, IconView16 } from "@dhis2/ui";
import { useItemList } from "../hooks/data";
import React, { useMemo } from "react";
import { AddItem } from "./AddItem/AddItem";
import { useModule } from "../../ModulesPage/providers/ModuleProvider";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { RichContent } from "../../RichContent";
import { SortItems } from "./SortItems/SortItems";

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
		label: i18n.t("Actions"),
		key: "actions",
	},
];


export function StaticItemList() {
	const { items, loading, error, refetch } = useItemList();
	const module = useModule();

	const itemList = useMemo(() => {
		return (items.flat() as StaticItemConfig[])
			.slice()
			.sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
	}, [items]);
	const navigate = useNavigate();

	const rows = itemList.map((item: StaticItemConfig) => ({
		...item,
		shortDescription:
			item?.shortDescription.length > 500
				? item?.shortDescription.slice(0, 500) + "..."
				: item?.shortDescription,
		content: (<RichContent content={item?.content ?? ""} />),
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
				<div className="flex gap-4">
					<SortItems items={itemList} onSortSubmit={
						async () => {
							refetch();
						}
					} /> <AddItem /></div>

			</div>
			<SimpleDataTable columns={columns} rows={rows} />
		</div>
	);
}
