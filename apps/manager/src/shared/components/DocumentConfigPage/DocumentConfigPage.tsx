import React from "react";
import { GeneralDocumentConfig } from "./components/GeneralDocumentConfig";
import { LibraryList } from "../LibraryList/LibraryList";

export function LibraryConfigPage() {
	return (
		<div>
			<GeneralDocumentConfig />
			<LibraryList />
		</div>
	);
}
