"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { Fragment, ReactNode, useId, useRef } from "react";
import { isEmpty } from "lodash";
import { IconDots } from "@tabler/icons-react";

export interface ActionMenu {
	label: string;
	icon: ReactNode;
	onClick: () => void;
}

export interface ActionMenuGroup {
	actions: ActionMenu[];
	label?: string;
}

export function ActionMenu({
	actions,
	actionMenuGroups,
}: {
	actions?: ActionMenu[];
	actionMenuGroups?: ActionMenuGroup[];
}) {
	const id = useId();
	return (
		<>
			<Menu id={id} withinPortal position="bottom-end" shadow="sm">
				<Menu.Target>
					<ActionIcon variant="subtle" color="gray">
						<IconDots size={16} />
					</ActionIcon>
				</Menu.Target>

				<Menu.Dropdown>
					{!isEmpty(actions)
						? actions?.map((action) => (
								<Menu.Item
									key={`${id}-${action.label}-menu-item`}
									leftSection={action.icon}
									onClick={action.onClick}
								>
									{action.label}
								</Menu.Item>
							))
						: actionMenuGroups?.map((group) => (
								<div key={group.label + id}>
									<Menu.Label key={group.label + id}>
										{group.label}
									</Menu.Label>
									{group.actions.map((action) => (
										<Menu.Item
											key={`${id}-${action.label}-menu-item`}
											leftSection={action.icon}
											onClick={action.onClick}
										>
											{action.label}
										</Menu.Item>
									))}
								</div>
							))}
				</Menu.Dropdown>
			</Menu>
		</>
	);
}
