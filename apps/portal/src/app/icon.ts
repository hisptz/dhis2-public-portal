import { getAppConfigWithNamespace } from "@/utils/config";
import { AppMeta } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { NextResponse } from "next/server";

export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default async function iconGenerator() {
	let config = await getAppConfigWithNamespace<AppMeta>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "metadata",
	});
	if (!config) {
		return NextResponse.error();
	}
	if (!config.icon) {
		return NextResponse.error();
	}

	const icon = await dhis2HttpClient.getRaw(`documents/${config.icon}/data`);
	return new NextResponse(await icon.blob());
}
