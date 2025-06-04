import { Button, IconArrowDown16 } from "@dhis2/ui";
import React, { useCallback, useState } from "react";
import JSZip from "jszip";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import {
	AppModule,
	ModuleType,
	StaticModule,
	StaticModuleConfig,
} from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { LogEntry, useConfiguration } from "../utils/configurationUtils";

interface ExportSectionProps {
	setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export const ExportSection = ({ setLogs }: ExportSectionProps) => {
	const { getKeysInNamespace, getValue, addLog } = useConfiguration();
	const [loading, setLoading] = useState(false);

	const handleExport = useCallback(async () => {
		setLogs([]);
		setLoading(true);
		addLog(setLogs)("Export process started...", "info");
		const zip = new JSZip();
		const exportedStaticNamespaces = new Set<string>();

		try {
			for (const namespace of Object.values(DatastoreNamespaces)) {
				addLog(setLogs)(`Exporting namespace: ${namespace}`, "info");
				if (namespace === DatastoreNamespaces.MAIN_CONFIG) {
					const data = {};
					for (const key of Object.values(DatastoreKeys)) {
						const value = await getValue(
							namespace,
							key,
							addLog(setLogs),
						);
						if (value) data[key] = value;
					}
					zip.file(
						`${namespace}.json`,
						JSON.stringify(data, null, 2),
					);
				} else {
					const keys = await getKeysInNamespace(
						namespace,
						addLog(setLogs),
					);
					const items: any[] = [];
					for (const key of keys) {
						const item = await getValue(
							namespace,
							key,
							addLog(setLogs),
						);
						if (item) {
							items.push(item);
							if (
								namespace === DatastoreNamespaces.MODULES &&
								(item as AppModule).type ===
									ModuleType.STATIC &&
								(
									(item as AppModule)
										.config as StaticModuleConfig
								)?.namespace
							) {
								const staticNamespace = (
									(item as StaticModule)
										.config as StaticModuleConfig
								).namespace;
								if (
									!exportedStaticNamespaces.has(
										staticNamespace,
									)
								) {
									const staticKeys = await getKeysInNamespace(
										staticNamespace,
										addLog(setLogs),
									);
									const staticItems = await Promise.all(
										staticKeys.map((sKey) =>
											getValue(
												staticNamespace,
												sKey,
												addLog(setLogs),
											),
										),
									);
									zip.file(
										`${staticNamespace}.json`,
										JSON.stringify(
											staticItems.filter(Boolean),
											null,
											2,
										),
									);
									exportedStaticNamespaces.add(
										staticNamespace,
									);
								}
							}
						}
					}
					zip.file(
						`${namespace}.json`,
						JSON.stringify(items, null, 2),
					);
				}
			}
			const blob = await zip.generateAsync({ type: "blob" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `dhis2_flexiportal_datastore_export_${new Date().toISOString().split("T")[0]}.zip`;
			link.click();
			URL.revokeObjectURL(link.href);
			addLog(setLogs)("Export completed successfully.", "success");
		} catch (error) {
			addLog(setLogs)(`Export failed: ${error.message}`, "error");
		} finally {
			setLoading(false);
		}
	}, [getKeysInNamespace, getValue, setLogs, addLog]);

	return (
		<div className="mb-6">
			<h3 className="text-base mb-2 font-bold">
				{i18n.t("Export Configuration")}
			</h3>
			<Button
				secondary
				onClick={handleExport}
				loading={loading}
				disabled={loading}
				icon={<IconArrowDown16 />}
			>
				{i18n.t("Export configurations to ZIP")}
			</Button>
		</div>
	);
};
