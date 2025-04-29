"use client";

import { ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";
import { D2SystemInfo } from "@/types/d2SystemInfo";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const NoSsrAppProvider: ComponentType<any> = dynamic(
	async () => {
		return import("@dhis2/app-runtime").then(({ Provider }) => ({
			default: Provider,
		}));
	},
	{
		ssr: false,
	},
);

export function DHIS2AppProvider({
	children,
	systemInfo,
}: {
	children: ReactNode;
	systemInfo: D2SystemInfo;
}) {
	const { contextPath, version } = systemInfo ?? {};
	const [, minor] = version.split(".") ?? [];

	return (
		<QueryClientProvider client={queryClient}>
			<NoSsrAppProvider
				config={{
					baseUrl: "",
					apiVersion: minor,
					systemInfo: {
						contextPath,
						version,
					},
				}}
				plugin={{}}
				parentAlertsAdd={{}}
				showAlertsInPlugin={false}
			>
				{children}
			</NoSsrAppProvider>
		</QueryClientProvider>
	);
}
