import { useBoolean } from "usehooks-ts";
import { Button } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { StaticItemConfig } from "@packages/shared/schemas";
import { SortItemsForm } from "./SortItemsForm";

export function SortItems({
  items,
  onSortSubmit,
}: {
  items: StaticItemConfig[];
  onSortSubmit: (updatedItems: StaticItemConfig[]) => void;
}) {
  const {
    value: hideModal,
    setTrue: closeModal,
    setFalse: openModal,
  } = useBoolean(true);

  return (
    <>
      {!hideModal && (
        <SortItemsForm
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
        {i18n.t("Sort items")}
      </Button>
    </>
  );
}