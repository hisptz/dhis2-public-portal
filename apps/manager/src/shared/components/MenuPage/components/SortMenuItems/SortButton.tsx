import { useBoolean } from "usehooks-ts";
import { Button } from "@dhis2/ui"; 
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { MenuItem } from "@packages/shared/schemas";
import { SortMenuItems } from "./SortMenuItems"; 

export function SortButton({
    items,
    onSortSubmit, 
}: {
    items: MenuItem[];
    onSortSubmit: (updatedItems: MenuItem[]) => void; 
}) {
    const {
        value: hideModal, 
        setTrue: closeModal,
        setFalse: openModal,
    } = useBoolean(true);

    return (
        <>
            {!hideModal && (  
                <SortMenuItems
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
                {i18n.t("Sort menu items")}
            </Button>
        </>
    );
}