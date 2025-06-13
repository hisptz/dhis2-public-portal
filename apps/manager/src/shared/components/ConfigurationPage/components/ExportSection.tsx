import { Button, IconArrowDown16 } from "@dhis2/ui";
import React, { useCallback, useState } from "react";
import JSZip from "jszip";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import {
	AppAppearanceConfig,
	AppMenuConfig,
	AppMeta,
	AppModule,
	DocumentGroup,
	DocumentItem,
	DocumentsModuleConfig,
	MenuItem,
	ModuleType,
	StaticModule,
	StaticModuleConfig,
} from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { DocumentDetails, LogEntry, useConfiguration } from "../utils/configurationUtils";

interface ExportSectionProps {
	setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export const ExportSection = ({ setLogs }: ExportSectionProps) => {
	const { getKeysInNamespace, getValue, addLog, fetchDocumentDetails, fetchDocumentData } = useConfiguration();
	const [loading, setLoading] = useState(false);

	const handleExport = useCallback(async () => {
		setLogs([]);
		setLoading(true);
		addLog(setLogs)("Export process started...", "info");
		const zip = new JSZip();
		const exportedStaticNamespaces = new Set<string>();
		const assetsFolder = zip.folder("assets");
		const extractedIds: { documents: string[] } = { documents: [] };
		const documentDetails: DocumentDetails[] = [];

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
						console.log(
							`Exporting key: ${key} with value: ${value}`,)
						if (value) {
							data[key] = value;
							if (key === DatastoreKeys.APPEARANCE) {
								const appearance = value as AppAppearanceConfig;
								if (appearance.header?.style?.trailingLogo?.url) {
									extractedIds.documents.push(appearance.header.style.trailingLogo.url);
								}
							}
							if (key === DatastoreKeys.METADATA) {
								const metadata = value as AppMeta;
								if (metadata.icon) {
									extractedIds.documents.push(metadata.icon);
								}
							}
							if (key === DatastoreKeys.MENU) {
								const menu = value as AppMenuConfig;
								if (menu.items) {
									const extractMenuIcons = (items: MenuItem[]) => {
										items.forEach((item) => {
											if (item.icon) {
												extractedIds.documents.push(item.icon);
											}
										});
									};
									extractMenuIcons(menu.items);
								}
							}
						}
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

							if (namespace === DatastoreNamespaces.MODULES) {
								const module = item as AppModule;
								if (module.type === ModuleType.DOCUMENTS && module.config) {
									const config = module.config as DocumentsModuleConfig;
									if (config.grouped && (config as any).groups) {
										(config as any).groups.forEach((group: DocumentGroup) => {
											group.items.forEach((doc: DocumentItem) => {
												if (doc.id) {
													extractedIds.documents.push(doc.id);
												}
											});
										});
									} else if (!config.grouped && config.items) {
										config.items.forEach((doc: DocumentItem) => {
											if (doc.id) {
												extractedIds.documents.push(doc.id);
											}
										});
									}
								}
								// Handle static namespaces
								if (
									module.type === ModuleType.STATIC &&
									(module.config as StaticModuleConfig)?.namespace &&
									!exportedStaticNamespaces.has((module.config as StaticModuleConfig).namespace)
								) {
									const staticNamespace = (module.config as StaticModuleConfig).namespace;
									const staticKeys = await getKeysInNamespace(staticNamespace, addLog(setLogs));
									const staticItems = await Promise.all(
										staticKeys.map((sKey) => getValue(staticNamespace, sKey, addLog(setLogs))),
									);
									zip.file(
										`${staticNamespace}.json`,
										JSON.stringify(staticItems.filter(Boolean), null, 2),
									);
									exportedStaticNamespaces.add(staticNamespace);
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
			// Step 2: Fetch document details and data for each ID
			const uniqueIds = [...new Set(extractedIds.documents)]; // Remove duplicates
			for (const id of uniqueIds) {
				// Fetch document details
				const details = await fetchDocumentDetails(id, addLog(setLogs));
				if (details) {
					documentDetails.push(details);
				}

				// Fetch document data
            const docData = await fetchDocumentData(id, details!.name, addLog(setLogs));
				if (docData && assetsFolder) {
					assetsFolder.file(docData.filename, docData.data);
				}
			}

			// Step 3: Save extracted IDs and document details
			zip.file("documents_info.json", JSON.stringify({ documents: documentDetails }, null, 2));

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
	}, [setLogs, addLog, getValue, getKeysInNamespace, fetchDocumentDetails, fetchDocumentData]);

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
