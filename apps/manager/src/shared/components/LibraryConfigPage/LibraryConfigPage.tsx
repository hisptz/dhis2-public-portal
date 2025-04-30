import React from "react";
import { GeneralLibraryConfig } from "./components/GeneralLibraryConfig";
import { LibraryList } from "../LibraryList/LibraryList";

export function LibraryConfigPage() {
	return (
		<div>
			<GeneralLibraryConfig />
			<LibraryList />
		</div>
	);
}
