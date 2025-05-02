import React from "react";
import {
  Divider,
} from "@dhis2/ui";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useParams } from "@tanstack/react-router";
import { useSectionNamePrefix } from "../../hooks/route";
import {
  DisplayItem,
  DisplayItemType,
  FeedbackConfig,
  SectionModuleConfig,
} from "@packages/shared/schemas";
import { FeedBackList } from "./components/feeedbackList";
import { AddFeedback } from "./components/AddFeedback/AddFeedback";

export function FeedbackConfigPage() {
  const { sectionIndex } = useParams({
    from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
  });
  const namePrefix = useSectionNamePrefix();

  const { setValue, control } = useFormContext<SectionModuleConfig>();

  const singleItemValue = useWatch({
    name: `config.sections.${sectionIndex}.item`,
  }) as { type: DisplayItemType.FEEDBACK; item: FeedbackConfig[] } | undefined;

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `${namePrefix}.item.items`,
    keyName: "fieldId",
  }) as unknown as {
    fields: FeedbackConfig[];
    append: (value: FeedbackConfig) => void;
    update: (index: number, value: FeedbackConfig) => void;
    remove: (index: number) => void;
  };

  const onAddFeedback = (feedback: FeedbackConfig) => {
    if (!singleItemValue) {
      setValue(`config.sections.${sectionIndex}.item`, {
        type: DisplayItemType.FEEDBACK,
        items: [feedback],
      });
    } else {
      append(feedback);
    }
  };

  const rows: Array<DisplayItem> = fields.length > 0
    ? [
      {
        type: DisplayItemType.FEEDBACK,
        items: fields,
      },
    ]
    : [];

  return (
    <div className="flex-1 w-full flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <AddFeedback onAdd={onAddFeedback} />
      </div>
      <Divider />
      <FeedBackList
        feedbacks={rows}
        onEdit={(feedback, index) => update(index, feedback)}
        onRemove={remove}
      />
    </div>
  );
}