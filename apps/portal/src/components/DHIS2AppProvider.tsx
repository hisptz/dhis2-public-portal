"use client";

import { ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";
import { D2SystemInfo } from "@/types/d2SystemInfo";
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
	systemInfo,
	contextPath,
}: {
	children: ReactNode;
	systemInfo?: D2SystemInfo | null;
	contextPath: string;
}) {
	if (typeof window === "undefined") {
		return children;
	}

	const [, minor] = systemInfo?.version.split(".") ?? [];
	return (
		<NoSsrAppProvider
			config={{
				baseUrl: `${window.location.protocol}//${window.location.host}${contextPath ?? ""}`,
				apiVersion: minor,
				systemInfo,
			}}
			plugin={{}}
			parentAlertsAdd={{}}
			showAlertsInPlugin={false}
		>
			{children}
		</NoSsrAppProvider>
	);
}
