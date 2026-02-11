import {
	Button,
	ButtonStrip,
	CircularLoader,
	IconError24,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RunConfigSummaryDetails } from "./RunConfigSummaryDetails";
import { useRunDetails } from "@/shared/components/DataConfiguration/components/RunList/RunDetails/hooks/data";
import { FetchError } from "@dhis2/app-runtime";
import { DateTime } from "luxon";
import { RunStatus } from "@/shared/components/DataConfiguration/components/RunStatus";

function Content({ runId, type }: { runId: string, type: "metadata" | "data" }) {
	const { error, isLoading, isError, data } = useRunDetails({runId, type});
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-[600px] min-w-[700px]">
				<CircularLoader small />
			</div>
		);
	}
	if (isError) {
		return (
			<div className="flex items-center justify-center h-full min-h-[600px] min-w-[700px]">
				<IconError24 />
				<span>{(error as FetchError)!.message}</span>
			</div>
		);
	}

	return (
		<>
			<ModalTitle>
				<div className="flex items-center gap-2 w-full justify-between">
					<span>
						{i18n.t("Run summary ")} -{" "}
						{data?.startedAt
							? DateTime.fromISO(data?.startedAt).toFormat(
									"yyyy-MM-dd HH:mm:ss",
								)
							: "N/A"}
					</span>
					<RunStatus runId={runId} type={type} />
				</div>
			</ModalTitle>
			<ModalContent>
				<div className="flex flex-col gap-4 h-full min-h-[600px] min-w-[700px]">
					<div className="flex flex-col gap-2">
						<h6 className="text-lg font-bold">
							{i18n.t("Summaries")}
						</h6>
						{data && <RunConfigSummaryDetails run={data} runType={type} />}
					</div>
				</div>
			</ModalContent>
		</>
	);
}

export function RunConfigSummaryModal({
	hide,
	onClose,
	runId,
	type
}: {
	hide: boolean;
	onClose: () => void;
	runId: string;
	type: "metadata" | "data"
}) {
	return (
		<Modal fluid hide={hide} onClose={onClose} position="middle">
			<Content runId={runId} type={type} />
			<ModalActions>
				<ButtonStrip>
					<Button onClick={onClose}>{i18n.t("Dismiss")}</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
