import { DataServiceConfig } from "@packages/shared/schemas";
import { RunConfigSummaryModal } from "./components/RunConfigSummaryModal";
import { useBoolean } from "usehooks-ts";
import React from "react";
import { Button, IconTerminalWindow16, Tooltip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

export function RunConfigSummary({ config }: { config: DataServiceConfig }) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<RunConfigSummaryModal
					hide={hide}
					onClose={onHide}
					config={config}
				/>
			)}
			<Tooltip content={i18n.t("View last run summary")}>
				<Button
					small
					onClick={onShow}
					icon={<IconTerminalWindow16 />}
				/>
			</Tooltip>
		</>
	);
}
