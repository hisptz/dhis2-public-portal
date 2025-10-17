import React from "react";
import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useAlert, useDataQuery } from "@dhis2/app-runtime";

const query: any = {
	routeTest: {
		resource: `routes`,
		id: ({ id }: { id: string }) => `${id}/run`,
	},
};

export function FormTestConnection({
	routeConfig,
}: {
	routeConfig: { name: string; url: string; id: string };
}) {
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const { refetch, loading, fetching } = useDataQuery(query, {
		onComplete: (data) => {
			show({
				message: i18n.t("Connection successful"),
				type: { success: true },
			});
		},
		onError: (error) => {
			console.log("error is", error);
			if (error.message?.includes('Unexpected end of JSON input') ||
				error.details?.httpStatusCode === 302 ||
				error.message?.includes('302')) {
				show({
					message: i18n.t("Connection successful"),
					type: { success: true },
				});
			} else {
				show({
					message: `${i18n.t("Connection failed")}:${error.message}`,
					type: { info: true },
				});
			}
		},
		variables: {
			id: routeConfig.id,
		},
		lazy: true,
	});

	const test = async () => {
		await refetch();
	};

	return (
		<ButtonStrip>
			<Button
				onClick={() => {
					test();
				}}
				loading={loading || fetching}
			>
				{loading || fetching
					? i18n.t("Testing...")
					: i18n.t("Test connection")}
			</Button>
		</ButtonStrip>
	);
}
