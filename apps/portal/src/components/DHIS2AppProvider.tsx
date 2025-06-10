"use client";

import { ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";
import { FullPageLoader } from "@/components/FullPageLoader";

const NoSsrAppProvider: ComponentType<any> = dynamic(
	async () => {
		return import("@dhis2/app-runtime").then(({ Provider }) => ({
			default: Provider,
		}));
	},
	{
		ssr: false,
		loading: FullPageLoader,
	},
);

export function DHIS2AppProvider({
	children,
	contextPath,
	apiVersion,
}: {
	children: ReactNode;
	contextPath: string;
	apiVersion: number;
}) {
	if (typeof window === "undefined") {
		return children;
	}
	return (
		<NoSsrAppProvider
			config={{
				baseUrl: `${window.location.protocol}//${window.location.host}${contextPath ?? ""}`,
				apiVersion,
			}}
			plugin={false}
			parentAlertsAdd={{}}
			showAlertsInPlugin={false}
		>
			{children}
		</NoSsrAppProvider>
	);
}
