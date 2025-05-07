"use client"

import { ActionIcon, Box, Popover, Text, Title } from "@mantine/core";
import { useRef } from "react";
import { useBoolean } from "usehooks-ts";
import { IconInfoCircle } from "@tabler/icons-react";
import { VisualizationItem } from "@packages/shared/schemas";

export function CaptionPopover({
	visualization,
	label,
}: {
	visualization: VisualizationItem;
	label: string;
}) {
	const {
		value: open,
		setFalse: onClose,
		toggle: onToggle,
	} = useBoolean(false);
	const anchorRef = useRef<HTMLButtonElement>(null);
	const { caption, id } = visualization ?? {};

	const captionId = `caption-${id}`;

	if (!caption) return null;

	return (
		<>
			<Popover withArrow id={captionId}>
				<Popover.Target>
					<ActionIcon
						variant="subtle"
						color="gray"
						onClick={onToggle}
						ref={anchorRef}
					>
						<IconInfoCircle size={16} />
					</ActionIcon>
				</Popover.Target>
				<Popover.Dropdown>
					<Box className="flex flex-col gap-1 w-[400px]">
						<Title order={6}>{label}</Title>
						<Text size="sm" c="dimmed" variant="caption">
							{caption}
						</Text>
					</Box>
				</Popover.Dropdown>
			</Popover>
		</>
	);
}
