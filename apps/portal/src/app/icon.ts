import { getAppConfigWithNamespace } from "@/utils/config";
import { AppMeta } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { FaviconOptions, favicons } from "favicons";
import { NextResponse } from "next/server";

const faviconOptions: FaviconOptions = {
	icons: {
		favicons: false,
		appleIcon: true,
		android: false,
		windows: false,
		appleStartup: false,
		yandex: false,
	},
};

export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default async function iconGenerator() {
	console.log("Generating icon");
	let config = await getAppConfigWithNamespace<AppMeta>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "metadata",
	});
	if (!config) {
		return null;
	}
	if (!config.icon) {
		return null;
	}

	const icon = await dhis2HttpClient.getRaw(`documents/${config.icon}/data`);
	const iconBuffer = await (await icon.blob()).arrayBuffer();
	const generatedIcons = await favicons(
		Buffer.from(iconBuffer),
		faviconOptions,
	);

	const generatedIcon = generatedIcons.images.find((image) =>
		image.name.includes(".png"),
	);

	return new NextResponse(
		new Blob([generatedIcon?.contents!], { type: "image/png" }),
	);
}
