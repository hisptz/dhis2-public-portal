import i18n from "@dhis2/d2-i18n";
import { Modal, ModalTitle, ModalContent, ModalActions, Button } from "@dhis2/ui";
import React from "react";

/**
 * Simple local confirmation modal used for delete confirmation in this file.
 */
type DeleteConfirmationAlertProps = {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    hide: boolean;
    onClose: () => void;
};

export function DeleteConfirmationAlert({
    title,
    message,
    confirmLabel,
    onConfirm,
    hide,
    onClose,
}: DeleteConfirmationAlertProps) {
    return (
        <Modal hide={hide} onClose={onClose} small position="middle">
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>{message}</ModalContent>
            <ModalActions>
                <Button
                    primary
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmLabel ?? i18n.t("Delete")}
                </Button>
                <div style={{ marginRight: "6px" }} />
                <Button onClick={onClose}>{i18n.t("Cancel")}</Button>
            </ModalActions>
        </Modal>
    );
}