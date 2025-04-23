import { ActionIcon, Popover, Text } from "@mantine/core";
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
			<ActionIcon onClick={onToggle} ref={anchorRef}>
				<IconInfoCircle />
			</ActionIcon>
			<Popover opened={open} id={captionId} onClose={onClose}>
				<div className="p-2 flex flex-col gap-1 w-[400px]">
					<span className="text-sm font-bold">{label}</span>
					<Text variant="caption">{caption} </Text>
				</div>
			</Popover>
		</>
	);
}
