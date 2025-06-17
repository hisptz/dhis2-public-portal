import { NoticeBox } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React, { RefObject, useRef } from "react";
import { LogEntry } from "../utils/configurationUtils";
import { useResizeObserver } from "usehooks-ts";

interface LogSectionProps {
	logs: LogEntry[];
}

export const LogSection = ({ logs }: LogSectionProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const { height } = useResizeObserver<HTMLDivElement>({
		ref: ref as RefObject<HTMLDivElement>,
	});

	return (
		<div ref={ref} className="flex-1">
			<h3 className="text-base mb-2">{i18n.t("Logs")}</h3>
			<div
				style={{ height: (height ?? 0) - 32 }}
				className="overflow-y-auto border border-gray-300 p-2 rounded bg-gray-50"
			>
				{logs.length === 0 && (
					<p className="text-gray-600 italic">
						{i18n.t(
							"No logs yet. Perform an action to see logs here.",
						)}
					</p>
				)}
				{logs.map((log, index) => (
					<NoticeBox
						key={`${log.timestamp}-${index}`}
						error={log.type === "error"}
						valid={log.type === "success"}
						warning={log.type === "warning"}
						title={
							log.type === "info-low"
								? i18n.t("Detail")
								: i18n.t(
										log.type.charAt(0).toUpperCase() +
											log.type.slice(1),
								  )
						}
						className={index > 0 ? "mt-2" : ""}
					>
						{`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`}
					</NoticeBox>
				))}
			</div>
		</div>
	);
};
