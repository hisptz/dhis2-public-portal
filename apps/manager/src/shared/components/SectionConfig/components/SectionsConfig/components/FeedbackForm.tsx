import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useSectionNamePrefix } from "../../../hooks/route";
import { RHFTextAreaField } from "../../../../Fields/RHFTextAreaField";

export function FeedbakForm() {
    const namePrefix = useSectionNamePrefix();
    return (
        <form className="flex flex-col gap-2 pb-4">
            <RHFTextInputField required name={`${namePrefix}.item.item.name`} label={i18n.t("Full Name")} />
            <RHFTextInputField required name={`${namePrefix}.item.item.email`} label={i18n.t("Email")} />
            <RHFTextAreaField required autoGrow rows={2} name={`${namePrefix}.item.item.message`} label={i18n.t("Message")} />
        </form>
    );
}
