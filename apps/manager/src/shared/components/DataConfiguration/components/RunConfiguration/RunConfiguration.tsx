import { Button, IconLaunch16, Tooltip } from "@dhis2/ui";
import React from "react";
import { useBoolean } from "usehooks-ts";
import { DataServiceConfig } from "@packages/shared/schemas";
import { RunConfigForm } from "./components/RunConfigForm/RunConfigForm";
import i18n from "@dhis2/d2-i18n";

export function RunConfiguration({ config }: { config: DataServiceConfig }) {
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onShow,
	} = useBoolean(true);
	return (
		<>
			{!hide && (
				<RunConfigForm config={config} hide={hide} onClose={onClose} />
			)}
			<Tooltip content={i18n.t("Run configuration")}>
				<Button icon={<IconLaunch16 />} onClick={onShow} small />
			</Tooltip>
		</>
	);
}
