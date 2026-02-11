import { useBoolean } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	colors,
	Divider,
	IconError24,
	IconRedo16,
	IconTerminalWindow16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	NoticeBox,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
} from "@dhis2/ui";
import { useAlert, useDataMutation } from "@dhis2/app-runtime";
import { useQueryClient } from "@tanstack/react-query";
import { useWatch } from "react-hook-form";
import { DataServiceConfig, ErrorObject } from "@packages/shared/schemas";

function ErrorSummary({ errorObject }: { errorObject?: ErrorObject }) {
	if (!errorObject) {
		return null;
	}

	const { status, message, httpStatus, httpStatusCode, response } = errorObject;

	const errorReports =
		response?.typeReports
			.flatMap(tr => tr.objectReports ?? [])
			.flatMap(or => or.errorReports ?? []) ?? [];

	const isSingleError = !response && status && message;

	if (errorReports.length > 0) {
		return (
			<div className="flex flex-col gap-8">
				<NoticeBox
					error={status === "ERROR"}
					warning={status === "WARNING"}
					title={i18n.t("Upload completed with errors")}
				>
					<span style={{ color: colors.grey700 }}>
						{message}
					</span>
				</NoticeBox>

				<div className="flex flex-col gap-4">
					<h6 className="text-base font-semibold">
						{i18n.t("Errors {{count}}", {
							count: errorReports.length,
						})}
					</h6>

					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{i18n.t("Error code")}</TableCell>
								<TableCell>{i18n.t("Message")}</TableCell>
								<TableCell>{i18n.t("Properties")}</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{errorReports.map((e, idx) => (
								<TableRow key={idx}>
									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{e.errorCode ?? "-"}
										</span>
									</TableCell>

									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{e.message}
										</span>
									</TableCell>

									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{e.errorProperties.join(', ') ?? "-"}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}

	if (isSingleError) {
		return (
			<NoticeBox
				error={status === "ERROR"}
				warning={status === "WARNING"}
				title={i18n.t("An error occurred")}
			>
				<div className="flex flex-col gap-1">
					<div>
						<strong>{i18n.t("Status")}:</strong>{" "}
						<span style={{ color: colors.grey700 }}>
							{status}
						</span>
					</div>

					<div>
						<strong>{i18n.t("HTTP Status")}:</strong>{" "}
						<span style={{ color: colors.grey700 }}>
							{httpStatus} ({httpStatusCode})
						</span>
					</div>

					<div>
						<strong>{i18n.t("Message")}:</strong>{" "}
						<span style={{ color: colors.grey700 }}>
							{message}
						</span>
					</div>
				</div>
			</NoticeBox>
		);
	}

	//Fallback: show raw JSON, but in a styled container
	return (
		<div className="flex flex-col gap-2">
			{message && (
				<NoticeBox error title={i18n.t("An error occurred")}>
					<span style={{ color: colors.grey700 }}>{message}</span>
				</NoticeBox>
			)}
			<Divider />
			<code className="whitespace-pre-wrap overflow-auto w-full border border-gray-200 rounded-md p-3 bg-gray-50 text-sm">
				{JSON.stringify(errorObject, null, 2)}
			</code>
		</div>
	);
}

function RunConfigSummaryModal({
	error,
	errorObject,
	hide,
	onClose,
}: {
	error: string;
	errorObject?: ErrorObject;
	hide: boolean;
	onClose: () => void;
}) {
	return (
		<Modal hide={hide} onClose={onClose} position="middle">
			<ModalTitle>
				<div className="flex items-center gap-2">
					<IconError24 />
					<span>{i18n.t("Error logs")}</span>
				</div>
			</ModalTitle>
			<ModalContent>
				<div className="h-full w-full flex flex-col gap-4">
					{error && <NoticeBox error>{error}</NoticeBox>}
					<ErrorSummary errorObject={errorObject} />
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

function generateRetryMutation({
	runId,
	configId,
	type
}: {
	runId: string;
	configId: string;
	type: 'metadata' | 'data';
}) {
	return {
		type: "create" as const,
		resource: `routes/data-service/run/${configId}/${type}/${runId}/retry`,
		data: ({ data }: Record<string, unknown>) => data,
	};
}

function RetryButton({
	runId,
	taskId,
	runType,
	type,
}: {
	runId: string;
	taskId: string;
	runType: "metadata" | "data";
	type: "download" | "upload";
}) {
	const config = useWatch<DataServiceConfig>();
	const queryClient = useQueryClient();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	if (!config || !config.id) {
		return;
	}

	const [mutate, { loading }] = useDataMutation(
		generateRetryMutation({ runId, configId: config.id, type: runType }),
		{
			onComplete: () => {
				show({
					message: i18n.t("Retry request sent successfully"),
					type: { success: true },
				});
				queryClient.invalidateQueries({
					queryKey: [config.id, "runs", runId],
				});
				queryClient.invalidateQueries({
					queryKey: [config.id, "runs", runId, "status"],
				});
			},
			onError: (error) => {
				show({
					message: `${i18n.t("Error retrying request")}: ${error.message}`,
					type: { critical: true },
				});
			},
		},
	);

	return (
		<Tooltip content={i18n.t("Retry")}>
			<Button
				onClick={() => {
					if (type === "download") {
						mutate({
							data: {
								downloads: [
									{
										id: taskId,
									},
								],
							},
						});
					}
					if (type === "upload") {
						mutate({
							data: {
								uploads: [
									{
										id: taskId,
									},
								],
							},
						});
					}
				}}
				loading={loading}
				small
				icon={<IconRedo16 />}
			/>
		</Tooltip>
	);
}

export function MultipleRetryButton({
	runId,
	type,
	uploads,
	downloads,
	onComplete,
}: {
	runId: string;
	type: 'metadata' | 'data';
	uploads?: string[];
	downloads?: string[];
	onComplete(): void;
}) {
	const config = useWatch<DataServiceConfig>();
	const queryClient = useQueryClient();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	if (!config || !config.id) {
		return;
	}


	const [mutate, { loading }] = useDataMutation(
		generateRetryMutation({ runId, configId: config.id!, type }),
		{
			onComplete: async () => {
				show({
					message: i18n.t("Retry request sent successfully"),
					type: { success: true },
				});
				queryClient.invalidateQueries({
					queryKey: [config.id, "runs", runId],
				});
				queryClient.invalidateQueries({
					queryKey: [config.id, "runs", runId, "status"],
				});
				onComplete();
			},
			onError: (error) => {
				show({
					message: `${i18n.t("Error retrying request")}: ${error.message}`,
					type: { critical: true },
				});
			},
		},
	);

	return (
		<Tooltip content={i18n.t("Retry")}>
			<Button
				onClick={() => {
					mutate({
						data: {
							downloads: downloads?.map((id) => ({ id })),
							uploads: uploads?.map((id) => ({ id })),
						},
					});
				}}
				loading={loading}
				small
				icon={<IconRedo16 />}
			>
				{i18n.t("Retry")}
			</Button>
		</Tooltip>
	);
}

export function RunConfigSummaryLogs({
	error,
	errorObject,
	runId,
	type,
	runType,
	taskId,
}: {
	error?: string;
	errorObject?: ErrorObject;
	runId: string;
	taskId: string;
	runType: "metadata" | "data";
	type: "download" | "upload";
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	if (!error) {
		return null;
	}

	return (
		<ButtonStrip>
			{!hide && (
				<RunConfigSummaryModal
					hide={hide}
					onClose={onHide}
					error={error}
					errorObject={errorObject}
				/>
			)}
			<Tooltip content={i18n.t("Show error logs")}>
				<Button
					small
					onClick={onShow}
					icon={<IconTerminalWindow16 />}
				/>
			</Tooltip>
			<RetryButton runId={runId} runType={runType} taskId={taskId} type={type} />
		</ButtonStrip>
	);
}
