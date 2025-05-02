import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import {
  FeedbackConfig,
  feedbackSchema,
} from "@packages/shared/schemas";
 
export function AddFeedbackForm({
  feedback,
  hide,
  onClose,
  onSubmit,
}: {
  feedback?: FeedbackConfig;
  hide: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackConfig) => void;
}) {
  const form = useForm<FeedbackConfig>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: feedback || {
      email: "",
    },
  });

  const onAdd = (feedback: FeedbackConfig) => {
    onSubmit(feedback);
    onClose();
  };

  const action = feedback ? "Update" : "Add";

  return (
    <FormProvider {...form}>
      <Modal position="middle" onClose={onClose} hide={hide}>
        <ModalTitle>
          {i18n.t("{{action}} feedback", { action })}
        </ModalTitle>
        <ModalContent>
          <form className="flex flex-col gap-4">
            <RHFTextInputField
              required
              name="email"
              label={i18n.t("Email")}
              type="email"
            />
          </form>
        </ModalContent>
        <ModalActions>
          <ButtonStrip>
            <Button onClick={onClose}>{i18n.t("Cancel")}</Button>
            <Button
              primary
              onClick={(_, e) => form.handleSubmit(onAdd)(e)}
            >
              {i18n.t(action)}
            </Button>
          </ButtonStrip>
        </ModalActions>
      </Modal>
    </FormProvider>
  );
}