import React, { createContext, useContext } from "react";
import { useLibraryById } from "./DocumentList/hooks/documentList";
import { FullLoader } from "./FullLoader";
import ErrorPage from "./ErrorPage/ErrorPage";
import { useParams } from "@tanstack/react-router";
import { LibraryData } from "@packages/shared/schemas";

const LibraryContext = createContext<LibraryData | null>(null);
const LibraryRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useLibrary() {
	return useContext(LibraryContext)!;
}

export function useRefreshLibrary() {
	return useContext(LibraryRefreshContext);
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
	const { libraryId } = useParams({
		from: "/library/_provider/$libraryId",
	});
	const { loading, error, library, refetch } = useLibraryById(libraryId);

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	if (!library) {
		return (
			<ErrorPage
				error={Error("Library not found")}
				resetErrorBoundary={() => refetch()}
			/>
		);
	}

	return (
		<LibraryContext.Provider value={library}>
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
