import { Button, FileInputField, IconArrowUp16 } from "@dhis2/ui";
import React, { useCallback, useState } from "react";
import JSZip from "jszip";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import i18n from "@dhis2/d2-i18n";
import { DocumentDetails, getContentTypeFromExtension, LogEntry, useConfiguration } from "../utils/configurationUtils";
import { useFile } from "../hooks/file";


interface ImportSectionProps {
	setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}


export const ImportSection = ({ setLogs }: ImportSectionProps) => {
	const { setValue, addLog, uploadDocument, deleteDocument } = useConfiguration();
	const { uploadFile } = useFile();
	const [loading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileInputKey, setFileInputKey] = useState(Date.now());

	const handleFileChange = ({ files }: { files: FileList | null }) => {
		if (files && files.length > 0 && files[0].type === "application/zip") {
			setSelectedFile(files[0]);
			setLogs([]);
			addLog(setLogs)(`File selected: ${files[0].name}`, "info");
		} else {
			setSelectedFile(null);
			addLog(setLogs)(
				"Invalid file type. Only ZIP files are allowed.",
				"error",
			);
			setFileInputKey(Date.now());
		}
	};

	const handleImport = useCallback(async () => {
		if (!selectedFile) {
			addLog(setLogs)("No file selected for import.", "error");
			return;
		}

		setLoading(true);
		addLog(setLogs)(
			`Import process started for ${selectedFile.name}...`,
			"info",
		);
		const zip = new JSZip();

		try {
			const loadedZip = await zip.loadAsync(selectedFile);
			const documentsInfoFile = loadedZip.files['documents.json'];
			if (documentsInfoFile) {
				addLog(setLogs)("Processing documents.json...", "info");
				const documentsData = JSON.parse(await documentsInfoFile.async("string"));
				if (documentsData?.documents && Array.isArray(documentsData.documents)) {
					const documents: DocumentDetails[] = documentsData.documents;
					for (const doc of documents) {
						if (doc.attachment && doc.name) {
							const assetFilePath = `assets/${doc.name}`;
							const assetFile = loadedZip.files[assetFilePath];
							if (assetFile) {
								addLog(setLogs)(`Uploading file resource for ${doc.name}...`, "info-low");
								const fileData = await assetFile.async('blob');
								const contentType = getContentTypeFromExtension(doc.name);
								const fileObject = new File([fileData], doc.name, { type: contentType });
								const fileResourceId = await uploadFile(fileObject, doc.name, addLog(setLogs));
								if (fileResourceId) {
									doc.url = fileResourceId;
								} else {
									addLog(setLogs)(`Failed to upload file resource for ${doc.name}`, "warning");
									continue;
								}
							} else {
								addLog(setLogs)(`Asset file ${assetFilePath} not found in ZIP`, "warning");
								continue;
							}
							await deleteDocument(doc, addLog(setLogs));
							const success = await uploadDocument(doc, addLog(setLogs));
							if (!success) {
								addLog(setLogs)(`Skipping document ${doc.name} due to upload failure`, "warning");
							}
						}
					}
				} else {
					addLog(setLogs)("Invalid or empty documents.json", "warning");
				}
			} else {
				addLog(setLogs)("documents.json not found in ZIP", "warning");
			}

			for (const filename in loadedZip.files) {
				if (
					filename.endsWith(".json") &&
					!loadedZip.files[filename].dir
				) {
					const namespace = filename.replace(".json", "");
					const data = JSON.parse(
						await loadedZip.files[filename].async("string"),
					);

					if (
						namespace === DatastoreNamespaces.MAIN_CONFIG &&
						typeof data === "object" &&
						!Array.isArray(data)
					) {
						for (const key in data) {
							if (
								Object.values(DatastoreKeys).includes(
									key as DatastoreKeys,
								)
							) {
								await setValue(
									namespace,
									key,
									data[key],
									addLog(setLogs),
								);
								addLog(setLogs)(
									`Imported key '${key}' into ${namespace}.`,
									"info-low",
								);
							}
						}
					} else if (Array.isArray(data)) {
						for (const item of data) {
							if (item?.id) {
								await setValue(
									namespace,
									item.id,
									item,
									addLog(setLogs),
								);
								addLog(setLogs)(
									`Imported key '${item.id}' into ${namespace}.`,
									"info-low",
								);
							}
						}
					}
				}
			}
			addLog(setLogs)("Import completed successfully.", "success");
			setSelectedFile(null);
			setFileInputKey(Date.now());
		} catch (error) {
			addLog(setLogs)(`Import failed: ${error.message}`, "error");
		} finally {
			setLoading(false);
		}
	}, [selectedFile, addLog, setLogs, deleteDocument, uploadDocument, uploadFile, setValue]);

	return (
		<div className="mb-6">
			<h3 className="text-base mb-2 font-bold">
				{i18n.t("Import Configuration")}
			</h3>
			<FileInputField
				key={fileInputKey}
				label="Select ZIP file"
				onChange={handleFileChange}
				accept=".zip,application/zip"
				placeholder={selectedFile?.name || "No file uploaded yet"}
				name="importFile"
				helpText="Upload a ZIP file containing Datastore JSON configurations."
				buttonLabel="Choose a file"
				className="mb-2"
			/>
			<Button
				secondary
				onClick={handleImport}
				loading={loading}
				disabled={loading || !selectedFile}
				icon={<IconArrowUp16 />}
			>
				{i18n.t("Import configurations from ZIP")}
			</Button>
		</div>
	);
};
