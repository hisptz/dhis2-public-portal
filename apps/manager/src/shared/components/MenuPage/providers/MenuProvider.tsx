import React, { createContext, useContext } from "react";
import { FullLoader } from "../../FullLoader";
import ErrorPage from "../../ErrorPage/ErrorPage";
import { useMenuQuery } from "../hooks/data";
import { AppMenuConfig } from "@packages/shared/schemas";

const MenuContext = createContext<AppMenuConfig | null>(null);
const MenuRefreshContext = createContext<() => Promise<void>>(
	async () => {},
);

export function useMenu() {
	return useContext(MenuContext)!;
}

export function useRefreshMenu() {
	return useContext(MenuRefreshContext);
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
	const { loading, error, menu, refetch } =
    useMenuQuery();

	if (loading) {
		return <FullLoader />;
	}

	if (error) {
		return <ErrorPage error={error} resetErrorBoundary={() => refetch()} />;
	}

	if (!menu) {
		return (
			<ErrorPage
				error={Error("App Menu not found")}
				resetErrorBoundary={() => refetch()}
			/>
		);
	}

	return (
		<MenuContext.Provider value={menu}>
			<MenuRefreshContext.Provider
				value={async () => {
					await refetch();
				}}
			>
				{children}
			</MenuRefreshContext.Provider>
		</MenuContext.Provider>
	);
}
