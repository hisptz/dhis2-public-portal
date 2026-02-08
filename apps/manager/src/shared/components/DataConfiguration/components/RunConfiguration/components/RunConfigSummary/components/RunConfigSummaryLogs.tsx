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
import { DataServiceConfig } from "@packages/shared/schemas";

function ErrorSummary({ errorObject }: { errorObject?: Record<string, any> }) {
	if (!errorObject) {
		return null;
	}

	// Prefer explicit message
	const message = (errorObject.message ||
		errorObject.error ||
		errorObject.description) as string | undefined;

	// Conflicts may be present as an array
	const conflicts = Array.isArray(errorObject.conflicts)
		? (errorObject.conflicts as Array<{
				value?: string;
				object?: string;
				property?: string;
				errorCode?: string;
			}>)
		: undefined;

	// If single error-like object (no conflicts array), try to surface its known fields
	const isSingleError =
		!conflicts &&
		(errorObject.errorCode ||
			errorObject.value ||
			errorObject.property ||
			message);

	if (conflicts && conflicts.length > 0) {
		return (
			<div className="flex flex-col gap-8">
				{message && (
					<NoticeBox
						error
						title={i18n.t("Upload completed with conflicts")}
					>
						<span style={{ color: colors.grey700 }}>{message}</span>
					</NoticeBox>
				)}
				<div className="flex flex-col gap-4">
					<h6 className="text-base font-semibold">
						{i18n.t("Conflicts {{count}}", {
							count: conflicts.length,
						})}
					</h6>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{i18n.t("Error code")}</TableCell>
								<TableCell>{i18n.t("Value")}</TableCell>
								<TableCell>{i18n.t("Property")}</TableCell>
								<TableCell>{i18n.t("Object")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{conflicts.map((c, idx) => (
								<TableRow key={idx}>
									<TableCell>
										<div className="flex items-center gap-2">
											<span
												style={{
													color: colors.grey700,
												}}
											>
												{c.errorCode ?? "-"}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{c.value ?? "-"}
										</span>
									</TableCell>
									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{c.property ?? "-"}
										</span>
									</TableCell>
									<TableCell>
										<span style={{ color: colors.grey700 }}>
											{c.object ?? "-"}
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
			<NoticeBox error title={i18n.t("An error occurred")}>
				<div className="flex flex-col gap-1">
					{errorObject.errorCode && (
						<div>
							<strong>{i18n.t("Code")}:</strong>{" "}
							<span style={{ color: colors.grey700 }}>
								{String(errorObject.errorCode)}
							</span>
						</div>
					)}
					{errorObject.property && (
						<div>
							<strong>{i18n.t("Property")}:</strong>{" "}
							<span style={{ color: colors.grey700 }}>
								{String(errorObject.property)}
							</span>
						</div>
					)}
					{errorObject.value && (
						<div>
							<strong>{i18n.t("Value")}:</strong>{" "}
							<span style={{ color: colors.grey700 }}>
								{String(errorObject.value)}
							</span>
						</div>
					)}
					{message && (
						<div>
							<strong>{i18n.t("Message")}:</strong>{" "}
							<span style={{ color: colors.grey700 }}>
								{message}
							</span>
						</div>
					)}
				</div>
			</NoticeBox>
		);
	}

	// Fallback: show raw JSON, but in a styled container
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
	errorObject?: Record<string, unknown>;
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
	const config= useWatch<DataServiceConfig>();
	const queryClient = useQueryClient();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	if(!config || !config.id) {
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
	type:'metadata' | 'data';
	uploads?: string[];
	downloads?: string[];
	onComplete(): void;
}) {
	const config= useWatch<DataServiceConfig>();
	const queryClient = useQueryClient();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	if(!config || !config.id) {
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
	errorObject?: Record<string, unknown>;
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
