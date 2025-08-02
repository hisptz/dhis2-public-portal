import { useBoolean } from "usehooks-ts";
import { Button } from "@dhis2/ui"; 
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { DocumentItem } from "@packages/shared/schemas";
import { SortDocumentForm } from "./components/SortDocumentForm";

export function SortDocument({
    items,
    onSortSubmit, 
}: {
    items: DocumentItem[];
    onSortSubmit: (updatedItems: DocumentItem[]) => void; 
}) {
    const {
        value: hideModal, 
        setTrue: closeModal,
        setFalse: openModal,
    } = useBoolean(true);

    return (
        <>
            {!hideModal && (  
                <SortDocumentForm
                    hide={hideModal}  
                    items={items}
                    onClose={closeModal} 
                    onSubmit={(updatedItems) => {
                        onSortSubmit(updatedItems);
                        closeModal();  
                    }}
                />
            )}
            <Button onClick={openModal} disabled={items.length === 0}> 
                {i18n.t("Sort document items")}
            </Button>
        </>
    );
}