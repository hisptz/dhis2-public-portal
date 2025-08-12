import { StaticItemConfig } from "@packages/shared/schemas";
import {
	Button,
	ButtonStrip,
	IconDragHandle16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React, { useEffect, useState } from "react";
import { useDialog } from "@hisptz/dhis2-ui";
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from "react-beautiful-dnd";
import { useUpdateItem } from "../AddItem/hooks/create";
import { useRefreshModule } from "../../../ModulesPage/providers/ModuleProvider";

export interface SortItemsProps {
	onClose(): void;
	items: StaticItemConfig[];
	onSubmit(updatedItems: StaticItemConfig[]): void;
	hide: boolean;
}

const reorder = (
	list: DraggableStaticItem[],
	startIndex: number,
	endIndex: number,
): DraggableStaticItem[] => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
};

type DraggableStaticItem = StaticItemConfig & { draggableId: string };

export function SortItemsForm({
	items: initialItems,
	onClose,
	onSubmit,
	hide,
}: SortItemsProps) {
	const { confirm } = useDialog();
	const [currentItems, setCurrentItems] = useState<DraggableStaticItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const { updateItem } = useUpdateItem();
	const refreshModule = useRefreshModule();

	useEffect(() => {
		setCurrentItems(
			initialItems.map((item, index) => ({
				...item,
				draggableId: item.id || `static-draggable-${index}`,
			})),
		);
		setIsDirty(false);
	}, [initialItems, hide]);

	const handleOnDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}
		if (result.destination.index === result.source.index) {
			return;
		}

		const newOrderedItems = reorder(
			currentItems,
			result.source.index,
			result.destination.index,
		);
		setCurrentItems(newOrderedItems);
		setIsDirty(true);
	};

	const handleSave = async () => {
		setIsSubmitting(true);
		const itemsToSubmit = currentItems.map((item, index) => ({
			...item,
			sortOrder: index + 1,
		}));
		const items = itemsToSubmit.map(({ draggableId, ...rest }) => rest);
		for (const item of items) {
			await updateItem(item);
		}
		onSubmit(items);
		await refreshModule();
		setIsSubmitting(false);
		setIsDirty(false);
		onClose();
	};

	const handleCloseClick = () => {
		if (isDirty) {
			confirm({
				title: i18n.t("Confirm exit"),
				message: i18n.t(
					"You have unsaved changes to the sort order. Are you sure you want to close?",
				),
				onConfirm() {
					setIsDirty(false);
					onClose();
				},
			});
		} else {
			onClose();
		}
	};

	const getDraggableId = (item: DraggableStaticItem): string => {
		return item.draggableId;
	};

	if (hide) {
		return null;
	}

	return (
		<Modal position="middle" hide={hide} onClose={handleCloseClick}>
			<ModalTitle>{i18n.t("Sort Items")}</ModalTitle>
			<ModalContent>
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="staticItemsSortableList">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="flex flex-col gap-2 py-1"
								style={{
									minHeight:
										currentItems.length > 0
											? "auto"
											: "100px",
								}}
							>
								{currentItems.length === 0 && (
									<div
										style={{
											textAlign: "center",
											color: "#555",
											padding: "20px 0",
										}}
									>
										{i18n.t("No items to sort.")}
									</div>
								)}
								{currentItems.map((item, index) => (
									<Draggable
										key={getDraggableId(item)}
										draggableId={getDraggableId(item)}
										index={index}
									>
										{(providedDraggable, snapshot) => (
											<div
												ref={providedDraggable.innerRef}
												{...providedDraggable.draggableProps}
												{...providedDraggable.dragHandleProps}
												style={{
													...providedDraggable
														.draggableProps.style,
													border: "1px dotted #6c757d",
													padding: "10px 12px",
													backgroundColor:
														snapshot.isDragging
															? "#e9ecef"
															: "#ffffff",
													display: "flex",
													alignItems: "center",
													borderRadius: "4px",
													userSelect: "none",
												}}
											>
												<IconDragHandle16 color="#495057" />
												<span
													style={{
														marginLeft: "10px",
														flexGrow: 1,
													}}
												>
													{item.title ||
														`Item ${index + 1}`}
												</span>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</ModalContent>
			<ModalActions>
				<ButtonStrip>
					<Button
						onClick={handleCloseClick}
						disabled={isSubmitting}
						secondary
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						loading={isSubmitting}
						onClick={handleSave}
						primary
						disabled={!isDirty || currentItems.length === 0}
					>
						{isSubmitting
							? i18n.t("Update...")
							: i18n.t("Update order")}
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
