import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { FeedbackConfig, FeedbackRecipient } from "@packages/shared/schemas";
import { Button, ButtonStrip, IconDelete16 } from "@dhis2/ui";
import { EditFeedback } from "./AddFeedback/componets/EditFeedback";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Email"),
		key: "email",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function FeedbackList({
	recipients,
	onEdit,
	onRemove,
}: {
	recipients: Array<FeedbackRecipient>;
	onEdit: (feedback: FeedbackConfig, index: number) => void;
	onRemove: (index: number) => void;
}) {
	const rows = recipients.map((item, index) => ({
		id: `feedback-item-${index}`,
		email: item.email || "N/A",
		actions: (
			<ButtonStrip key={`feedback-${index}`}>
				<EditFeedback
					feedback={item}
					onUpdate={(data) => onEdit(data, index)}
				/>
				<Button
					onClick={() => onRemove(index)}
					title={i18n.t("Remove")}
					icon={<IconDelete16 />}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<SimpleTable
			columns={columns}
			rows={rows}
			emptyLabel={i18n.t("No feedback items configured")}
		/>
	);
}
