import React, { useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { IconChevronDown16, IconChevronUp16 } from "@dhis2/ui";
import { DateTime } from "luxon";
import {
	RunStatus,
	StatusIndicator,
} from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus";

export interface UploadTaskDetailsData {
	uid: string;
	startedAt: string;
	finishedAt: string;
	status: RunStatus | null;
	error?: string;
	errorObject?: Record<string, unknown>;
	ignored?: number;
	imported?: number;
	updated?: number;
}

export function UploadTaskDetails({
	task,
	title,
}: {
	task: UploadTaskDetailsData;
	title?: string;
}) {
	const [showError, setShowError] = useState(false);
	const startedAtFmt = useMemo(
		() =>
			task?.startedAt
				? DateTime.fromISO(task.startedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					)
				: "-",
		[task?.startedAt],
	);

	const finishedAtFmt = useMemo(
		() =>
			task?.finishedAt
				? DateTime.fromISO(task.finishedAt).toFormat(
						"yyyy-MM-dd HH:mm:ss",
					)
				: "-",
		[task?.finishedAt],
	);

	const timeTaken = useMemo(() => {
		if (!task?.startedAt || !task?.finishedAt) return "-";
		const started = DateTime.fromISO(task.startedAt);
		const finished = DateTime.fromISO(task.finishedAt);
		const duration = finished.diff(started, ["seconds"]).normalize();
		return duration.toHuman({
			maximumFractionDigits: 0,
			notation: "compact",
			compactDisplay: "short",
		});
	}, [task?.startedAt, task?.finishedAt]);

	return (
		<div className="w-full">
			<div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
				<div className="grid grid-cols-2 gap-4">
					<Detail
						label={i18n.t("Status")}
						value={
							<StatusIndicator
								status={task.status as RunStatus}
							/>
						}
					/>
					<Detail label={i18n.t("Task ID")} value={task.uid} />
					<Detail label={i18n.t("Started at")} value={startedAtFmt} />
					<Detail
						label={i18n.t("Finished at")}
						value={finishedAtFmt}
					/>
					<Detail label={i18n.t("Time taken")} value={timeTaken} />
					<div className="grid grid-cols-3 gap-4 col-span-2">
						<Detail
							label={i18n.t("Imported")}
							value={num(task.imported)}
						/>
						<Detail
							label={i18n.t("Updated")}
							value={num(task.updated)}
						/>
						<Detail
							label={i18n.t("Ignored")}
							value={num(task.ignored)}
						/>
					</div>
				</div>

				{(task.error || task.errorObject) && (
					<div className="flex flex-col gap-2">
						<button
							type="button"
							className="flex items-center gap-2 text-sm text-blue-700 hover:underline self-start"
							onClick={() => setShowError((s) => !s)}
						>
							{showError ? (
								<IconChevronUp16 />
							) : (
								<IconChevronDown16 />
							)}
							{i18n.t("Show error details")}
						</button>
						{showError && (
							<div className="flex flex-col gap-2">
								{task.error && (
									<pre
										style={{ fontSize: 12 }}
										className="bg-gray-50 p-3 border-gray-200 rounded border overflow-auto text-sm whitespace-pre-wrap max-h-48"
									>
										{task.error}
									</pre>
								)}
								{task.errorObject && (
									<pre
										style={{ fontSize: 12 }}
										className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48 w-full"
									>
										{JSON.stringify(
											task.errorObject,
											null,
											2,
										)}
									</pre>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function num(value?: number) {
	return typeof value === "number" ? String(value) : "-";
}

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1">
			<div className="text-xs uppercase tracking-wide text-gray-600">
				{label}
			</div>
			<div className="text-sm text-gray-900">{value ?? "-"}</div>
		</div>
	);
}
