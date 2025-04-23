import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { useAppearanceQuery } from "../hooks/data";

const AppearanceContext = createContext<AppAppearanceConfig | null>(null);
const AppearanceRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useAppearance() {
	return useContext(AppearanceContext)!;
}

export function useRefreshAppearance() {
	return useContext(AppearanceRefreshContext);
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
	const { loading, error, appearance, refetch } =
    useAppearanceQuery();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	if (!appearance) {
		return (
			<ErrorPage
				error={Error("App Appearance not found")}
				resetErrorBoundary={() => refetch()}
			/>
		);
	}

	return (
		<AppearanceContext.Provider value={appearance}>
			<AppearanceRefreshContext.Provider
				value={async () => {
					await refetch();
				}}
			>
				{children}
			</AppearanceRefreshContext.Provider>
		</AppearanceContext.Provider>
	);
}
