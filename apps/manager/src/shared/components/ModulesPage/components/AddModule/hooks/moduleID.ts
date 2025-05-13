import { useDataEngine } from "@dhis2/app-runtime";
import { DatastoreNamespaces } from "@packages/shared/constants";

export function useValidateModuleId() {
    const engine = useDataEngine();
  
    const checkIdExists = async (id: string): Promise<boolean> => {
      try {
        const response = await engine.query({
          module: {
            resource: `dataStore/${DatastoreNamespaces.MODULES}/${id}`,
          },
        });
        return !!response.module; 
      } catch (error) {
        return false; 
      }
    };
  
    return { checkIdExists };
  }