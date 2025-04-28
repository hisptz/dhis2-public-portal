import React, { ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { useModuleForm } from "../hooks/module";

export function ModuleFormProvider({ children }: { children: ReactNode }) {
	const form = useModuleForm();

	return (
		<div className="w-full flex flex-col gap-4">
			<FormProvider {...form}>
				{children}
			</FormProvider>
		</div>
	);
}
