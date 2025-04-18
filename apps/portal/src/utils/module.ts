import { getAppConfigWithNamespace } from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppModule } from "@packages/shared/schemas";

export async function getAppModule(key: string) {
	return await getAppConfigWithNamespace<AppModule>({
		namespace: DatastoreNamespaces.MODULES,
		key,
	});
}
