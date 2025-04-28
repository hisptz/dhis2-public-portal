import React from "react";
import { AppAppearanceConfig } from "@packages/shared/schemas";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

export function HeaderConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	return <></>;
}
