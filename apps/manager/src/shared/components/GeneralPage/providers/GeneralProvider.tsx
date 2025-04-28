import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { MetadataConfig } from "@packages/shared/schemas";
import { useMetadataQuery } from "../hooks/data";

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
	const { loading, error, metadata, refetch } =
    useMetadataQuery();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	if (!metadata) {
		return (
			<ErrorPage
				error={Error("Metadata not found")}
				resetErrorBoundary={() => refetch()}
			/>
		);
	}

	return (
		<MetadataContext.Provider value={metadata}>
			<MetadataRefreshContext.Provider
				value={async () => {
					await refetch();
				}}
			>
				{children}
			</MetadataRefreshContext.Provider>
		</MetadataContext.Provider>
	);
}
