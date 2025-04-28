import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { AppModule } from "@packages/shared/schemas";
import { useModuleById } from "../hooks/data";

const ModuleContext = createContext<AppModule | null>(null);
const ModuleRefreshContext = createContext<() => Promise<void>>(
	async () => { },
);

export function useModule() {
	return useContext(ModuleContext)!;
}

export function useRefreshModule() {
	return useContext(ModuleRefreshContext);
}

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    //TODO: Get the module ID from the URL parameters
	const ModuleId = "";

	const { loading, error, module, refetch } =
		useModuleById(ModuleId);

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	if (!module) {
		return (
			<ErrorPage
				error={Error("Module not found")}
				resetErrorBoundary={() => refetch()}
			/>
		);
	}

	return (
		<ModuleContext.Provider value={module}>
			<ModuleRefreshContext.Provider
				value={async () => {
					await refetch();
				}}
			>
				{children}
			</ModuleRefreshContext.Provider>
		</ModuleContext.Provider>
	);
}
