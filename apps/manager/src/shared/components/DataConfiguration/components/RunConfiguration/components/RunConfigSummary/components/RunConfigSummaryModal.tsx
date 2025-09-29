import {
	Button,
	ButtonStrip,
	CircularLoader,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DataServiceConfig } from "@packages/shared/schemas";
import React, { Suspense } from "react";
import { useDataConfigRunStatus } from "../../RunConfigStatus/hooks/status";
import { StatusIndicator } from "../../RunConfigStatus/RunConfigStatus";
import { RunConfigSummaryDetails } from "./RunConfigSummaryDetails";

export function RunConfigSummaryModal({
	hide,
	onClose,
	config,
}: {
	hide: boolean;
	onClose: () => void;
	config: DataServiceConfig;
}) {
	const { status } = useDataConfigRunStatus(config.id);
	return (
		<Modal large hide={hide} onClose={onClose} position="middle">
			<ModalTitle>
				<div className="flex items-center gap-2 justify-between w-full">
					<span>
						{config.source.name}{" "}
					</span>
					<StatusIndicator status={status} />
				</div>
			</ModalTitle>
			<ModalContent>
				<div className="flex flex-col gap-4 h-full">
					<div className="flex flex-col gap-2">
						<h6 className="text-lg font-bold">
							{i18n.t("Service Processing Overview")}
						</h6>
						<Suspense
							fallback={
								<div className="w-full h-full min-h-[400px] flex items-center justify-center">
									<CircularLoader small />
								</div>
							}
						>
							<RunConfigSummaryDetails config={config} />
						</Suspense>
					</div>
				</div>
			</ModalContent>
			<ModalActions>
				<ButtonStrip>
					<Button onClick={onClose}>{i18n.t("Dismiss")}</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
