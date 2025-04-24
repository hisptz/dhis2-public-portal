import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { AppModule } from "@packages/shared/schemas";
import { useModuleList } from "../hooks/data";

const ModuleContext = createContext<AppModule[]>([]);
const ModuleRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useModules() {
	return useContext(ModuleContext);
}
export function useRefreshModules() {
	return useContext(ModuleRefreshContext);
}

export function ModulesProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { loading, error, modules, refetch } = useModuleList();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	return (
		<ModuleContext.Provider value={modules ?? []}>
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
