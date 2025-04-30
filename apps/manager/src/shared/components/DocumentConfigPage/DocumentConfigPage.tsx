import React from "react";
import { GeneralDocumentConfig } from "./components/GeneralDocumentConfig";
import { DocumentList } from "../DocumentList/DocumentList";

export function DocumentConfigPage() {
	return (
		<div>
			<GeneralDocumentConfig />
			<DocumentList />
		</div>
	);
}
