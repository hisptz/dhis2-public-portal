import { useBoolean } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	IconTerminalWindow16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	Tooltip,
} from "@dhis2/ui";
import React, { useMemo } from "react";
import { ProcessSummary } from "@packages/shared/schemas";

function RunConfigSummaryModal({
	summary,
	hide,
	onClose,
}: {
	summary: ProcessSummary;
	hide: boolean;
	onClose: () => void;
}) {
	const error = useMemo(() => {
		const errorLogs = summary.error;
		if (!errorLogs) {
			return;
		}
		try {
			return JSON.parse(errorLogs);
		} catch (e) {
			return errorLogs;
		}
	}, [summary]);

	return (
		<Modal hide={hide} onClose={onClose} position="middle" small>
			<ModalTitle>{i18n.t("Error logs")}</ModalTitle>
			<ModalContent>
				<div className="h-[400px] overflow-auto w-full border-2 border-gray-200 rounded-md p-2 bg-gray-50 text-sm">
					<code>{error.toString()}</code>
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

export function RunConfigSummaryLogs({ summary }: { summary: ProcessSummary }) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<RunConfigSummaryModal
					hide={hide}
					onClose={onHide}
					summary={summary}
				/>
			)}
			<Tooltip content={i18n.t("Show error logs")}>
				<Button
					small
					onClick={onShow}
					icon={<IconTerminalWindow16 />}
				/>
			</Tooltip>
		</>
	);
}
