import React from "react";
import { FilesListForm } from "./DocumentGroupConfig/components/FilesListForm/FilesListForm";

export function DocumentGroupTypeSelector({ nested }: { nested?: boolean }) {
	if (nested) {
		return <FilesListForm nested />;
	}
	return <>{<FilesListForm />}</>;
}
