import { useBoolean } from "usehooks-ts";
import React from "react";
import { Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { StaticItemConfig } from "@packages/shared/schemas";
import { useNavigate } from "@tanstack/react-router";
import { useRefreshModules } from "../../../ModulesPage/providers/ModulesProvider";
import { AddItemForm } from "./components/AddItemForm";
import { useItemList } from "../../hooks/data";

export function AddItem() {
	const refreshModules = useRefreshModules();
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit",
	});
	const { items, loading, error } = useItemList();
	const itemList = items.flat() as StaticItemConfig[];
	const nextSortOrder = itemList.length > 0
		? Math.max(...itemList.map(item => item.sortOrder ?? 0)) + 1
		: 1;

	return (
		<>
			{!hide && (
				<AddItemForm
					onComplete={(item: StaticItemConfig) => {
						refreshModules();
						navigate({
							to: "static/$itemId",
							params: {
								itemId: item.id,
							},
						});
					}}
					hide={hide}
					onClose={onHide}
					sortOrder={nextSortOrder}
				/>
			)}
			<Button onClick={onShow} disabled={loading || !!error}>
				{i18n.t("Add item")}
			</Button>
		</>
	);
}
