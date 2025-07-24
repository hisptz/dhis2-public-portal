import React, { useMemo, useState } from "react";
import { useRunConfigSummary } from "../hooks/summary";
import {
	DataServiceConfig,
	ProcessSummary,
} from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { SimpleDataTable, SimpleDataTableColumn } from "@hisptz/dhis2-ui";
import {
	CircularLoader,
	SegmentedControl,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { DateTime } from "luxon";
import { RunConfigSummaryLogs } from "./RunConfigSummaryLogs";
import { startCase } from "lodash";

const downloadColumns: SimpleDataTableColumn[] = [
	{
		label: i18n.t("Timestamp"),
		key: "timestamp",
	},
	{
		label: i18n.t("Status"),
		key: "status",
	},
	{
		label: i18n.t("Data Items"),
		key: "dataItems",
	},
	{
		label: i18n.t("Periods"),
		key: "periods",
	},
	{
		key: "details",
		label: i18n.t("Error logs"),
	},
];

const uploadColumns: SimpleDataTableColumn[] = [
	{
		label: i18n.t("Timestamp"),
		key: "timestamp",
	},
	{
		label: i18n.t("Status"),
		key: "status",
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
		key: "details",
		label: i18n.t("Error logs"),
	},
];

export function RunConfigSummaryDetails({
	config,
}: {
	config: DataServiceConfig;
}) {
	const [activeFilter, setActiveFilter] = useState<
		"SUCCESS" | "FAILED" | null
	>(null);
	const { summaries, isLoading, isError, error } = useRunConfigSummary(
		config.id,
	);
	const [type, setType] = useState<"download" | "upload">("download");

	const rows = useMemo(() => {
		switch (type) {
			case "download":
				return summaries?.download?.map((summary) => ({
					...summary,
					id: summary.id!,
					periods: summary.periods
						?.map(
							(periodId) =>
								PeriodUtility.getPeriodById(periodId)?.name,
						)
						.join(", "),
					dataItems: summary.dataItems?.length,
					timestamp: summary.timestamp
						? DateTime.fromISO(
								summary.timestamp as string,
							).toFormat(`yyyy-MM-dd HH:mm:ss`)
						: undefined,
					details: summary.error ? (
						<RunConfigSummaryLogs
							summary={summary as ProcessSummary}
						/>
					) : null,
				}));
			case "upload":
				return summaries?.upload?.map((summary) => ({
					...summary,
					id: summary.filename,
					imported: summary.importSummary?.imported,
					ignored: summary.importSummary?.ignored,
					timestamp: summary.timestamp
						? DateTime.fromISO(
								summary.timestamp as string,
							).toFormat(`yyyy-MM-dd HH:mm:ss`)
						: undefined,
					details: summary.error ? (
						<RunConfigSummaryLogs
							summary={summary as ProcessSummary}
						/>
					) : null,
				}));
		}
	}, [summaries, type]);

	const filteredRows = useMemo(() => {
		if (!rows) return [];
		if (!activeFilter) return rows;
		return rows.filter((row) => {
			switch (activeFilter) {
				case "SUCCESS":
					return row.status === "SUCCESS";
				case "FAILED":
					return row.status === "FAILED";
			}
		});
	}, [rows, activeFilter]);

	const columns = useMemo(() => {
		switch (type) {
			case "download":
				return downloadColumns;
			case "upload":
				return uploadColumns;
		}
	}, [type]);

	if (isError) {
		return (
			<div className="w-full h-full min-h-[400px]">
				<span>{error?.message ?? i18n.t("Unknown error")}</span>
			</div>
		);
	}

	if (isLoading)
		return (
			<div className="w-full h-full min-h-[500px] flex items-center justify-center">
				<CircularLoader small />
			</div>
		);

	return (
		<div className="h-[500px] flex flex-col gap-4">
			<div>
				<SegmentedControl
					selected={type}
					onChange={({ value }) => {
						setType(value as "download" | "upload");
						setActiveFilter(null);
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
					clearable
					label={i18n.t("Filter")}
					placeholder={i18n.t("Filter summary")}
					selected={(activeFilter as string) || undefined}
					onChange={({ selected }) =>
						selected
							? setActiveFilter(
									selected as "SUCCESS" | "FAILED" | null,
								)
							: setActiveFilter(null)
					}
				>
					{["SUCCESS", "FAILED"].map((status) => (
						<SingleSelectOption
							label={startCase(
								status.toLowerCase() as "success" | "failed",
							)}
							value={status}
						/>
					))}
				</SingleSelectField>
			</div>
			<div className="flex-1 w-full max-h-[340px]">
				<SimpleDataTable
					tableProps={{
						scrollHeight: "340px",
					}}
					emptyLabel={i18n.t("There are no summary entries ")}
					rows={filteredRows}
					columns={columns}
				/>
			</div>
		</div>
	);
}
