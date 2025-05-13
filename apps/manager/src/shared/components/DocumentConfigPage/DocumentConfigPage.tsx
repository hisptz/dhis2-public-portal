import React from "react";
import { GeneralDocumentConfig } from "./components/GeneralDocumentConfig";
import { DocumentItemConfig } from "./components/DocumentItemConfig";
import { DocumentGroupConfig } from "./components/DocumentGroupConfig/DocumentGroupConfig";

export function DocumentConfigPage() {
	return (
		<div>
			<GeneralDocumentConfig />
			<DocumentItemConfig />
			<DocumentGroupConfig />
		</div>
	);
}
