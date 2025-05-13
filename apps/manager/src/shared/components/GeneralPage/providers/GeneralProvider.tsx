import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { MetadataConfig } from "@packages/shared/schemas";
import { useMetadataQuery } from "../hooks/data";
import { FormProvider } from "react-hook-form";

const MetadataContext = createContext<MetadataConfig | null>(null);
const MetadataRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useMetadata() {
	return useContext(MetadataContext)!;
}

export function useRefreshMetadata() {
	return useContext(MetadataRefreshContext);
}

export function MetadataProvider({ children }: { children: React.ReactNode }) {
	const { loading, error, form, refetch, config } = useMetadataQuery();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	return (
		<FormProvider {...form}>
			<MetadataContext.Provider value={config ?? null}>
				<MetadataRefreshContext.Provider
					value={async () => {
						await refetch();
					}}
				>
					{children}
				</MetadataRefreshContext.Provider>
			</MetadataContext.Provider>
		</FormProvider>
	);
}
