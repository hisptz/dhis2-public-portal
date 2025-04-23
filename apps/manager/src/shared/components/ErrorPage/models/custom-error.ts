import { FC } from "react";
import { IconError24, IconProps } from "@dhis2/ui";

export interface ErrorAction {
	label: string;
	action: () => void;
	primary?: boolean;
}

export class CustomError extends Error {
	icon: FC<IconProps>;
	actions: ErrorAction[];
	subtext?: string;

	constructor(
		message: string,
		{
			icon,
			actions,
			subtext,
		}: {
			icon: FC<IconProps>;
			actions: ErrorAction[];
			subtext?: string;
		},
	) {
		super(message);
		this.icon = icon;
		this.actions = actions;
		this.subtext = subtext;
	}

	static fromError(error: Error) {
		return new CustomError(error.message, {
			icon: IconError24,
			actions: [],
		});
	}
}
