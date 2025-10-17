import React, { useMemo, useState } from "react";
import { useRunConfigSummary } from "../hooks/summary";
import {
	DataServiceConfig,
} from "@packages/shared/schemas";
import CountUp from "react-countup";
import {
	CircularLoader,
	SegmentedControl,

} from "@dhis2/ui";


export function RunConfigSummaryDetails({
	config,
}: {
	config: DataServiceConfig;
}) {
	const [type, setType] = useState<"download" | "upload">("download");
	const { summaries, isLoading, isError, error } = useRunConfigSummary(
		config.id,
	);

	const rows: any = useMemo(() => {
		switch (type) {
			case "download":
				return summaries?.download;
			case "upload":
				return summaries?.upload;
			default:
				return {};
		}
	}, [summaries, type]);

	if (isError) return <div>{error?.message ?? "Unknown error"}</div>;
	if (false) return <CircularLoader small />;

	const cards = [
		// { label: "Total Processes", value: rows?.messages },
		{ label: "Pending Processes", value: rows?.messages_ready },
		{ label: "Currently running", value: rows?.messages_unacknowledged },
		{ label: "Failed", value: rows?.dlq_messages },
	];

	return (
		<div className="flex flex-col gap-4">
			<div>
				<SegmentedControl
					selected={type}
					onChange={({ value }) => setType(value as "download" | "upload")}
					options={[
						{ label: "Metadata", value: "download" },
						{ label: "Data", value: "upload" },
						{ label: "Deletion", value: "upload" },

					]}
				/>
			</div>

			<div className="flex gap-4">
				{cards.map((card) => (
					<div
						key={card.label}
						className="flex-1 p-4 bg-gray-100 rounded flex flex-col items-center justify-center"
					>
						<span className="text-gray-500">{card.label}</span>
						<CountUp
							end={card.value}
							duration={1.5}
							redraw={true}
							className="text-xl"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
