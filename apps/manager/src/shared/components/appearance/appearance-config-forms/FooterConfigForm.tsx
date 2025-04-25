import React from "react";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

export function FooterConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	return <></>;
}
