import { useBoolean } from "usehooks-ts";
import { AddFeedbackForm,   } from "./componets/AddFeedbackForm";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { FeedbackConfig,   } from "@packages/shared/schemas";

export function AddFeedback({
	onAdd,
}: {
	onAdd: (feedback: FeedbackConfig) => void;
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
				{i18n.t("Add Feedback")}
			</Button>
		</>
	);
}
