import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React, { useMemo } from "react";
import { Button, ButtonStrip, IconView16 } from "@dhis2/ui";
import { useNavigate } from "@tanstack/react-router";
import { useLibraries } from "../LibrariesProvider";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Name"),
		key: "label",
	},
	{
		label: i18n.t("Groups"),
		key: "groups",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function LibraryList() {
	const libraries = useLibraries();
	const navigate = useNavigate();

	const rows = useMemo(
		() =>
			libraries?.map((library) => ({
				...library,
				label: library.label,
				groups: library.groups.map((group) => group.label).join(", "),
				actions: (
					<ButtonStrip>
						<Button
							title={i18n.t("View")}
							aria-label={i18n.t("View")}
							small
							icon={<IconView16 />}
							onClick={() => {
								// navigate({
								// 	to: "/library/$libraryId/edit",
								// 	params: {
								// 		libraryId: library.id,
								// 	},
								// });
							}}
						/>
					</ButtonStrip>
				),
			})),
		[libraries],
	);

	return (
		<SimpleTable
			emptyLabel={i18n.t("There are no library configuration present")}
			columns={columns}
			rows={rows}
		/>
	);
}
