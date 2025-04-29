import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFRichTextAreaField } from "../../../Fields/RHFRichTextAreaField";

export function StaticForm() {
    return (
            <form  onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
                <RHFTextInputField required name="title" label={i18n.t("Title")} />
                <RHFRichTextAreaField
                    required
                    autoGrow
                    rows={2}
                    name="shortDescription"
                    label={i18n.t("Short description")}
                />
                <RHFRichTextAreaField
                    required
                    name="content"
                    label={i18n.t("Content")}
                />
                <RHFRichTextAreaField
                    required
                    name="icon"
                    label={i18n.t("Icon")}
                />
            </form>
     );
}
