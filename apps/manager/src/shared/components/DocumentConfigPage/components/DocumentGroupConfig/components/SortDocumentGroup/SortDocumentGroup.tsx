import { useBoolean } from "usehooks-ts";
import { Button } from "@dhis2/ui"; 
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { DocumentGroup } from "@packages/shared/schemas";
import { SortDocumentGroupForm } from "./components/SortDocumentGroupForm";

export function SortDocumentGroup({
    items,
    onSortSubmit, 
}: {
    items: DocumentGroup[];
    onSortSubmit: (updatedItems: DocumentGroup[]) => void; 
}) {
    const {
        value: hideModal, 
        setTrue: closeModal,
        setFalse: openModal,
    } = useBoolean(true);

    return (
        <>
            {!hideModal && (  
                <SortDocumentGroupForm
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
                {i18n.t("Sort document groups")}
            </Button>
        </>
    );
}