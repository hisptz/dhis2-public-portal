import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

export function GeneralConfig() {
    return (
        <div className="flex flex-col gap-2">
            <RHFTextInputField required name="config.title" label={i18n.t("Title")} />
        </div>
    );
}
