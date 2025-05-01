import React from "react";
import { GeneralDocumentConfig } from "./components/GeneralDocumentConfig";
import { DocumentList } from "../DocumentList/DocumentList";
import { DocumentItemConfig } from "./components/DocumentItemConfig";

export function DocumentConfigPage() {
	return (
		<div>
			<GeneralDocumentConfig />
			<DocumentItemConfig />
			{/* <DocumentList /> */}
		</div>
	);
}
