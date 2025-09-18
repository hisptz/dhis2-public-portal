import React, { useState } from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { CheckboxField } from "@dhis2/ui";

export function AuthFields() {
	const [usesBasicAuth, setUsesBasicAuth] = useState(false);

	if (usesBasicAuth) {
		return (
			<>
				<CheckboxField
					onChange={({ checked }) => setUsesBasicAuth(checked)}
					name="useBasicAuth"
					checked={usesBasicAuth}
					label={i18n.t("Use basic authentication")}
				/>
				<RHFTextInputField
					name={"source.username"}
					label={i18n.t("Username")}
					placeholder={"admin"}
					required
				/>
				<RHFTextInputField
					type="password"
					name={"source.password"}
					label={i18n.t("Password")}
					placeholder={"district"}
					required
				/>
			</>
		);
	}

	return (
		<>
			<CheckboxField
				onChange={({ checked }) => setUsesBasicAuth(checked)}
				name="useBasicAuth"
				checked={usesBasicAuth}
				label={i18n.t("Use basic authentication")}
			/>
			<RHFTextInputField
				label={i18n.t("Personal Access Token (PAT)")}
				name={"source.pat"}
				placeholder={"d2p_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
				required
			/>
		</>
	);
}
