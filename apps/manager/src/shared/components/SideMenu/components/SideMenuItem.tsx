import classnames from "classnames";
import { MenuItem, MenuItemProps } from "@dhis2/ui";
import React, { forwardRef } from "react";
import { createLink } from "@tanstack/react-router";

export const SideMenuItem = createLink(
	forwardRef<HTMLAnchorElement, MenuItemProps>(function SideMenuItemComponent(
		props: MenuItemProps,
	) {
		return (
			<MenuItem
				{...props}
				className={classnames(
					"border-l-6 border-l-solid border-transparent !bg-gray-100",
					props.className,
					{
						["!border-l-primary-500"]:
							props.className?.includes("active"),
						["!bg-gray-300"]: props.className?.includes("active"),
					},
				)}
				label={props.label}
				onClick={undefined}
			/>
		);
	}),
);
