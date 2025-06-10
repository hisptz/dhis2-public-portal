import React, { useState } from "react";
import { Divider } from "@dhis2/ui";
import { ImportSection } from "./components/ImportSection";
import { ExportSection } from "./components/ExportSection";
import { LogSection } from "./components/LogSection";
import { LogEntry } from "./utils/configurationUtils";

export function ConfigurationPage() {
	const [logs, setLogs] = useState<LogEntry[]>([]);

	return (
		<div className="p-4 flex flex-col gap-8 h-full">
			<div className="flex flex-col">
				<ExportSection setLogs={setLogs} />
				<Divider dense />
			</div>
			<div className="flex flex-col">
				<ImportSection setLogs={setLogs} />
				<Divider dense />
			</div>
			<LogSection logs={logs} />
		</div>
	);
}
