import { useWatch } from "react-hook-form";
import { AddSourceFormValues } from "./AddDataSourceForm";
import React, { useState } from "react";
import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useAlert } from "@dhis2/app-runtime";
import { testDataSource } from "../utils";

export function TestConnection() {
	const [testing, setTesting] = useState(false);
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [url, pat, username, password] = useWatch<
		AddSourceFormValues,
		["source.url", "source.pat", "source.username", "source.password"]
	>({
		name: [
			"source.url",
			"source.pat",
			"source.username",
			"source.password",
		],
	});

	const enabled = !!url && (!!pat || (!!username && !!password));

	const test = async () => {
		try {
			setTesting(true);
			const response = await testDataSource({
				url,
				username,
				password,
				pat,
			});
			if (response.status === 200) {
				show({
					message: i18n.t("Connection successful"),
					type: { success: true },
				});
			} else {
				show({
					message: `${i18n.t("Connection failed")}:${response.statusText}`,
					type: { info: true },
				});
			}
		} catch (e) {
			if (e instanceof Error) {
				show({
					message: `${i18n.t("Connection failed")}:${e.message}`,
					type: { info: true },
				});
			} else {
				show({
					message: `${i18n.t("Connection failed")}: Unknown error`,
					type: { info: true },
				});
			}
		} finally {
			setTesting(false);
		}
	};

	return (
		<ButtonStrip end>
			<Button
				onClick={() => {
					test();
				}}
				loading={testing}
				disabled={!enabled}
			>
				{testing ? i18n.t("Testing...") : i18n.t("Test connection")}
			</Button>
		</ButtonStrip>
	);
}
