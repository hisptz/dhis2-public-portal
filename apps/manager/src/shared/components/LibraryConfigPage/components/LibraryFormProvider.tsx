import React, { ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { useLibraryForm } from "../hooks/library";

export function LibraryFormProvider({ children }: { children: ReactNode }) {
	const form = useLibraryForm();

	return (
		<div className="w-full flex flex-col gap-4">
			<FormProvider {...form}>{children}</FormProvider>
		</div>
	);
}
