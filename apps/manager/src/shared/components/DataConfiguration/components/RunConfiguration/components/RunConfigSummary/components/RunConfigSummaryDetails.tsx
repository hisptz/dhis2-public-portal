import { useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { SimpleDataTable, SimpleDataTableColumn } from "@hisptz/dhis2-ui";
import {
	Button,
	SegmentedControl,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import { DataRunDetails, MetadataRunDetails} from "@/shared/components/DataConfiguration/components/RunList/hooks/data";
import {
	RunStatus,
	StatusIndicator,
} from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus";
import { DateTime } from "luxon";
import { capitalize, compact, isEmpty } from "lodash";
import {
	MultipleRetryButton,
	RunConfigSummaryLogs,
} from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigSummary/components/RunConfigSummaryLogs";
import { TaskDetails } from "@/shared/components/DataConfiguration/components/TaskDetails";

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
		label: i18n.t("Ignored items"),
		key: "ignored",
	},
	{
		label: i18n.t("Imported items"),
		key: "imported",
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

export function RunConfigSummaryDetails({ run, runType }: { run: MetadataRunDetails | DataRunDetails, runType: "metadata" | "data" }) {
	const [statusFilter, setStatusFilter] = useState<RunStatus | null>(null);
	const [type, setType] = useState<"download" | "upload">("download");
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
				return downloads?.map((summary) => ({
					...summary,
					id: summary.uid!,
					count: summary.count ?? "",
					startedAt: DateTime.fromISO(summary.startedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					),
					finishedAt: DateTime.fromISO(summary.finishedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					),
					timeTaken: calculateTimeTaken(
						summary.startedAt,
						summary.finishedAt,
					),
					statusComponent: (
						<StatusIndicator status={summary.status} />
					),
					details: <TaskDetails task={summary} type="download" />,
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
				return uploads?.map((summary) => ({
					...summary,
					id: summary.uid!,
					statusComponent: (
						<StatusIndicator status={summary.status} />
					),
					startedAt: DateTime.fromISO(summary.startedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					),
					finishedAt: DateTime.fromISO(summary.finishedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					),
					timeTaken: calculateTimeTaken(
						summary.startedAt,
						summary.finishedAt,
					),
					imported: summary.imported ?? "",
					ignored: summary.ignored ?? "",
					updated: summary.updated ?? "",
					details: <TaskDetails task={summary} type="upload" />,
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
				return downloadColumns;
			case "upload":
				return uploadColumns;
		}
	}, [type]);

	const filteredRows = useMemo(() => {
		return rows?.filter((row) => {
			if (!statusFilter) return true;
			return row.status === statusFilter;
		});
	}, [rows, statusFilter]);

	return (
		<div className="h-[500px] flex flex-col gap-4">
			<div>
				<SegmentedControl
					selected={type}
					onChange={({ value }) => {
						setType(value as "download" | "upload");
					}}
					options={[
						{
							label: i18n.t("Download"),
							value: "download",
						},
						{
							label: i18n.t("Upload"),
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
					selectedRows={[...selectedDownloads, ...selectedUploads]}
					onRowSelect={(selected) => {
						if (type === "download") {
							setSelectedDownloads((prevState) =>
								compact([...prevState, ...selected]),
							);
						}
						if (type === "upload") {
							setSelectedUploads((prevState) =>
								compact([...prevState, ...selected]),
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
					rows={filteredRows}
					columns={columns}
				/>
			</div>
		</div>
	);
}
