import { Button, IconDelete16, Tooltip } from "@dhis2/ui";
import React from "react";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useDialog } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useDeleteDataSource } from "../hooks/save";

export function DeleteConfiguration({
	config,
}: {
	config: DataServiceConfig;
}) {
	const { confirm } = useDialog();
	const { deleteConfig } = useDeleteDataSource();

	return (
		<Tooltip content={i18n.t("Delete configuration")}>
			<Button
				small
				destructive
				onClick={() => {
					confirm({
						title: i18n.t("Confirm delete"),
						message: (
							<span>
								{i18n.t(
									"Are you sure you want to delete the configuration ",
								)}
								<b>{config.source.name}</b>?{" "}
								{i18n.t("This action cannot be undone.")}
							</span>
						),
						onConfirm: async () => {
							await deleteConfig(config);
						},
						confirmButtonText: i18n.t("Delete"),
						confirmButtonColor: "destructive",
					});
				}}
				icon={<IconDelete16 />}
			/>
		</Tooltip>
	);
}
