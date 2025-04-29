import { useNavigate } from "@tanstack/react-router";
import { useAlert, useDataEngine } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { StaticItemConfig, StaticModule } from "@packages/shared/schemas";
import { useModule, useRefreshModule } from "../../ModulesPage/providers/ModuleProvider";
import { useCallback, useState } from "react";

const updateMutation: any = ({ namespace, id }: { namespace: string; id: string }) => ({
    type: "update",
    resource: `dataStore/${namespace}/${id}`,
    data: ({ data }: { data: StaticItemConfig }) => data,
  });
  
  export function useSaveItem(itemId: string) {
    const engine = useDataEngine();
    const module = useModule() as StaticModule | undefined;
    const refresh = useRefreshModule();
    const navigate = useNavigate();
    const { show } = useAlert(
      ({ message }) => message,
      ({ type }) => ({ ...type, duration: 3000 }),
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    const save = useCallback(
      async (data: StaticItemConfig) => {
        if (!module?.config.namespace) {
          const error = new Error("Namespace not found");
          setError(error);
          show({
            message: i18n.t("Could not save changes: Namespace not found"),
            type: { critical: true },
          });
          throw error;
        }
  
        if (data.id !== itemId) {
          const error = new Error("Data ID does not match item ID");
          setError(error);
          show({
            message: i18n.t("Could not save changes: Invalid item ID"),
            type: { critical: true },
          });
          throw error;
        }
  
        setLoading(true);
        setError(null);
  
        try {
          await engine.mutate(
            updateMutation({
              namespace: module.config.namespace,
              id: itemId,
            }),
            {
              variables: { data },
            },
          );
          await refresh();
          show({
            message: i18n.t("Changes saved successfully"),
            type: { success: true },
          });
          navigate({ to: "/modules" });
        } catch (err) {
          const error = err instanceof Error ? err : new Error("Failed to save item");
          setError(error);
          show({
            message: `${i18n.t("Could not save changes")}: ${error.message}`,
            type: { critical: true },
          });
          throw error;
        } finally {
          setLoading(false);
        }
      },
      [engine, module?.config.namespace, itemId, refresh, navigate, show],
    );
  
    return {
      save,
      loading,
      error,
    };
  }
