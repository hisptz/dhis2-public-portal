import { useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { SimpleDataTable, SimpleDataTableColumn } from "@hisptz/dhis2-ui";
import {
	Button,
	SegmentedControl,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import { DataDownloadJob, DataRun, DataRunDetails, DataUploadJob, MetadataDownloadJob, MetadataRunDetails, MetadataUploadJob } from "@/shared/components/DataConfiguration/components/RunList/hooks/data";
import {
	RunStatus,
	StatusIndicator,
} from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus";
import { DateTime } from "luxon";
import { capitalize, isEmpty } from "lodash";
import {
	MultipleRetryButton,
	RunConfigSummaryLogs,
} from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigSummary/components/RunConfigSummaryLogs";
import { TaskDetails } from "@/shared/components/DataConfiguration/components/TaskDetails";
import { formatDateTime } from "@/shared/hooks/config";
import { useSearch, useNavigate } from "@tanstack/react-router";

const downloadColumns: SimpleDataTableColumn[] = [
	{
		label: i18n.t("Started at"),
		key: "startedAt",
	},
	{
		label: i18n.t("Finished at"),
		key: "finishedAt",
	},
	{
		label: i18n.t("Time taken"),
		key: "timeTaken",
	},
	{
		label: i18n.t("Items"),
		key: "count",
	},
	{
		label: i18n.t("Type"),
		key: "type",
	},
	{
		label: i18n.t("Status"),
		key: "statusComponent",
	},
	{
		label: i18n.t("Errors"),
		key: "errors",
	},
	{
		label: i18n.t("Details"),
		key: "details",
	},
];

const uploadColumns: SimpleDataTableColumn[] = [
	{
		label: i18n.t("Started at"),
		key: "startedAt",
	},
	{
		label: i18n.t("Finished at"),
		key: "finishedAt",
	},
	{
		label: i18n.t("Time taken"),
		key: "timeTaken",
	},
	{
		label: i18n.t("Imported items"),
		key: "imported",
	},
	{
		label: i18n.t("Updated items"),
		key: "updated",
	},
	{
		label: i18n.t("Ignored items"),
		key: "ignored",
	},
	{
		label: i18n.t("Deleted items"),
		key: "deleted",
	},
	{
		key: "statusComponent",
		label: i18n.t("Status"),
	},
	{
		label: i18n.t("Errors"),
		key: "errors",
	},
	{
		label: i18n.t("Details"),
		key: "details",
	},
];

function calculateTimeTaken(startedAt?: string, finishedAt?: string) {
	if (!startedAt || !finishedAt) return "";

	const started = DateTime.fromISO(startedAt);
	const finished = DateTime.fromISO(finishedAt);
	const duration = finished.diff(started, ["seconds"]).normalize();
	return duration.toHuman({
		maximumFractionDigits: 0,
		notation: "compact",
		compactDisplay: "short",
	});
}



export function RunConfigSummaryDetails({ run, runType, downloadsPagination, uploadsPagination }: {
	run: MetadataRunDetails | DataRunDetails, runType: "metadata" | "data", downloadsPagination: {
		page: number;
		pageSize: number;
		total: number;
		pageCount: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	}, uploadsPagination: {
		page: number;
		pageSize: number;
		total: number;
		pageCount: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	}
}) {
	const [statusFilter, setStatusFilter] = useState<RunStatus | null>(null);
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const [type, setType] = useState<"download" | "upload">(
		(search.type as unknown as "download" | "upload") ?? "download"
	);
	const [selectedDownloads, setSelectedDownloads] = useState<string[]>([]);
	const [selectedUploads, setSelectedUploads] = useState<string[]>([]);

	const { uploads, downloads } = useMemo(() => {
		return {
			uploads: run.uploads,
			downloads: run.downloads,
		};
	}, [run.uploads, run.downloads]);

	const rows = useMemo(() => {
		switch (type) {
			case "download":
				return downloads?.map((summary: MetadataDownloadJob | DataDownloadJob) => ({
					...summary,
					id: summary.uid!,
					count: runType === 'metadata' ? (summary as MetadataDownloadJob).items.length ?? 0 : (summary as DataDownloadJob).count ?? 0,
					type: runType === 'metadata' ? capitalize((summary as MetadataDownloadJob).type.toString() ?? "") : "",
					startedAt: formatDateTime(summary.startedAt),
					finishedAt: formatDateTime(summary.finishedAt),
					timeTaken: calculateTimeTaken(
						summary.startedAt,
						summary.finishedAt,
					),
					statusComponent: (
						<StatusIndicator status={String(summary.status) as RunStatus} />
					),
					details: <TaskDetails task={summary} type="download" runType={runType} runID={run.uid} />,
					errors: (
						<RunConfigSummaryLogs
							type="download"
							runType={runType}
							runId={run.uid}
							taskId={summary.uid}
							error={summary.error}
							errorObject={summary.errorObject}
						/>
					),
				}));
			case "upload":
				return uploads?.map((summary: MetadataUploadJob | DataUploadJob) => ({
					...summary,
					id: summary.uid!,
					statusComponent: (
						<StatusIndicator status={String(summary.status) as RunStatus} />
					),
					startedAt: formatDateTime(summary.startedAt),
					finishedAt: formatDateTime(summary.finishedAt),
					timeTaken: calculateTimeTaken(
						summary.startedAt,
						summary.finishedAt,
					),
					imported: (summary as MetadataUploadJob).summary?.response.stats.created ?? (summary as DataUploadJob).imported ?? "",
					ignored: (summary as MetadataUploadJob).summary?.response.stats.ignored ?? (summary as DataUploadJob).ignored ?? "",
					updated: (summary as MetadataUploadJob).summary?.response.stats.updated ?? (summary as DataUploadJob).updated ?? "",
					deleted: (summary as MetadataUploadJob).summary?.response.stats.deleted ?? (summary as DataUploadJob).deleted ?? "",
					details: <TaskDetails task={summary} type="upload" runType={runType} runID={run.uid} />,
					errors: (
						<RunConfigSummaryLogs
							type="upload"
							runType={runType}
							runId={run.uid}
							taskId={summary.uid}
							error={summary.error}
							errorObject={summary.errorObject}
						/>
					),
				}));
		}
	}, [uploads, type, downloads]);

	const columns = useMemo(() => {
		switch (type) {
			case "download":
				return runType === "metadata"
					? downloadColumns
					: downloadColumns.filter(col => col.key !== "type");
			case "upload":
				return uploadColumns;
			default:
				return [];
		}
	}, [type, runType]);

	const filteredRows = useMemo(() => {
		return rows?.filter((row) => {
			if (!statusFilter) return true;
			return String(row.status) === statusFilter;
		});
	}, [rows, statusFilter]);

	const isRetryable = (rowId: string) => {
		const row = rows?.find(r => r.id === rowId);
		return String(row?.status) === "FAILED";
	};

	return (
		<div className="h-[500px] flex flex-col gap-4">
			<div>
				<SegmentedControl
					selected={type}
					onChange={({ value }) => {
						const newType = value as "download" | "upload";
						setType(newType);
						(navigate as (opts: { search: (prev: Record<string, unknown>) => Record<string, unknown>; replace: boolean }) => void)({ search: (prev) => ({ ...prev, type: newType }), replace: true });
					}}
					options={[
						{
							label: i18n.t(`${runType === "data" ? "Data" : "Metadata"} download`),
							value: "download",
						},
						{
							label: i18n.t(
								runType === "data"
									? (run as DataRun).isDelete
										? "Data Deletion"
										: "Data upload"
									: "Metadata upload"
							),
							value: "upload",
						},
					]}
				/>
			</div>
			<div className="max-w-[300px]">
				<SingleSelectField
					selected={statusFilter ?? undefined}
					placeholder={i18n.t("Filter by status")}
					clearable
					onChange={({ selected }) => {
						setStatusFilter(selected as RunStatus | null);
					}}
				>
					{["QUEUED", "INIT", "DONE", "FAILED"].map((status) => (
						<SingleSelectOption
							label={capitalize(status)}
							key={status}
							value={status}
						/>
					))}
				</SingleSelectField>
			</div>
			{!isEmpty(selectedDownloads) || !isEmpty(selectedUploads) ? (
				<div className="flex items-center gap-2 border border-green-700 bg-green-50 p-2 rounded-xs">
					<span className="text-sm">
						{!isEmpty(selectedDownloads) &&
							i18n.t("{{count}} download items selected", {
								count: selectedDownloads.length,
							})}{" "}
						{!isEmpty(selectedUploads) &&
							i18n.t("{{count}} upload items selected", {
								count: selectedUploads.length,
							})}
					</span>
					<MultipleRetryButton
						uploads={selectedUploads}
						downloads={selectedDownloads}
						type={runType}
						runId={run.uid}
						onComplete={() => {
							setSelectedDownloads([]);
							setSelectedUploads([]);
						}}
					/>
					<Button
						onClick={() => {
							setSelectedDownloads([]);
							setSelectedUploads([]);
						}}
						small
					>
						{i18n.t("Clear selection")}
					</Button>
				</div>
			) : null}
			<div className="flex-1 w-full">
				<SimpleDataTable
					selectable
					selectedRows={[
						...selectedDownloads.filter(isRetryable),
						...selectedUploads.filter(isRetryable),
					]}
					onRowSelect={(selected) => {
						const retryable = selected.filter(id => isRetryable(id));

						if (type === "download") {
							setSelectedDownloads(prev =>
								Array.from(new Set([...prev, ...retryable]))
							);
						}

						if (type === "upload") {
							setSelectedUploads(prev =>
								Array.from(new Set([...prev, ...retryable]))
							);
						}
					}}
					onRowDeselect={(selected) => {
						if (type === "download") {
							setSelectedDownloads((prevState) => {
								return prevState.filter(
									(id) => !selected.includes(id),
								);
							});
						}
						if (type === "upload") {
							setSelectedUploads((prevState) => {
								return prevState.filter(
									(id) => !selected.includes(id),
								);
							});
						}
					}}
					tableProps={{
						scrollHeight: "500px",
					}}
					emptyLabel={
						statusFilter
							? i18n.t(
								"There are no {{type}} with the status {{status}}",
								{
									type,
									status: capitalize(statusFilter),
								},
							)
							: i18n.t("There are no {{type}} for this run", {
								type,
							})
					}
					pagination={type == 'download' ? downloadsPagination : uploadsPagination}
					rows={filteredRows}
					columns={columns}
				/>
			</div>
		</div>
	);
}
