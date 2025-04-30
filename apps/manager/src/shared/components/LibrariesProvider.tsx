import React, { createContext, useContext } from "react";
import { useLibraryList } from "./DocumentList/hooks/documentList";
import { FullLoader } from "./FullLoader";
import ErrorPage from "./ErrorPage/ErrorPage";
import { LibraryData } from "@packages/shared/schemas";

const LibraryContext = createContext<LibraryData[]>([]);
const LibraryRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useLibraries() {
	return useContext(LibraryContext);
}

export function useRefreshLibraries() {
	return useContext(LibraryRefreshContext);
}

export function LibrariesProvider({ children }: { children: React.ReactNode }) {
	const { loading, error, libraries, refetch } = useLibraryList();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	return (
		<LibraryContext.Provider value={libraries ?? []}>
			<LibraryRefreshContext.Provider
				value={async () => {
					await refetch();
				}}
			>
				{children}
			</LibraryRefreshContext.Provider>
		</LibraryContext.Provider>
	);
}
