import { useBoolean } from "usehooks-ts";
import { AddFeedbackForm } from "./componets/AddFeedbackForm";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FeedbackRecipient } from "@packages/shared/schemas";

export function AddFeedback({
	onAdd,
}: {
	onAdd: (recipient: FeedbackRecipient) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddFeedbackForm
					hide={hide}
					onClose={onHide}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add Feedback Recipient")}
			</Button>
		</>
	);
}
