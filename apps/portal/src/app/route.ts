import { getAppConfigWithNamespace } from "@/utils/config";
import { AppMenuConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { sortBy } from "lodash";
import { redirect } from "next/navigation";

export async function GET() {
	const menuConfig = await getAppConfigWithNamespace<AppMenuConfig>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "menu",
	});

	const firstMenu = sortBy(menuConfig?.items, "sortOrder")[0];

	if (firstMenu.type === "module") {
		return redirect(firstMenu.path);
	}
	const url = `${firstMenu.path}/${firstMenu.items[0].path}`;
	return redirect(url);
}
